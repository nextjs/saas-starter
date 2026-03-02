// src/app/api/cron/sync-emails/route.ts
// Vercel Cron: runs every 15 minutes
// Syncs all active email integrations

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncGmailMessages } from "@/lib/email/gmail";
import { syncOutlookMessages } from "@/lib/email/microsoft";

export const maxDuration = 300; // 5 minutes — Vercel Pro max

export async function GET(req: NextRequest) {
  // Verify this is a legitimate Vercel Cron call
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integrations = await db.emailIntegration.findMany({
    where: { isActive: true },
    select: { id: true, provider: true, workspaceId: true, email: true },
  });

  console.log(`[cron/sync-emails] Syncing ${integrations.length} integrations`);

  const results = await Promise.allSettled(
    integrations.map(async (integration) => {
      const syncFn = integration.provider === "MICROSOFT" ? syncOutlookMessages : syncGmailMessages;
      const result = await syncFn(integration.id);
      console.log(
        `[sync] ${integration.email} (${integration.provider}): ${result.synced}/${result.total} messages`
      );
      return { ...result, integrationId: integration.id };
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  // Log failures
  results
    .filter((r) => r.status === "rejected")
    .forEach((r, i) => {
      console.error(`[sync] Integration ${integrations[i]?.email} failed:`, (r as any).reason);
    });

  return NextResponse.json({
    ok: true,
    total: integrations.length,
    succeeded,
    failed,
    timestamp: new Date().toISOString(),
  });
}
