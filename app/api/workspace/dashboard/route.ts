import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { getDisplayCurrency, convertCurrency } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  // Display currency from query param or user preference
  const { searchParams } = req.nextUrl;
  const displayCurrency =
    searchParams.get("displayCurrency") ??
    (await getDisplayCurrency(workspace.id, member.id));

  const reportingCcy = workspace.reportingCurrency ?? "USD";

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

  // Date range from query params (optional)
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
    // Open deals — fetch individual values for currency conversion
    prisma.opportunity.findMany({
      where: { workspaceId: workspace.id, status: "OPEN", ...ownerFilter },
      select: { value: true, currency: true, valueInReportingCcy: true },
    }),
    // Won deals this period
    prisma.opportunity.findMany({
      where: {
        workspaceId: workspace.id,
        status: "WON",
        ...ownerFilter,
        ...wonDateFilter,
      },
      select: { value: true, currency: true, valueInReportingCcy: true },
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
          select: { value: true, currency: true, valueInReportingCcy: true },
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

  // Helper: sum values converted to display currency
  async function sumConverted(
    items: Array<{ value: unknown; currency: string; valueInReportingCcy: unknown }>
  ): Promise<number> {
    let total = 0;
    for (const item of items) {
      const val = Number(item.value);
      if (item.currency === displayCurrency) {
        total += val;
      } else if (displayCurrency === reportingCcy && item.valueInReportingCcy) {
        total += Number(item.valueInReportingCcy);
      } else {
        total += await convertCurrency(workspace.id, val, item.currency, displayCurrency);
      }
    }
    return total;
  }

  const pipelineValue = await sumConverted(openOpps);
  const wonRevenue = await sumConverted(wonOpps);

  // Calculate weighted forecast with currency conversion
  let weightedForecast = 0;
  const stageData = await Promise.all(
    pipelineByStage.map(async (s) => {
      const stageValue = await sumConverted(s.opportunities);
      weightedForecast += (stageValue * s.probability) / 100;
      return {
        name: s.name,
        color: s.color,
        count: s._count.opportunities,
        value: Math.round(stageValue),
      };
    })
  );

  return NextResponse.json({
    displayCurrency,
    kpis: {
      pipelineValue: Math.round(pipelineValue),
      openDeals: openOpps.length,
      wonRevenue: Math.round(wonRevenue),
      wonDeals: wonOpps.length,
      weightedForecast: Math.round(weightedForecast),
      overdueTaskCount,
    },
    stageData,
    recentActivities,
    topOpportunities,
  });
}
