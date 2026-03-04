import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

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

  const reps = await Promise.all(
    members.map(async (m) => {
      const [won, created, activities, openPipeline] = await Promise.all([
        prisma.opportunity.aggregate({
          where: {
            ownerId: m.id,
            status: "WON",
            ...(hasDateFilter ? { actualCloseDate: dateFilter } : {}),
          },
          _count: true,
          _sum: { value: true },
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
        prisma.opportunity.aggregate({
          where: { ownerId: m.id, status: "OPEN" },
          _sum: { value: true },
        }),
      ]);

      const lost = await prisma.opportunity.count({
        where: {
          ownerId: m.id,
          status: "LOST",
          ...(hasDateFilter ? { actualCloseDate: dateFilter } : {}),
        },
      });

      const winRate = won._count + lost > 0 ? Math.round((won._count / (won._count + lost)) * 100) : 0;

      return {
        memberId: m.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        dealsWon: won._count,
        revenueClosed: Number(won._sum.value ?? 0),
        oppsCreated: created,
        activitiesLogged: activities,
        openPipeline: Number(openPipeline._sum.value ?? 0),
        winRate,
      };
    })
  );

  return NextResponse.json({
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
