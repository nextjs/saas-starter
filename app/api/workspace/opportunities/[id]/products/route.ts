import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const LinkProductSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().optional().nullable(),
});

export async function POST(
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

  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  const body = await req.json();
  const parsed = LinkProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Verify product belongs to same workspace
  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, workspaceId: workspace.id },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const link = await prisma.productOnOpportunity.upsert({
    where: {
      opportunityId_productId: {
        opportunityId: id,
        productId: parsed.data.productId,
      },
    },
    update: { quantity: parsed.data.quantity, notes: parsed.data.notes ?? null },
    create: {
      opportunityId: id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json({ link }, { status: 201 });
}

export async function DELETE(
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

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  await prisma.productOnOpportunity.deleteMany({
    where: { opportunityId: id, productId },
  });

  return NextResponse.json({ ok: true });
}
