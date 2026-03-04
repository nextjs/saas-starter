import { NextResponse } from "next/server";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { getXeroAuthUrl } from "@/lib/integrations/xero";

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Only admins can connect integrations" }, { status: 403 });
  }

  const url = getXeroAuthUrl(workspace.id);
  return NextResponse.json({ url });
}
