// Pipeline stages API — CRUD for customizable stages
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
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

export async function GET(req: NextRequest) {
  const pipelineId = req.nextUrl.searchParams.get("pipelineId");
  if (!pipelineId) return NextResponse.json({ error: "pipelineId required" }, { status: 400 });

  const stages = await db.stage.findMany({
    where: { pipelineId },
    orderBy: { position: "asc" },
    include: { _count: { select: { opportunities: true } } },
  });

  return NextResponse.json({ stages });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pipelineId, ...data } = await req.json();
  const parsed = StageSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const pipeline = await db.pipeline.findUniqueOrThrow({ where: { id: pipelineId } });

  // Verify membership
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: pipeline.workspaceId, userId: session.user.id } },
  });
  if (!member || !["OWNER", "ADMIN", "MANAGER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stage = await db.stage.create({ data: { pipelineId, ...parsed.data } });
  return NextResponse.json({ stage }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  const stage = await db.stage.update({ where: { id }, data });
  return NextResponse.json({ stage });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Check no opportunities are in this stage
  const count = await db.opportunity.count({ where: { stageId: id } });
  if (count > 0) {
    return NextResponse.json({ error: "Cannot delete stage with active opportunities" }, { status: 409 });
  }

  await db.stage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
