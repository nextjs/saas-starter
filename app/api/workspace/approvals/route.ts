import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { fireTrigger } from "@/lib/automation/triggers";
import { z } from "zod";

// GET — list pending approvals for workspace (managers/admins/owners)
export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER", "MANAGER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const approvals = await prisma.stageApproval.findMany({
    where: { workspaceId: workspace.id, status: "PENDING" },
    orderBy: { requestedAt: "desc" },
    include: {
      opportunity: { select: { id: true, name: true, value: true, currency: true, stageId: true, stage: { select: { name: true } } } },
      targetStage: { select: { id: true, name: true } },
      requestedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });

  return NextResponse.json({ approvals });
}

const ReviewSchema = z.object({
  approvalId: z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().optional(),
});

// PATCH — approve or reject an approval
export async function PATCH(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER", "MANAGER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const approval = await prisma.stageApproval.findFirst({
    where: { id: parsed.data.approvalId, workspaceId: workspace.id, status: "PENDING" },
    include: {
      opportunity: { include: { stage: true } },
      targetStage: true,
    },
  });

  if (!approval) {
    return NextResponse.json({ error: "Approval not found or already reviewed" }, { status: 404 });
  }

  if (parsed.data.action === "REJECT") {
    await prisma.stageApproval.update({
      where: { id: approval.id },
      data: {
        status: "REJECTED",
        reviewedById: member.id,
        reviewedAt: new Date(),
        reviewNote: parsed.data.note,
      },
    });

    return NextResponse.json({ status: "REJECTED", message: "Approval request rejected" });
  }

  // APPROVE — execute the stage move
  const opp = approval.opportunity;
  const newStage = approval.targetStage;

  const statusUpdate: Record<string, unknown> = { stageId: newStage.id };
  if (newStage.isWon) {
    statusUpdate.status = "WON";
    statusUpdate.actualCloseDate = new Date();
  } else if (newStage.isLost) {
    statusUpdate.status = "LOST";
    statusUpdate.actualCloseDate = new Date();
  } else if (opp.status !== "OPEN") {
    statusUpdate.status = "OPEN";
    statusUpdate.actualCloseDate = null;
  }

  const updated = await prisma.opportunity.update({
    where: { id: opp.id },
    data: statusUpdate,
    include: { stage: true },
  });

  // Record history, activity, and update the approval
  await Promise.all([
    prisma.stageApproval.update({
      where: { id: approval.id },
      data: {
        status: "APPROVED",
        reviewedById: member.id,
        reviewedAt: new Date(),
        reviewNote: parsed.data.note,
      },
    }),
    prisma.stageHistory.create({
      data: {
        opportunityId: opp.id,
        fromStageId: opp.stageId,
        toStageId: newStage.id,
        movedById: member.id,
      },
    }),
    prisma.activity.create({
      data: {
        workspaceId: workspace.id,
        type: "STAGE_CHANGE",
        title: `Approved move from ${opp.stage.name} to ${newStage.name}`,
        opportunityId: opp.id,
        createdById: member.id,
        isAutomated: false,
      },
    }),
  ]);

  await fireTrigger({
    workspaceId: workspace.id,
    event: "opportunity.stage_changed",
    entityId: opp.id,
    data: {
      opportunityId: opp.id,
      fromStage: opp.stage.name,
      toStage: newStage.name,
      approvedBy: member.id,
    },
    triggeredBy: member.id,
  });

  if (newStage.isWon) {
    await fireTrigger({
      workspaceId: workspace.id,
      event: "opportunity.won",
      entityId: opp.id,
      data: { name: opp.name, value: String(opp.value) },
      triggeredBy: member.id,
    });
  } else if (newStage.isLost) {
    await fireTrigger({
      workspaceId: workspace.id,
      event: "opportunity.lost",
      entityId: opp.id,
      data: { name: opp.name },
      triggeredBy: member.id,
    });
  }

  return NextResponse.json({ status: "APPROVED", opportunity: updated });
}
