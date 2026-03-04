// Cron: daily-maintenance — runs at 07:00 UTC (spec §5.10)
// Handles stale deal flagging and creates notifications

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fireTrigger } from "@/lib/automation/triggers";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let staleFlagged = 0;
  let overdueTasks = 0;

  // 1. Flag stale deals — opportunities where days since last stage change > stage.rottenDays
  const stages = await prisma.stage.findMany({
    where: { rottenDays: { not: null } },
    select: { id: true, name: true, rottenDays: true, pipeline: { select: { workspaceId: true } } },
  });

  for (const stage of stages) {
    if (!stage.rottenDays) continue;
    const cutoff = new Date(Date.now() - stage.rottenDays * 24 * 60 * 60 * 1000);

    const staleOpps = await prisma.opportunity.findMany({
      where: {
        stageId: stage.id,
        status: "OPEN",
        updatedAt: { lt: cutoff },
      },
      select: { id: true, name: true, ownerId: true },
    });

    for (const opp of staleOpps) {
      await fireTrigger({
        workspaceId: stage.pipeline.workspaceId,
        event: "deal.stale",
        entityId: opp.id,
        data: { name: opp.name, stage: stage.name, rottenDays: stage.rottenDays },
        triggeredBy: "system",
      });

      // Create notification for owner
      const member = await prisma.workspaceMember.findUnique({
        where: { id: opp.ownerId },
        select: { userId: true },
      });
      if (member) {
        await prisma.notification.create({
          data: {
            workspaceId: stage.pipeline.workspaceId,
            userId: member.userId,
            type: "STALE_DEAL",
            title: `Stale deal: ${opp.name}`,
            body: `No activity in ${stage.rottenDays} days (${stage.name} stage)`,
            entityId: opp.id,
            entityType: "opportunity",
          },
        });
      }
      staleFlagged++;
    }
  }

  // 2. Create notifications for overdue tasks
  const overdue = await prisma.activity.findMany({
    where: {
      type: "TASK",
      dueAt: { lt: new Date() },
      completedAt: null,
    },
    select: { id: true, title: true, workspaceId: true, assigneeId: true, createdById: true },
  });

  for (const task of overdue) {
    const memberId = task.assigneeId ?? task.createdById;
    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      select: { userId: true },
    });
    if (member) {
      // Only create if no existing unread notification for this task
      const existing = await prisma.notification.findFirst({
        where: { entityId: task.id, entityType: "activity", readAt: null },
      });
      if (!existing) {
        await prisma.notification.create({
          data: {
            workspaceId: task.workspaceId,
            userId: member.userId,
            type: "OVERDUE_TASK",
            title: `Overdue: ${task.title}`,
            entityId: task.id,
            entityType: "activity",
          },
        });
        overdueTasks++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    staleFlagged,
    overdueTasks,
    timestamp: new Date().toISOString(),
  });
}
