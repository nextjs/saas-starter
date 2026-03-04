import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const CreateSchema = z.object({
  fromCurrency: z.string().min(1).max(10),
  toCurrency: z.string().min(1).max(10),
  rate: z.number().positive(),
  effectiveDate: z.string().optional(),
});

export async function GET() {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace } = ctx;

    const exchangeRates = await prisma.exchangeRate.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { effectiveDate: "desc" },
    });

    return NextResponse.json({ exchangeRates });
  } catch (error) {
    console.error("GET /api/workspace/settings/exchange-rates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can manage exchange rates" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { fromCurrency, toCurrency, rate, effectiveDate } = parsed.data;

    const exchangeRate = await prisma.exchangeRate.upsert({
      where: {
        workspaceId_fromCurrency_toCurrency: {
          workspaceId: workspace.id,
          fromCurrency,
          toCurrency,
        },
      },
      update: {
        rate: new Prisma.Decimal(rate),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      },
      create: {
        workspaceId: workspace.id,
        fromCurrency,
        toCurrency,
        rate: new Prisma.Decimal(rate),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      },
    });

    return NextResponse.json({ exchangeRate }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/settings/exchange-rates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can delete exchange rates" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Exchange rate id is required" }, { status: 400 });
    }

    const existing = await prisma.exchangeRate.findFirst({
      where: { id, workspaceId: workspace.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Exchange rate not found" }, { status: 404 });
    }

    await prisma.exchangeRate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspace/settings/exchange-rates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
