// Cron: task-digest — runs at 08:00 UTC (spec §5.10)
// Sends daily task digest emails to workspace members.
// Full implementation in Phase 4.

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Phase 4 — compile and send task digest emails
  return NextResponse.json({ ok: true, message: "task-digest: not yet implemented" });
}
