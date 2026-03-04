import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { fireTrigger } from "@/lib/automation/triggers";
import { convertCurrency } from "@/lib/currency";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  probability: z.number().min(0).max(100).optional().nullable(),
  expectedCloseDate: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  accountId: z.string().optional().nullable(),
  ownerId: z.string().optional(),
  lostReason: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;
  const { id } = await params;

  const opportunity = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      stage: true,
      pipeline: true,
      account: true,
      owner: { include: { user: true } },
      contacts: { include: { contact: true } },
      products: { include: { product: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { createdBy: { include: { user: true } } },
      },
      stageHistory: {
        orderBy: { movedAt: "desc" },
        include: { toStage: true },
      },
      tags: { include: { tag: true } },
    },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ opportunity });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  const existing = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Members can only edit own
  if (member.role === "MEMBER" && existing.ownerId !== member.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;

  // Recalculate reporting currency value if value or currency changed
  let valueInReportingCcy: Prisma.Decimal | undefined;
  const newValue = data.value ?? Number(existing.value);
  const newCurrency = data.currency ?? existing.currency;
  if (data.value !== undefined || data.currency !== undefined) {
    const reportingCcy = workspace.reportingCurrency ?? "USD";
    const converted =
      newCurrency === reportingCcy
        ? newValue
        : await convertCurrency(workspace.id, newValue, newCurrency, reportingCcy);
    valueInReportingCcy = new Prisma.Decimal(converted);
  }

  // Only admin/owner/manager can reassign ownership
  const ownerId =
    data.ownerId && ["ADMIN", "OWNER", "MANAGER"].includes(member.role)
      ? data.ownerId
      : undefined;

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data: {
      name: data.name,
      value: data.value !== undefined ? new Prisma.Decimal(data.value) : undefined,
      currency: data.currency,
      valueInReportingCcy,
      probability: data.probability,
      expectedCloseDate: data.expectedCloseDate !== undefined
        ? data.expectedCloseDate ? new Date(data.expectedCloseDate) : null
        : undefined,
      source: data.source,
      description: data.description,
      priority: data.priority,
      accountId: data.accountId,
      lostReason: data.lostReason,
      ownerId,
    },
    include: { stage: true, account: true },
  });

  await fireTrigger({
    workspaceId: workspace.id,
    event: "opportunity.updated",
    entityId: id,
    data: { changes: data },
    triggeredBy: member.id,
  });

  return NextResponse.json({ opportunity });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Only admins can delete opportunities" }, { status: 403 });
  }

  await prisma.opportunity.deleteMany({
    where: { id, workspaceId: workspace.id },
  });

  return NextResponse.json({ ok: true });
}
