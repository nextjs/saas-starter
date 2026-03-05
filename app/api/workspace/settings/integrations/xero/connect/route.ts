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

  if (!process.env.XERO_CLIENT_ID || !process.env.XERO_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Xero integration is not configured. Set XERO_CLIENT_ID and XERO_CLIENT_SECRET environment variables." },
      { status: 501 }
    );
  }

  const url = getXeroAuthUrl(workspace.id);
  return NextResponse.json({ url });
}
