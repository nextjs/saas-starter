// src/lib/email/shared.ts
// Shared email utilities — contact matching, activity creation

import { db } from "@/lib/db";
import type { ActivityType } from "@prisma/client";

// Match a contact by email, return IDs for activity linking
export async function matchContactByEmail(
  workspaceId: string,
  email: string
): Promise<{ contactId: string | null; opportunityId: string | null }> {
  const contact = await db.contact.findFirst({
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

// Create a CRM activity entry
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
  return db.activity.create({
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
      metadata: data.metadata,
      completedAt: new Date(),
    },
  });
}
