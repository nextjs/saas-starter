import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  // Get all open opportunities with their stages
  const opps = await prisma.opportunity.findMany({
    where: { workspaceId: workspace.id, status: "OPEN" },
    select: {
      value: true,
      currency: true,
      probability: true,
      expectedCloseDate: true,
      stage: { select: { name: true, probability: true, color: true } },
    },
  });

  // Group by stage
  const byStage: Record<string, { name: string; color: string; totalValue: number; weightedValue: number; count: number }> = {};
  for (const opp of opps) {
    const key = opp.stage.name;
    if (!byStage[key]) {
      byStage[key] = { name: key, color: opp.stage.color, totalValue: 0, weightedValue: 0, count: 0 };
    }
    const val = Number(opp.value);
    const prob = opp.probability ?? opp.stage.probability;
    byStage[key].totalValue += val;
    byStage[key].weightedValue += (val * prob) / 100;
    byStage[key].count++;
  }

  // Group by expected close month
  const byMonth: Record<string, { month: string; totalValue: number; weightedValue: number; count: number }> = {};
  for (const opp of opps) {
    const date = opp.expectedCloseDate ?? new Date();
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[month]) {
      byMonth[month] = { month, totalValue: 0, weightedValue: 0, count: 0 };
    }
    const val = Number(opp.value);
    const prob = opp.probability ?? opp.stage.probability;
    byMonth[month].totalValue += val;
    byMonth[month].weightedValue += (val * prob) / 100;
    byMonth[month].count++;
  }

  // Won this month for comparison
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const wonThisMonth = await prisma.opportunity.aggregate({
    where: {
      workspaceId: workspace.id,
      status: "WON",
      actualCloseDate: { gte: monthStart },
    },
    _sum: { value: true },
    _count: true,
  });

  return NextResponse.json({
    byStage: Object.values(byStage),
    byMonth: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
    wonThisMonth: {
      value: Number(wonThisMonth._sum.value ?? 0),
      count: wonThisMonth._count,
    },
    totalForecast: Object.values(byStage).reduce((s, v) => s + v.weightedValue, 0),
    totalPipeline: Object.values(byStage).reduce((s, v) => s + v.totalValue, 0),
  });
}
