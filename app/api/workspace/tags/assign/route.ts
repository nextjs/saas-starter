import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const AssignSchema = z.object({
  tagId: z.string(),
  entityType: z.enum(["CONTACT", "CRM_ACCOUNT", "OPPORTUNITY"]),
  entityId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (member.role === "VIEWER") {
      return NextResponse.json({ error: "Viewers cannot assign tags" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = AssignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { tagId, entityType, entityId } = parsed.data;

    // Verify tag belongs to workspace
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, workspaceId: workspace.id },
    });
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Verify entity belongs to workspace and create assignment
    switch (entityType) {
      case "CONTACT": {
        const contact = await prisma.contact.findFirst({
          where: { id: entityId, workspaceId: workspace.id },
        });
        if (!contact) {
          return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }
        await prisma.tagOnContact.create({
          data: { tagId, contactId: entityId },
        });
        break;
      }
      case "CRM_ACCOUNT": {
        const account = await prisma.crmAccount.findFirst({
          where: { id: entityId, workspaceId: workspace.id },
        });
        if (!account) {
          return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }
        await prisma.tagOnCrmAccount.create({
          data: { tagId, crmAccountId: entityId },
        });
        break;
      }
      case "OPPORTUNITY": {
        const opportunity = await prisma.opportunity.findFirst({
          where: { id: entityId, workspaceId: workspace.id },
        });
        if (!opportunity) {
          return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
        }
        await prisma.tagOnOpportunity.create({
          data: { tagId, opportunityId: entityId },
        });
        break;
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/tags/assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireWorkspaceMember();
    if ("error" in ctx) return ctx.error;
    const { workspace, member } = ctx;

    if (member.role === "VIEWER") {
      return NextResponse.json({ error: "Viewers cannot remove tags" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = AssignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { tagId, entityType, entityId } = parsed.data;

    // Verify tag belongs to workspace
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, workspaceId: workspace.id },
    });
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Verify entity belongs to workspace and remove assignment
    switch (entityType) {
      case "CONTACT": {
        const contact = await prisma.contact.findFirst({
          where: { id: entityId, workspaceId: workspace.id },
        });
        if (!contact) {
          return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }
        await prisma.tagOnContact.delete({
          where: { tagId_contactId: { tagId, contactId: entityId } },
        });
        break;
      }
      case "CRM_ACCOUNT": {
        const account = await prisma.crmAccount.findFirst({
          where: { id: entityId, workspaceId: workspace.id },
        });
        if (!account) {
          return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }
        await prisma.tagOnCrmAccount.delete({
          where: { tagId_crmAccountId: { tagId, crmAccountId: entityId } },
        });
        break;
      }
      case "OPPORTUNITY": {
        const opportunity = await prisma.opportunity.findFirst({
          where: { id: entityId, workspaceId: workspace.id },
        });
        if (!opportunity) {
          return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
        }
        await prisma.tagOnOpportunity.delete({
          where: { tagId_opportunityId: { tagId, opportunityId: entityId } },
        });
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspace/tags/assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
