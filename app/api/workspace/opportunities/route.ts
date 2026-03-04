import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { fireTrigger } from "@/lib/automation/triggers";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const CreateSchema = z.object({
  pipelineId: z.string(),
  stageId: z.string(),
  accountId: z.string().optional(),
  name: z.string().min(1),
  value: z.number().default(0),
  currency: z.string().default("USD"),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  source: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  const { searchParams } = req.nextUrl;
  const pipelineId = searchParams.get("pipelineId");
  const stageId = searchParams.get("stageId");
  const status = searchParams.get("status");

  // Role-based visibility
  const where: Prisma.OpportunityWhereInput = {
    workspaceId: workspace.id,
    ...(pipelineId && { pipelineId }),
    ...(stageId && { stageId }),
    ...(status && { status: status as Prisma.EnumOppStatusFilter["equals"] }),
  };

  // Members see only own, Managers see team, Admin/Owner see all
  if (member.role === "MEMBER") {
    where.ownerId = member.id;
  } else if (member.role === "MANAGER") {
    const teamMembers = await prisma.salesTeamMember.findMany({
      where: { salesTeam: { managerId: member.id } },
      select: { memberId: true },
    });
    const memberIds = [member.id, ...teamMembers.map((m) => m.memberId)];
    where.ownerId = { in: memberIds };
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: {
      stage: true,
      pipeline: { select: { id: true, name: true } },
      account: { select: { id: true, name: true } },
      owner: { include: { user: { select: { name: true, image: true } } } },
      contacts: {
        include: { contact: { select: { id: true, firstName: true, lastName: true } } },
        take: 3,
      },
      _count: { select: { activities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ opportunities });
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;

  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Viewers cannot create opportunities" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;

  const opportunity = await prisma.opportunity.create({
    data: {
      workspaceId: workspace.id,
      pipelineId: data.pipelineId,
      stageId: data.stageId,
      accountId: data.accountId,
      ownerId: member.id,
      name: data.name,
      value: new Prisma.Decimal(data.value),
      currency: data.currency,
      probability: data.probability,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
      source: data.source,
      description: data.description,
      priority: data.priority,
    },
    include: { stage: true, account: true },
  });

  await prisma.stageHistory.create({
    data: {
      opportunityId: opportunity.id,
      toStageId: data.stageId,
      movedById: member.id,
    },
  });

  await fireTrigger({
    workspaceId: workspace.id,
    event: "opportunity.created",
    entityId: opportunity.id,
    data: { name: data.name, value: data.value },
    triggeredBy: member.id,
  });

  return NextResponse.json({ opportunity }, { status: 201 });
}
