import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { fireTrigger } from "@/lib/automation/triggers";
import { z } from "zod";

const CreateSchema = z.object({
  type: z.enum([
    "NOTE", "CALL", "EMAIL", "MEETING", "TASK", "DEMO",
    "PROPOSAL_SENT", "CONTRACT_SENT", "STAGE_CHANGE", "SYSTEM",
  ]),
  title: z.string().min(1),
  body: z.string().optional().nullable(),
  opportunityId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  dueAt: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const { searchParams } = req.nextUrl;
  const opportunityId = searchParams.get("opportunityId");
  const contactId = searchParams.get("contactId");
  const accountId = searchParams.get("accountId");
  const type = searchParams.get("type");
  const overdue = searchParams.get("overdue");

  const activities = await prisma.activity.findMany({
    where: {
      workspaceId: workspace.id,
      ...(opportunityId && { opportunityId }),
      ...(contactId && { contactId }),
      ...(accountId && { accountId }),
      ...(type && { type: type as "NOTE" }),
      ...(overdue === "true" && {
        type: "TASK",
        dueAt: { lt: new Date() },
        completedAt: null,
      }),
    },
    include: {
      createdBy: { include: { user: { select: { name: true, image: true } } } },
      assignee: { include: { user: { select: { name: true, image: true } } } },
      opportunity: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      account: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ activities });
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

  const data = parsed.data;
  const activity = await prisma.activity.create({
    data: {
      workspaceId: workspace.id,
      type: data.type,
      title: data.title,
      body: data.body,
      opportunityId: data.opportunityId,
      contactId: data.contactId,
      accountId: data.accountId,
      assigneeId: data.assigneeId,
      createdById: member.id,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      duration: data.duration,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
    include: {
      createdBy: { include: { user: true } },
      opportunity: { select: { id: true, name: true } },
    },
  });

  await fireTrigger({
    workspaceId: workspace.id,
    event: "activity.logged",
    entityId: activity.id,
    data: { type: data.type, title: data.title },
    triggeredBy: member.id,
  });

  return NextResponse.json({ activity }, { status: 201 });
}
