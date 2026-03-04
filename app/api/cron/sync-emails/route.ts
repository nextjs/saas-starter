// Cron: sync-emails — runs every 15 minutes (spec §5.10)
// Full implementation in Phase 4.

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Phase 4 — delta sync for all active EmailIntegrations
  return NextResponse.json({ ok: true, message: "sync-emails: not yet implemented" });
}
