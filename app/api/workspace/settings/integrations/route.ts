import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const integrations = await prisma.emailIntegration.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      provider: true,
      email: true,
      isActive: true,
      lastSyncAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ integrations });
}

const UpdateSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const existing = await prisma.emailIntegration.findUnique({ where: { id: parsed.data.id } });
  if (!existing || existing.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const integration = await prisma.emailIntegration.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  });

  return NextResponse.json({ integration });
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.emailIntegration.findUnique({ where: { id } });
  if (!existing || existing.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.emailIntegration.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
