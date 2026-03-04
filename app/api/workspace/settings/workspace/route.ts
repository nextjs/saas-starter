import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  reportingCurrency: z.string().optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const ws = await prisma.workspace.findUnique({
    where: { id: workspace.id },
    include: {
      allowedDomains: true,
      _count: { select: { members: true, pipelines: true, products: true } },
    },
  });

  return NextResponse.json({ workspace: ws });
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

  const updated = await prisma.workspace.update({
    where: { id: workspace.id },
    data: parsed.data,
  });

  return NextResponse.json({ workspace: updated });
}
