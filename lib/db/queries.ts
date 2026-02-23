import { desc, and, eq, isNull, sql } from 'drizzle-orm';
import { db } from './drizzle';
import {
  activityLogs,
  creditLedger,
  processedStripeEvents,
  teamMembers,
  teams,
  users,
  workflows,
  workflowRuns,
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

// ===== AUTH QUERIES =====

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

// ===== TEAM QUERIES =====

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.team || null;
}

// ===== CREDIT QUERIES =====

export async function getUserCreditBalance(userId: number): Promise<number> {
  const result = await db
    .select({
      balance: sql<number>`COALESCE(SUM(${creditLedger.amount}), 0)`,
    })
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId));

  return Number(result[0]?.balance ?? 0);
}

export async function createCreditTransaction(data: {
  userId: number;
  type: string;
  amount: number;
  reason: string;
  stripePaymentIntentId?: string;
  relatedRunId?: number;
}) {
  const result = await db
    .insert(creditLedger)
    .values({
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      reason: data.reason,
      stripePaymentIntentId: data.stripePaymentIntentId || null,
      relatedRunId: data.relatedRunId || null,
    })
    .returning();

  return result[0];
}

export async function getUserCreditHistory(userId: number, limit = 20) {
  return await db
    .select()
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId))
    .orderBy(desc(creditLedger.createdAt))
    .limit(limit);
}

// ===== WORKFLOW QUERIES =====

export async function getWorkflows() {
  return await db
    .select()
    .from(workflows)
    .where(eq(workflows.isActive, true))
    .orderBy(workflows.name);
}

export async function getWorkflowBySlug(slug: string) {
  const result = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.slug, slug), eq(workflows.isActive, true)))
    .limit(1);

  return result[0] || null;
}

export async function createWorkflowRun(data: {
  userId: number;
  workflowId: number;
  model?: string;
  input?: Record<string, any>;
}) {
  const result = await db
    .insert(workflowRuns)
    .values({
      userId: data.userId,
      workflowId: data.workflowId,
      status: 'queued',
      model: data.model || null,
      input: data.input || null,
    })
    .returning();

  return result[0];
}

export async function updateWorkflowRun(
  runId: number,
  data: {
    status?: string;
    output?: Record<string, any>;
    n8nExecutionId?: string;
    error?: string;
  }
) {
  await db
    .update(workflowRuns)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(workflowRuns.id, runId));
}

export async function getUserWorkflowRuns(userId: number, limit = 20) {
  return await db
    .select({
      id: workflowRuns.id,
      status: workflowRuns.status,
      model: workflowRuns.model,
      input: workflowRuns.input,
      output: workflowRuns.output,
      error: workflowRuns.error,
      createdAt: workflowRuns.createdAt,
      updatedAt: workflowRuns.updatedAt,
      workflowName: workflows.name,
      workflowSlug: workflows.slug,
      creditCost: workflows.creditCost,
    })
    .from(workflowRuns)
    .innerJoin(workflows, eq(workflowRuns.workflowId, workflows.id))
    .where(eq(workflowRuns.userId, userId))
    .orderBy(desc(workflowRuns.createdAt))
    .limit(limit);
}

export async function getWorkflowRun(runId: number) {
  const result = await db
    .select({
      id: workflowRuns.id,
      userId: workflowRuns.userId,
      workflowId: workflowRuns.workflowId,
      status: workflowRuns.status,
      model: workflowRuns.model,
      input: workflowRuns.input,
      output: workflowRuns.output,
      n8nExecutionId: workflowRuns.n8nExecutionId,
      error: workflowRuns.error,
      createdAt: workflowRuns.createdAt,
      updatedAt: workflowRuns.updatedAt,
      creditCost: workflows.creditCost,
    })
    .from(workflowRuns)
    .innerJoin(workflows, eq(workflowRuns.workflowId, workflows.id))
    .where(eq(workflowRuns.id, runId))
    .limit(1);

  return result[0] || null;
}

// ===== STRIPE EVENT IDEMPOTENCE =====

export async function isStripeEventProcessed(eventId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(processedStripeEvents)
    .where(eq(processedStripeEvents.stripeEventId, eventId))
    .limit(1);

  return result.length > 0;
}

export async function markStripeEventProcessed(eventId: string) {
  await db
    .insert(processedStripeEvents)
    .values({ stripeEventId: eventId })
    .onConflictDoNothing();
}
