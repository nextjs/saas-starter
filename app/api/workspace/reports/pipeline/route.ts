import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { getDisplayCurrency, convertCurrency } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const displayCurrency =
    searchParams.get("displayCurrency") ??
    (await getDisplayCurrency(workspace.id, member.id));

  const dateFilter = {
    ...(from && { gte: new Date(from) }),
    ...(to && { lte: new Date(to) }),
  };
  const hasDateFilter = from || to;

  // Stage funnel with counts and values
  const stages = await prisma.stage.findMany({
    where: { pipeline: { workspaceId: workspace.id } },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
      position: true,
      probability: true,
      opportunities: {
        where: {
          status: "OPEN",
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        select: { value: true, currency: true },
      },
    },
  });

  // Average time in stage from StageHistory
  const stageHistory = await prisma.stageHistory.findMany({
    where: { opportunity: { workspaceId: workspace.id } },
    orderBy: { movedAt: "asc" },
    select: { opportunityId: true, toStageId: true, movedAt: true },
  });

  // Calculate avg time per stage
  const stageTimeMap: Record<string, number[]> = {};
  const oppHistory: Record<string, Array<{ stageId: string; at: Date }>> = {};

  for (const h of stageHistory) {
    if (!oppHistory[h.opportunityId]) oppHistory[h.opportunityId] = [];
    oppHistory[h.opportunityId].push({ stageId: h.toStageId, at: h.movedAt });
  }

  for (const entries of Object.values(oppHistory)) {
    for (let i = 0; i < entries.length - 1; i++) {
      const stageId = entries[i].stageId;
      const days = (entries[i + 1].at.getTime() - entries[i].at.getTime()) / (1000 * 60 * 60 * 24);
      if (!stageTimeMap[stageId]) stageTimeMap[stageId] = [];
      stageTimeMap[stageId].push(days);
    }
  }

  const funnel = await Promise.all(
    stages.map(async (s) => {
      const times = stageTimeMap[s.id] ?? [];
      let value = 0;
      for (const opp of s.opportunities) {
        const val = Number(opp.value);
        value +=
          opp.currency === displayCurrency
            ? val
            : await convertCurrency(workspace.id, val, opp.currency, displayCurrency);
      }
      return {
        name: s.name,
        color: s.color,
        count: s.opportunities.length,
        value: Math.round(value),
        avgDaysInStage: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      };
    })
  );

  return NextResponse.json({ funnel, displayCurrency });
}
