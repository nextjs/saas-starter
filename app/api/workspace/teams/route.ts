import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  managerId: z.string(),
});

const UpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  managerId: z.string().optional(),
});

export async function GET() {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace } = ctx;

    const teams = await prisma.salesTeam.findMany({
      where: { workspaceId: workspace.id },
      include: {
        members: {
          include: {
            member: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
          },
        },
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("GET /api/workspace/teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can create teams" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    // Verify managerId is a workspace member
    const manager = await prisma.workspaceMember.findFirst({
      where: { id: parsed.data.managerId, workspaceId: workspace.id },
    });
    if (!manager) {
      return NextResponse.json({ error: "Manager must be a workspace member" }, { status: 400 });
    }

    const team = await prisma.salesTeam.create({
      data: {
        workspaceId: workspace.id,
        name: parsed.data.name,
        managerId: parsed.data.managerId,
      },
      include: {
        members: {
          include: {
            member: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can update teams" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    // Verify team belongs to workspace
    const existing = await prisma.salesTeam.findFirst({
      where: { id: parsed.data.id, workspaceId: workspace.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // If updating manager, verify they are a workspace member
    if (parsed.data.managerId) {
      const manager = await prisma.workspaceMember.findFirst({
        where: { id: parsed.data.managerId, workspaceId: workspace.id },
      });
      if (!manager) {
        return NextResponse.json({ error: "Manager must be a workspace member" }, { status: 400 });
      }
    }

    const team = await prisma.salesTeam.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.managerId !== undefined && { managerId: parsed.data.managerId }),
      },
      include: {
        members: {
          include: {
            member: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error("PATCH /api/workspace/teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can delete teams" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Team id is required" }, { status: 400 });
    }

    const existing = await prisma.salesTeam.findFirst({
      where: { id, workspaceId: workspace.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    await prisma.salesTeam.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspace/teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
