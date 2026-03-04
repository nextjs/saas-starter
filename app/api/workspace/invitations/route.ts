import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const CreateSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"]).default("MEMBER"),
});

export async function GET() {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace } = ctx;

    const invitations = await prisma.invitation.findMany({
      where: {
        workspaceId: workspace.id,
        expiresAt: { gt: new Date() },
        acceptedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("GET /api/workspace/invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can create invitations" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { email, role } = parsed.data;

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        workspaceId: workspace.id,
        email,
        expiresAt: { gt: new Date() },
        acceptedAt: null,
      },
    });
    if (existingInvitation) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 409 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        user: { email },
      },
    });
    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 409 }
      );
    }

    // Set expiresAt to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId: workspace.id,
        email,
        role,
        expiresAt,
      },
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can cancel invitations" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Invitation id is required" }, { status: 400 });
    }

    const existing = await prisma.invitation.findFirst({
      where: { id, workspaceId: workspace.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    await prisma.invitation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspace/invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
