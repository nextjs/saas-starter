import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const integration = await prisma.xeroIntegration.findUnique({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      tenantName: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    connected: !!integration?.isActive,
    integration,
  });
}

export async function DELETE() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.xeroIntegration.deleteMany({
    where: { workspaceId: workspace.id },
  });

  return NextResponse.json({ ok: true });
}
