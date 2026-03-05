import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const CreateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unitPrice: z.number().default(0),
  currency: z.string().default("USD"),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const products = await prisma.product.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { opportunities: true } } },
  });

  return NextResponse.json({ products });
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

  const data = parsed.data;
  const product = await prisma.product.create({
    data: {
      workspaceId: workspace.id,
      name: data.name,
      sku: data.sku,
      description: data.description,
      category: data.category,
      unitPrice: new Prisma.Decimal(data.unitPrice),
      currency: data.currency,
      isActive: data.isActive,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}

const UpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  sku: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unitPrice: z.number().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
});

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

  const existing = await prisma.product.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Xero-synced products: only allow isActive and category changes locally
  const updateData = existing.source === "xero"
    ? {
        isActive: data.isActive,
        category: data.category,
      }
    : {
        ...data,
        unitPrice: data.unitPrice !== undefined ? new Prisma.Decimal(data.unitPrice) : undefined,
      };

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ product });
}
