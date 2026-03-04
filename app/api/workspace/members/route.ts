import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const UpdateRoleSchema = z.object({
  memberId: z.string(),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"]),
});

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      salesTeams: { include: { salesTeam: { select: { name: true } } } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({ members });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateRoleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const updated = await prisma.workspaceMember.update({
    where: { id: parsed.data.memberId },
    data: { role: parsed.data.role },
    include: { user: true },
  });

  return NextResponse.json({ member: updated });
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memberId = new URL(req.url).searchParams.get("memberId");
  if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target || target.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 403 });
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
