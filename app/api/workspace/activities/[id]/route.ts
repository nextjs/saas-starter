import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  dueAt: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.activity.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;
  const activity = await prisma.activity.update({
    where: { id },
    data: {
      ...data,
      completedAt: data.completedAt !== undefined
        ? data.completedAt ? new Date(data.completedAt) : null
        : undefined,
      dueAt: data.dueAt !== undefined
        ? data.dueAt ? new Date(data.dueAt) : null
        : undefined,
    },
  });

  return NextResponse.json({ activity });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;
  const { id } = await params;

  await prisma.activity.deleteMany({ where: { id, workspaceId: workspace.id } });
  return NextResponse.json({ ok: true });
}
