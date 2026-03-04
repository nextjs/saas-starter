// Shared email utilities — contact matching, activity creation

import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@prisma/client";

export async function matchContactByEmail(
  workspaceId: string,
  email: string
): Promise<{ contactId: string | null; opportunityId: string | null }> {
  const contact = await prisma.contact.findFirst({
    where: { workspaceId, email: { equals: email, mode: "insensitive" } },
    include: {
      opportunities: {
        where: { opportunity: { status: "OPEN" } },
        include: { opportunity: true },
        orderBy: { opportunity: { updatedAt: "desc" } },
        take: 1,
      },
    },
  });

  return {
    contactId: contact?.id ?? null,
    opportunityId: contact?.opportunities[0]?.opportunity.id ?? null,
  };
}

export async function createActivity(data: {
  workspaceId: string;
  type: ActivityType;
  title: string;
  body?: string;
  contactId?: string | null;
  opportunityId?: string | null;
  accountId?: string | null;
  emailThreadId?: string | null;
  isAutomated?: boolean;
  createdById: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.activity.create({
    data: {
      workspaceId: data.workspaceId,
      type: data.type,
      title: data.title,
      body: data.body,
      contactId: data.contactId,
      opportunityId: data.opportunityId,
      accountId: data.accountId,
      emailThreadId: data.emailThreadId,
      isAutomated: data.isAutomated ?? false,
      createdById: data.createdById,
      metadata: data.metadata as object,
      completedAt: new Date(),
    },
  });
}
