import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { fireTrigger } from "@/lib/automation/triggers";
import { z } from "zod";

const CreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "CUSTOMER", "CHURNED"]).default("ACTIVE"),
  leadSource: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const { searchParams } = req.nextUrl;
  const accountId = searchParams.get("accountId");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const contacts = await prisma.contact.findMany({
    where: {
      workspaceId: workspace.id,
      ...(accountId && { accountId }),
      ...(status && { status: status as "ACTIVE" }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    },
    include: {
      account: { select: { id: true, name: true } },
      _count: { select: { opportunities: true, activities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const contact = await prisma.contact.create({
    data: { workspaceId: workspace.id, ...parsed.data },
    include: { account: true },
  });

  await fireTrigger({
    workspaceId: workspace.id,
    event: "contact.created",
    entityId: contact.id,
    data: { name: `${contact.firstName} ${contact.lastName}` },
    triggeredBy: member.id,
  });

  return NextResponse.json({ contact }, { status: 201 });
}
