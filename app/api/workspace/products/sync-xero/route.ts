import { NextResponse } from "next/server";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { getXeroToken, syncXeroProducts } from "@/lib/integrations/xero";

export async function POST() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await getXeroToken(workspace.id);
  if (!token) {
    return NextResponse.json(
      { error: "Xero not connected. Connect in Settings > Integrations." },
      { status: 400 }
    );
  }

  const result = await syncXeroProducts(workspace.id, token.accessToken, token.tenantId);

  return NextResponse.json({
    message: `Synced ${result.created} new and ${result.updated} updated products from Xero`,
    ...result,
  });
}
