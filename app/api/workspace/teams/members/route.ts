import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const MemberSchema = z.object({
  teamId: z.string(),
  memberId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can manage team members" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = MemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { teamId, memberId } = parsed.data;

    // Verify team belongs to workspace
    const team = await prisma.salesTeam.findFirst({
      where: { id: teamId, workspaceId: workspace.id },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify member belongs to workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId: workspace.id },
    });
    if (!workspaceMember) {
      return NextResponse.json({ error: "Member not found in this workspace" }, { status: 404 });
    }

    const salesTeamMember = await prisma.salesTeamMember.create({
      data: {
        salesTeamId: teamId,
        memberId,
      },
      include: {
        member: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json({ salesTeamMember }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/teams/members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Only admins and owners can manage team members" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = MemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { teamId, memberId } = parsed.data;

    // Verify team belongs to workspace
    const team = await prisma.salesTeam.findFirst({
      where: { id: teamId, workspaceId: workspace.id },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    await prisma.salesTeamMember.delete({
      where: {
        salesTeamId_memberId: {
          salesTeamId: teamId,
          memberId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspace/teams/members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
