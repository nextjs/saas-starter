import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  // Role-based visibility filter for opportunities
  let ownerFilter: object = {};
  if (member.role === "MEMBER") {
    ownerFilter = { ownerId: member.id };
  } else if (member.role === "MANAGER") {
    const teamIds = member.salesTeams.map((st: { salesTeam: { id: string } }) => st.salesTeam.id);
    if (teamIds.length > 0) {
      const teamMemberIds = await prisma.salesTeamMember.findMany({
        where: { salesTeamId: { in: teamIds } },
        select: { memberId: true },
      });
      const memberIds = [...new Set([member.id, ...teamMemberIds.map((tm) => tm.memberId)])];
      ownerFilter = { ownerId: { in: memberIds } };
    } else {
      ownerFilter = { ownerId: member.id };
    }
  }
  // ADMIN and OWNER see all — no filter

  // Date range from query params (optional)
  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const wonDateFilter = startDate || endDate
    ? {
        actualCloseDate: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }
    : {
        actualCloseDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      };

  const [
    openOpps,
    wonOpps,
    pipelineByStage,
    recentActivities,
    topOpportunities,
    overdueTaskCount,
  ] = await Promise.all([
    // Open deals count + value
    prisma.opportunity.aggregate({
      where: { workspaceId: workspace.id, status: "OPEN", ...ownerFilter },
      _count: true,
      _sum: { value: true },
    }),
    // Won deals this period
    prisma.opportunity.aggregate({
      where: {
        workspaceId: workspace.id,
        status: "WON",
        ...ownerFilter,
        ...wonDateFilter,
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
          where: { status: "OPEN", ...ownerFilter },
          select: { value: true },
        },
      },
    }),
    // Recent activities (scoped by role)
    prisma.activity.findMany({
      where: {
        workspaceId: workspace.id,
        ...(member.role === "MEMBER" ? { createdById: member.id } : {}),
      },
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
      where: { workspaceId: workspace.id, status: "OPEN", ...ownerFilter },
      orderBy: { value: "desc" },
      take: 5,
      include: {
        stage: true,
        account: { select: { name: true } },
        owner: { include: { user: { select: { name: true } } } },
      },
    }),
    // Overdue task count
    prisma.activity.count({
      where: {
        workspaceId: workspace.id,
        type: "TASK",
        completedAt: null,
        dueAt: { lt: new Date() },
        ...(member.role === "MEMBER" ? { assigneeId: member.id } : {}),
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
      overdueTaskCount,
    },
    stageData,
    recentActivities,
    topOpportunities,
  });
}
