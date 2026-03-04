import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { getDisplayCurrency, convertCurrency } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  const displayCurrency =
    req.nextUrl.searchParams.get("displayCurrency") ??
    (await getDisplayCurrency(workspace.id, member.id));

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter = {
    ...(from && { gte: new Date(from) }),
    ...(to && { lte: new Date(to) }),
  };
  const hasDateFilter = from || to;

  // Get members based on role
  let memberFilter: { workspaceId: string; id?: { in: string[] } } = { workspaceId: workspace.id };
  if (member.role === "MEMBER") {
    memberFilter.id = { in: [member.id] };
  } else if (member.role === "MANAGER") {
    const teamMembers = await prisma.salesTeamMember.findMany({
      where: { salesTeam: { managerId: member.id } },
      select: { memberId: true },
    });
    memberFilter.id = { in: [member.id, ...teamMembers.map((m) => m.memberId)] };
  }

  const members = await prisma.workspaceMember.findMany({
    where: memberFilter,
    include: { user: { select: { name: true, email: true, image: true } } },
  });

  // Helper to sum values with currency conversion
  async function sumConverted(opps: Array<{ value: unknown; currency: string }>) {
    let total = 0;
    for (const opp of opps) {
      const val = Number(opp.value);
      total +=
        opp.currency === displayCurrency
          ? val
          : await convertCurrency(workspace.id, val, opp.currency, displayCurrency);
    }
    return Math.round(total);
  }

  const reps = await Promise.all(
    members.map(async (m) => {
      const [wonOpps, created, activities, openOpps, lostCount] = await Promise.all([
        prisma.opportunity.findMany({
          where: {
            ownerId: m.id,
            status: "WON",
            ...(hasDateFilter ? { actualCloseDate: dateFilter } : {}),
          },
          select: { value: true, currency: true },
        }),
        prisma.opportunity.count({
          where: {
            ownerId: m.id,
            ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          },
        }),
        prisma.activity.count({
          where: {
            createdById: m.id,
            isAutomated: false,
            ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          },
        }),
        prisma.opportunity.findMany({
          where: { ownerId: m.id, status: "OPEN" },
          select: { value: true, currency: true },
        }),
        prisma.opportunity.count({
          where: {
            ownerId: m.id,
            status: "LOST",
            ...(hasDateFilter ? { actualCloseDate: dateFilter } : {}),
          },
        }),
      ]);

      const winRate = wonOpps.length + lostCount > 0
        ? Math.round((wonOpps.length / (wonOpps.length + lostCount)) * 100)
        : 0;

      return {
        memberId: m.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        dealsWon: wonOpps.length,
        revenueClosed: await sumConverted(wonOpps),
        oppsCreated: created,
        activitiesLogged: activities,
        openPipeline: await sumConverted(openOpps),
        winRate,
      };
    })
  );

  return NextResponse.json({
    displayCurrency,
    reps,
    totals: {
      dealsWon: reps.reduce((s, r) => s + r.dealsWon, 0),
      revenueClosed: reps.reduce((s, r) => s + r.revenueClosed, 0),
      oppsCreated: reps.reduce((s, r) => s + r.oppsCreated, 0),
      activitiesLogged: reps.reduce((s, r) => s + r.activitiesLogged, 0),
      openPipeline: reps.reduce((s, r) => s + r.openPipeline, 0),
    },
  });
}
