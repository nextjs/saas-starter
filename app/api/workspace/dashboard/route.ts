import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const [
    openOpps,
    wonOpps,
    pipelineByStage,
    recentActivities,
    topOpportunities,
  ] = await Promise.all([
    // Open deals count + value
    prisma.opportunity.aggregate({
      where: { workspaceId: workspace.id, status: "OPEN" },
      _count: true,
      _sum: { value: true },
    }),
    // Won deals this period
    prisma.opportunity.aggregate({
      where: {
        workspaceId: workspace.id,
        status: "WON",
        actualCloseDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _count: true,
      _sum: { value: true },
    }),
    // Pipeline by stage
    prisma.stage.findMany({
      where: { pipeline: { workspaceId: workspace.id } },
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
        probability: true,
        _count: { select: { opportunities: true } },
        opportunities: {
          where: { status: "OPEN" },
          select: { value: true },
        },
      },
    }),
    // Recent activities
    prisma.activity.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        createdBy: { include: { user: { select: { name: true, image: true } } } },
        opportunity: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    // Top open opportunities
    prisma.opportunity.findMany({
      where: { workspaceId: workspace.id, status: "OPEN" },
      orderBy: { value: "desc" },
      take: 5,
      include: {
        stage: true,
        account: { select: { name: true } },
        owner: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  // Calculate weighted forecast
  const weightedForecast = pipelineByStage.reduce((acc, stage) => {
    const stageValue = stage.opportunities.reduce(
      (sum, opp) => sum + Number(opp.value),
      0
    );
    return acc + (stageValue * stage.probability) / 100;
  }, 0);

  const stageData = pipelineByStage.map((s) => ({
    name: s.name,
    color: s.color,
    count: s._count.opportunities,
    value: s.opportunities.reduce((sum, opp) => sum + Number(opp.value), 0),
  }));

  return NextResponse.json({
    kpis: {
      pipelineValue: Number(openOpps._sum.value ?? 0),
      openDeals: openOpps._count,
      wonRevenue: Number(wonOpps._sum.value ?? 0),
      wonDeals: wonOpps._count,
      weightedForecast: Math.round(weightedForecast),
    },
    stageData,
    recentActivities,
    topOpportunities,
  });
}
