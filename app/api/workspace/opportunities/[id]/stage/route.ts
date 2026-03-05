import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { fireTrigger } from "@/lib/automation/triggers";
import { checkStageRequirements } from "@/lib/stage-requirements";
import { z } from "zod";

const MoveSchema = z.object({
  stageId: z.string(),
  lostReason: z.string().optional(),
  forceWithApproval: z.boolean().optional(),
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

  // ─── Check stage requirements ──────────────────────────────────────────
  const checks = await checkStageRequirements(id, newStage.id);
  const unmet = checks.filter((c) => !c.met);

  if (unmet.length > 0 && !parsed.data.forceWithApproval) {
    // Always show unmet requirements on first attempt for all roles
    const canOverride = ["ADMIN", "OWNER", "MANAGER"].includes(member.role);

    return NextResponse.json({
      blocked: true,
      canOverride,
      unmetRequirements: unmet,
      allRequirements: checks,
      message: "Cannot advance to this stage — requirements not met.",
    }, { status: 422 });
  }

  if (unmet.length > 0 && parsed.data.forceWithApproval) {
    const canOverride = ["ADMIN", "OWNER", "MANAGER"].includes(member.role);

    if (canOverride) {
      // Admin/Owner/Manager: proceed with override (falls through to stage move below)
    } else {
      // Member: create an approval request
      const existing = await prisma.stageApproval.findFirst({
        where: {
          opportunityId: id,
          targetStageId: newStage.id,
          status: "PENDING",
        },
      });

      if (existing) {
        return NextResponse.json({
          requiresApproval: true,
          approvalId: existing.id,
          unmetRequirements: unmet,
          message: "An approval request is already pending for this stage move.",
        }, { status: 202 });
      }

      const approval = await prisma.stageApproval.create({
        data: {
          workspaceId: workspace.id,
          opportunityId: id,
          targetStageId: newStage.id,
          requestedById: member.id,
          unmetRequirements: JSON.parse(JSON.stringify(unmet)),
        },
      });

      return NextResponse.json({
        requiresApproval: true,
        approvalId: approval.id,
        unmetRequirements: unmet,
        message: "Stage move requires approval. A request has been submitted to your manager or admin.",
      }, { status: 202 });
    }
  }

  // ─── Proceed with stage move ──────────────────────────────────────────
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
    statusUpdate.status = "OPEN";
    statusUpdate.actualCloseDate = null;
  }

  // Update opportunity
  const updated = await prisma.opportunity.update({
    where: { id },
    data: statusUpdate,
    include: { stage: true },
  });

  // Record stage history + activity + resolve pending approvals in parallel
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
    prisma.stageApproval.updateMany({
      where: {
        opportunityId: id,
        targetStageId: newStage.id,
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
        reviewedById: member.id,
        reviewedAt: new Date(),
        reviewNote: "Auto-resolved: stage move completed",
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

  if (newStage.isWon) {
    await fireTrigger({
      workspaceId: workspace.id,
      event: "opportunity.won",
      entityId: id,
      data: { name: opportunity.name, value: String(opportunity.value) },
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
