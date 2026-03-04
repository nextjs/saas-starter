import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { fireTrigger } from "@/lib/automation/triggers";
import { z } from "zod";

const MoveSchema = z.object({
  stageId: z.string(),
  lostReason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = MoveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const opportunity = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { stage: true },
  });
  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Members can only move own
  if (member.role === "MEMBER" && opportunity.ownerId !== member.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const newStage = await prisma.stage.findUnique({ where: { id: parsed.data.stageId } });
  if (!newStage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  // Determine status change based on stage type
  const statusUpdate: Record<string, unknown> = { stageId: newStage.id };
  if (newStage.isWon) {
    statusUpdate.status = "WON";
    statusUpdate.actualCloseDate = new Date();
  } else if (newStage.isLost) {
    statusUpdate.status = "LOST";
    statusUpdate.actualCloseDate = new Date();
    if (parsed.data.lostReason) statusUpdate.lostReason = parsed.data.lostReason;
  } else if (opportunity.status !== "OPEN") {
    // Moving back to a normal stage reopens the deal
    statusUpdate.status = "OPEN";
    statusUpdate.actualCloseDate = null;
  }

  // Update opportunity
  const updated = await prisma.opportunity.update({
    where: { id },
    data: statusUpdate,
    include: { stage: true },
  });

  // Record stage history + activity in parallel
  await Promise.all([
    prisma.stageHistory.create({
      data: {
        opportunityId: id,
        fromStageId: opportunity.stageId,
        toStageId: newStage.id,
        movedById: member.id,
      },
    }),
    prisma.activity.create({
      data: {
        workspaceId: workspace.id,
        type: "STAGE_CHANGE",
        title: `Moved from ${opportunity.stage.name} to ${newStage.name}`,
        opportunityId: id,
        createdById: member.id,
        isAutomated: false,
      },
    }),
  ]);

  // Fire stage change trigger
  await fireTrigger({
    workspaceId: workspace.id,
    event: "opportunity.stage_changed",
    entityId: id,
    data: {
      opportunityId: id,
      fromStage: opportunity.stage.name,
      toStage: newStage.name,
    },
    triggeredBy: member.id,
  });

  // Handle Won/Lost triggers
  if (newStage.isWon) {
    await fireTrigger({
      workspaceId: workspace.id,
      event: "opportunity.won",
      entityId: id,
      data: { name: opportunity.name, value: opportunity.value.toString() },
      triggeredBy: member.id,
    });
  } else if (newStage.isLost) {
    await fireTrigger({
      workspaceId: workspace.id,
      event: "opportunity.lost",
      entityId: id,
      data: { name: opportunity.name, reason: parsed.data.lostReason },
      triggeredBy: member.id,
    });
  }

  return NextResponse.json({ opportunity: updated });
}
