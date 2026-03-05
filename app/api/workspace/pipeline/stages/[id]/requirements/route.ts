import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const CreateSchema = z.object({
  type: z.enum(["DOCUMENT", "CUSTOM_FIELD", "PRODUCT", "QUOTE"]),
  label: z.string().min(1),
  config: z.record(z.unknown()).optional(),
});

const UpdateSchema = z.object({
  id: z.string(),
  label: z.string().min(1).optional(),
  config: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
  position: z.number().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;
  const { id: stageId } = await params;

  // Verify the stage belongs to this workspace
  const stage = await prisma.stage.findFirst({
    where: { id: stageId, pipeline: { workspaceId: workspace.id } },
  });
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  const requirements = await prisma.stageRequirement.findMany({
    where: { stageId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ requirements });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id: stageId } = await params;

  if (!["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stage = await prisma.stage.findFirst({
    where: { id: stageId, pipeline: { workspaceId: workspace.id } },
  });
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Get the next position
  const maxPos = await prisma.stageRequirement.aggregate({
    where: { stageId },
    _max: { position: true },
  });

  const requirement = await prisma.stageRequirement.create({
    data: {
      stageId,
      type: parsed.data.type,
      label: parsed.data.label,
      config: parsed.data.config ? JSON.parse(JSON.stringify(parsed.data.config)) : undefined,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });

  return NextResponse.json({ requirement }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id: stageId } = await params;

  if (!["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stage = await prisma.stage.findFirst({
    where: { id: stageId, pipeline: { workspaceId: workspace.id } },
  });
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { id, config, ...rest } = parsed.data;

  const requirement = await prisma.stageRequirement.update({
    where: { id },
    data: {
      ...rest,
      ...(config !== undefined && { config: JSON.parse(JSON.stringify(config)) }),
    },
  });

  return NextResponse.json({ requirement });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id: stageId } = await params;

  if (!["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stage = await prisma.stage.findFirst({
    where: { id: stageId, pipeline: { workspaceId: workspace.id } },
  });
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  const requirementId = req.nextUrl.searchParams.get("requirementId");
  if (!requirementId) {
    return NextResponse.json({ error: "requirementId required" }, { status: 400 });
  }

  await prisma.stageRequirement.delete({ where: { id: requirementId } });

  return NextResponse.json({ ok: true });
}
