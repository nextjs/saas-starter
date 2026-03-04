// Cron: sync-emails — runs every 15 minutes (spec §5.10)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncOutlookMessages } from "@/lib/email/microsoft";

export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integrations = await prisma.emailIntegration.findMany({
    where: { isActive: true },
    select: { id: true, provider: true, email: true },
  });

  console.log(`[cron/sync-emails] Syncing ${integrations.length} integrations`);

  const results = await Promise.allSettled(
    integrations.map(async (integration) => {
      if (integration.provider !== "MICROSOFT") return { synced: 0, total: 0 };
      const result = await syncOutlookMessages(integration.id);
      console.log(`[sync] ${integration.email}: ${result.synced}/${result.total} messages`);
      return result;
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  results
    .filter((r) => r.status === "rejected")
    .forEach((r, i) => {
      console.error(`[sync] ${integrations[i]?.email} failed:`, (r as PromiseRejectedResult).reason);
    });

  return NextResponse.json({
    ok: true,
    total: integrations.length,
    succeeded,
    failed,
    timestamp: new Date().toISOString(),
  });
}
