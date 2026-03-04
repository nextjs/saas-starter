import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { z } from "zod";

const UpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "CUSTOMER", "CHURNED"]).optional(),
  leadSource: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      account: true,
      opportunities: {
        include: {
          opportunity: { include: { stage: true, owner: { include: { user: true } } } },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { createdBy: { include: { user: true } } },
      },
    },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ contact });
}

export async function PATCH(
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

  const existing = await prisma.contact.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const contact = await prisma.contact.update({
    where: { id },
    data: parsed.data,
    include: { account: true },
  });

  return NextResponse.json({ contact });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  if (!["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Only admins can delete contacts" }, { status: 403 });
  }

  await prisma.contact.deleteMany({ where: { id, workspaceId: workspace.id } });
  return NextResponse.json({ ok: true });
}
