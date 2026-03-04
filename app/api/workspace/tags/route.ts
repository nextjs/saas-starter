import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  color: z.string().default("#6b7280"),
});

const UpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  color: z.string().optional(),
});

export async function GET() {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace } = ctx;

    const tags = await prisma.tag.findMany({
      where: { workspaceId: workspace.id },
      include: {
        _count: {
          select: {
            contacts: true,
            crmAccounts: true,
            opportunities: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("GET /api/workspace/tags error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (member.role === "VIEWER") {
      return NextResponse.json({ error: "Viewers cannot create tags" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const tag = await prisma.tag.create({
      data: {
        workspaceId: workspace.id,
        name: parsed.data.name,
        color: parsed.data.color,
      },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/tags error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (member.role === "VIEWER") {
      return NextResponse.json({ error: "Viewers cannot update tags" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    // Verify tag belongs to workspace
    const existing = await prisma.tag.findFirst({
      where: { id: parsed.data.id, workspaceId: workspace.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const tag = await prisma.tag.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.color !== undefined && { color: parsed.data.color }),
      },
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("PATCH /api/workspace/tags error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (member.role === "VIEWER") {
      return NextResponse.json({ error: "Viewers cannot delete tags" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Tag id is required" }, { status: 400 });
    }

    // Verify tag belongs to workspace and check usage
    const existing = await prisma.tag.findFirst({
      where: { id, workspaceId: workspace.id },
      include: {
        _count: {
          select: {
            contacts: true,
            crmAccounts: true,
            opportunities: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const totalUsage =
      existing._count.contacts +
      existing._count.crmAccounts +
      existing._count.opportunities;

    if (totalUsage > 0) {
      return NextResponse.json(
        { error: "Cannot delete tag that is attached to entities. Remove all assignments first." },
        { status: 409 }
      );
    }

    await prisma.tag.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspace/tags error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
