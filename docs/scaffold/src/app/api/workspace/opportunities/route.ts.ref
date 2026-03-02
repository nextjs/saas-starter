// Opportunities API — list + create
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { z } from "zod";

const CreateOpportunitySchema = z.object({
  workspaceId: z.string(),
  pipelineId: z.string(),
  stageId: z.string(),
  accountId: z.string().optional(),
  name: z.string().min(1),
  value: z.number().default(0),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  source: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const pipelineId = searchParams.get("pipelineId");
  const stageId = searchParams.get("stageId");
  const status = searchParams.get("status");

  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const opportunities = await db.opportunity.findMany({
    where: {
      workspaceId,
      ...(pipelineId && { pipelineId }),
      ...(stageId && { stageId }),
      ...(status && { status: status as any }),
    },
    include: {
      stage: true,
      account: { select: { id: true, name: true, logoUrl: true } },
      owner: { include: { user: { select: { name: true, image: true } } } },
      contacts: { include: { contact: { select: { id: true, firstName: true, lastName: true } } }, take: 3 },
      _count: { select: { activities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ opportunities });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateOpportunitySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;

  // Verify user is a member of this workspace
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const opportunity = await db.opportunity.create({
    data: {
      workspaceId: data.workspaceId,
      pipelineId: data.pipelineId,
      stageId: data.stageId,
      accountId: data.accountId,
      ownerId: member.id,
      name: data.name,
      value: data.value,
      probability: data.probability,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
      source: data.source,
      description: data.description,
      priority: data.priority,
    },
    include: { stage: true, account: true },
  });

  // Log initial stage history
  await db.stageHistory.create({
    data: {
      opportunityId: opportunity.id,
      toStageId: data.stageId,
      movedById: member.id,
    },
  });

  // Log system activity
  await db.activity.create({
    data: {
      workspaceId: data.workspaceId,
      type: "SYSTEM",
      opportunityId: opportunity.id,
      title: `Deal created — ${data.name}`,
      isAutomated: true,
      createdById: member.id,
    },
  });

  return NextResponse.json({ opportunity }, { status: 201 });
}
