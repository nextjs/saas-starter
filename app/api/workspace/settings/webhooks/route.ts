import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";
import { randomBytes } from "crypto";

const CreateSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

const UpdateSchema = z.object({
  id: z.string(),
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const webhooks = await prisma.webhook.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ webhooks });
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const webhook = await prisma.webhook.create({
    data: {
      workspaceId: workspace.id,
      url: parsed.data.url,
      events: parsed.data.events,
      secret: randomBytes(32).toString("hex"),
    },
  });

  return NextResponse.json({ webhook }, { status: 201 });
}

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

  const { id, ...data } = parsed.data;
  const existing = await prisma.webhook.findUnique({ where: { id } });
  if (!existing || existing.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const webhook = await prisma.webhook.update({ where: { id }, data });
  return NextResponse.json({ webhook });
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

  const existing = await prisma.webhook.findUnique({ where: { id } });
  if (!existing || existing.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.webhook.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
