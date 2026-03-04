import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const CreateSchema = z.object({
  entity: z.enum(["CONTACT", "CRM_ACCOUNT", "OPPORTUNITY"]),
  name: z.string().min(1),
  key: z.string().min(1),
  type: z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTI_SELECT", "URL"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
});

const UpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export async function GET() {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace } = ctx;

    const customFields = await prisma.customField.findMany({
      where: { workspaceId: workspace.id },
      orderBy: [{ entity: "asc" }, { position: "asc" }],
    });

    return NextResponse.json({ customFields });
  } catch (error) {
    console.error("GET /api/workspace/custom-fields error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can create custom fields" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { entity, name, key, type, options, required } = parsed.data;

    // Auto-calculate position as max+1 for the entity
    const maxPosition = await prisma.customField.aggregate({
      where: { workspaceId: workspace.id, entity },
      _max: { position: true },
    });
    const position = (maxPosition._max.position ?? -1) + 1;

    const customField = await prisma.customField.create({
      data: {
        workspaceId: workspace.id,
        entity,
        name,
        key,
        type,
        options: options ?? [],
        required,
        position,
      },
    });

    return NextResponse.json({ customField }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/custom-fields error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can update custom fields" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { id, name, options, required, position } = parsed.data;

    // Verify field belongs to workspace
    const existing = await prisma.customField.findFirst({
      where: { id, workspaceId: workspace.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Custom field not found" }, { status: 404 });
    }

    const customField = await prisma.customField.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(options !== undefined && { options }),
        ...(required !== undefined && { required }),
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json({ customField });
  } catch (error) {
    console.error("PATCH /api/workspace/custom-fields error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can delete custom fields" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Custom field id is required" }, { status: 400 });
    }

    const existing = await prisma.customField.findFirst({
      where: { id, workspaceId: workspace.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Custom field not found" }, { status: 404 });
    }

    // Cascade delete of values is handled by Prisma relation onDelete: Cascade
    await prisma.customField.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspace/custom-fields error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
