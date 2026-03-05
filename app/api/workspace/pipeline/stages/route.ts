import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const StageSchema = z.object({
  name: z.string().min(1),
  position: z.number(),
  probability: z.number().min(0).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  isWon: z.boolean().default(false),
  isLost: z.boolean().default(false),
  rottenDays: z.number().nullable().optional(),
});

const ReorderSchema = z.object({
  stages: z.array(z.object({ id: z.string(), position: z.number() })),
});

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const pipelineId = req.nextUrl.searchParams.get("pipelineId");

  const where = pipelineId
    ? { pipelineId, pipeline: { workspaceId: workspace.id } }
    : { pipeline: { workspaceId: workspace.id } };

  const stages = await prisma.stage.findMany({
    where,
    orderBy: { position: "asc" },
    include: {
      _count: { select: { opportunities: true } },
      pipeline: { select: { id: true, name: true } },
      requirements: { where: { isActive: true }, orderBy: { position: "asc" } },
    },
  });

  return NextResponse.json({ stages });
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { member } = ctx;

  if (!["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { pipelineId, ...rest } = body;
  const parsed = StageSchema.safeParse(rest);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const stage = await prisma.stage.create({ data: { pipelineId, ...parsed.data } });
  return NextResponse.json({ stage }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { member } = ctx;

  if (!["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  await prisma.$transaction(
    parsed.data.stages.map((s) =>
      prisma.stage.update({ where: { id: s.id }, data: { position: s.position } })
    )
  );

  return NextResponse.json({ ok: true });
}
