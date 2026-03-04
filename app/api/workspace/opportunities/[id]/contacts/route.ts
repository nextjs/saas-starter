import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const LinkContactSchema = z.object({
  contactId: z.string().min(1),
  role: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  const body = await req.json();
  const parsed = LinkContactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Verify contact belongs to same workspace
  const contact = await prisma.contact.findFirst({
    where: { id: parsed.data.contactId, workspaceId: workspace.id },
  });
  if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const link = await prisma.contactOnOpportunity.upsert({
    where: {
      opportunityId_contactId: {
        opportunityId: id,
        contactId: parsed.data.contactId,
      },
    },
    update: { role: parsed.data.role ?? null },
    create: {
      opportunityId: id,
      contactId: parsed.data.contactId,
      role: parsed.data.role ?? null,
    },
  });

  return NextResponse.json({ link }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contactId = req.nextUrl.searchParams.get("contactId");
  if (!contactId) return NextResponse.json({ error: "contactId required" }, { status: 400 });

  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  await prisma.contactOnOpportunity.deleteMany({
    where: { opportunityId: id, contactId },
  });

  return NextResponse.json({ ok: true });
}
