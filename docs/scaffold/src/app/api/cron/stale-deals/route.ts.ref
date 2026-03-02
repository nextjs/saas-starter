// src/app/api/cron/stale-deals/route.ts
// Vercel Cron: runs daily at 08:00 Amsterdam time
// Creates system activities for deals with no activity in N days

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all open opportunities with a rotten threshold (via stage.rottenDays)
  const opportunities = await db.opportunity.findMany({
    where: { status: "OPEN" },
    include: {
      stage: true,
      activities: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  let alertsCreated = 0;

  for (const opp of opportunities) {
    const rottenDays = opp.stage.rottenDays;
    if (!rottenDays) continue;

    const lastActivity = opp.activities[0];
    const refDate = lastActivity?.createdAt ?? opp.createdAt;
    const daysSince = Math.floor((Date.now() - refDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince >= rottenDays) {
      // Check if we already alerted recently (within 24h) to avoid spam
      const recentAlert = await db.activity.findFirst({
        where: {
          opportunityId: opp.id,
          type: "SYSTEM",
          title: { contains: "stale" },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!recentAlert) {
        await db.activity.create({
          data: {
            workspaceId: opp.workspaceId,
            type: "SYSTEM",
            opportunityId: opp.id,
            title: `⚠️ Deal stale — no activity for ${daysSince} days`,
            body: `This deal has been in "${opp.stage.name}" for ${daysSince} days without any logged activity. Consider reaching out.`,
            isAutomated: true,
            createdById: "system",
            metadata: { daysSince, stageName: opp.stage.name },
          },
        });
        alertsCreated++;
      }
    }
  }

  return NextResponse.json({ ok: true, checked: opportunities.length, alertsCreated });
}
