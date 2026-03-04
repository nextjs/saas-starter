import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  probability: z.number().min(0).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
  rottenDays: z.number().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { member } = ctx;
  const { id } = await params;

  if (!["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const stage = await prisma.stage.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ stage });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { member } = ctx;
  const { id } = await params;

  if (!["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const count = await prisma.opportunity.count({ where: { stageId: id } });
  if (count > 0) {
    return NextResponse.json({ error: "Cannot delete stage with active opportunities" }, { status: 409 });
  }

  await prisma.stage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
