import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { member, workspace } = ctx;

  return NextResponse.json({
    displayCurrency: member.displayCurrency ?? workspace.reportingCurrency ?? "USD",
    reportingCurrency: workspace.reportingCurrency ?? "USD",
  });
}

const UpdateSchema = z.object({
  displayCurrency: z.string().min(3).max(3),
});

export async function PATCH(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { member } = ctx;

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const updated = await prisma.workspaceMember.update({
    where: { id: member.id },
    data: { displayCurrency: parsed.data.displayCurrency },
  });

  return NextResponse.json({ displayCurrency: updated.displayCurrency });
}
