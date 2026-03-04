import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const CreateSchema = z.object({
  memberId: z.string(),
  period: z.string().min(1),
  periodType: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]),
  revenueTarget: z.number().min(0),
  opportunityTarget: z.number().int().min(0),
  activityTarget: z.number().int().min(0),
  currency: z.string().default("USD"),
});

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const targets = await prisma.salesTarget.findMany({
    where: { workspaceId: workspace.id },
    orderBy: [{ period: "desc" }, { memberId: "asc" }],
  });

  return NextResponse.json({ targets });
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

  const target = await prisma.salesTarget.upsert({
    where: {
      workspaceId_memberId_period: {
        workspaceId: workspace.id,
        memberId: parsed.data.memberId,
        period: parsed.data.period,
      },
    },
    update: {
      revenueTarget: parsed.data.revenueTarget,
      opportunityTarget: parsed.data.opportunityTarget,
      activityTarget: parsed.data.activityTarget,
      periodType: parsed.data.periodType,
      currency: parsed.data.currency,
    },
    create: {
      workspaceId: workspace.id,
      ...parsed.data,
    },
  });

  return NextResponse.json({ target }, { status: 201 });
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

  const target = await prisma.salesTarget.findUnique({ where: { id } });
  if (!target || target.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.salesTarget.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
