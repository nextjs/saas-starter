import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace } = ctx;

    const { searchParams } = req.nextUrl;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build opportunity filter: only OPEN or WON, within date range if provided
    const opportunityFilter: Record<string, unknown> = {
      workspaceId: workspace.id,
      status: { in: ["OPEN", "WON"] },
    };

    if (startDate || endDate) {
      opportunityFilter.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    // Get all product-opportunity links with their product and opportunity data
    const productLinks = await prisma.productOnOpportunity.findMany({
      where: {
        opportunity: opportunityFilter,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            sku: true,
          },
        },
        opportunity: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    // Group by product and calculate aggregates
    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        category: string | null;
        sku: string | null;
        dealCount: number;
        totalValue: number;
      }
    >();

    for (const link of productLinks) {
      const existing = productMap.get(link.product.id);
      const oppValue = Number(link.opportunity.value);

      if (existing) {
        existing.dealCount += 1;
        existing.totalValue += oppValue;
      } else {
        productMap.set(link.product.id, {
          productId: link.product.id,
          productName: link.product.name,
          category: link.product.category,
          sku: link.product.sku,
          dealCount: 1,
          totalValue: oppValue,
        });
      }
    }

    const products = Array.from(productMap.values()).map((p) => ({
      ...p,
      avgDealSize: p.dealCount > 0 ? p.totalValue / p.dealCount : 0,
    }));

    // Sort by total value descending
    products.sort((a, b) => b.totalValue - a.totalValue);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/workspace/reports/products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
