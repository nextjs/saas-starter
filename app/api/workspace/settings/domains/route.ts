import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const CreateSchema = z.object({
  domain: z.string().min(1),
  isInternal: z.boolean().default(false),
});

export async function GET() {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace } = ctx;

    const domains = await prisma.allowedDomain.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { domain: "asc" },
    });

    return NextResponse.json({ domains });
  } catch (error) {
    console.error("GET /api/workspace/settings/domains error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can manage domains" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const domain = await prisma.allowedDomain.create({
      data: {
        workspaceId: workspace.id,
        domain: parsed.data.domain,
        isInternal: parsed.data.isInternal,
      },
    });

    return NextResponse.json({ domain }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/settings/domains error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can delete domains" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Domain id is required" }, { status: 400 });
    }

    const existing = await prisma.allowedDomain.findFirst({
      where: { id, workspaceId: workspace.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    await prisma.allowedDomain.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspace/settings/domains error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
