import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { fireTrigger } from "@/lib/automation/triggers";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  size: z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional().nullable(),
  website: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  annualRevenue: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search");

  const accounts = await prisma.crmAccount.findMany({
    where: {
      workspaceId: workspace.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { domain: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    },
    include: {
      _count: { select: { contacts: true, opportunities: true, activities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ accounts });
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

  const account = await prisma.crmAccount.create({
    data: { workspaceId: workspace.id, ...parsed.data },
  });

  await fireTrigger({
    workspaceId: workspace.id,
    event: "account.created",
    entityId: account.id,
    data: { name: account.name },
    triggeredBy: member.id,
  });

  return NextResponse.json({ account }, { status: 201 });
}
