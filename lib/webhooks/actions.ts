'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { webhooks, webhookDeliveries } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUserWithTeam } from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { generateWebhookSecret } from './service';

const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

export const createWebhook = validatedActionWithUser(
  createWebhookSchema,
  async (data, _, user) => {
    const { name, url, events } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const secret = generateWebhookSecret();

    const [webhook] = await db
      .insert(webhooks)
      .values({
        teamId: userWithTeam.teamId,
        name,
        url,
        secret,
        events: JSON.stringify(events),
        active: 1,
      })
      .returning();

    return { success: true, webhook: { ...webhook, secret } };
  }
);

export const getWebhooks = validatedActionWithUser(
  z.object({}),
  async (_, __, user) => {
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const webhookList = await db
      .select({
        id: webhooks.id,
        name: webhooks.name,
        url: webhooks.url,
        events: webhooks.events,
        active: webhooks.active,
        lastTriggeredAt: webhooks.lastTriggeredAt,
        createdAt: webhooks.createdAt,
      })
      .from(webhooks)
      .where(eq(webhooks.teamId, userWithTeam.teamId))
      .orderBy(desc(webhooks.createdAt));

    return { success: true, webhooks: webhookList };
  }
);

const toggleWebhookSchema = z.object({
  webhookId: z.number(),
  active: z.boolean(),
});

export const toggleWebhook = validatedActionWithUser(
  toggleWebhookSchema,
  async (data, _, user) => {
    const { webhookId, active } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .update(webhooks)
      .set({ active: active ? 1 : 0, updatedAt: new Date() })
      .where(
        and(eq(webhooks.id, webhookId), eq(webhooks.teamId, userWithTeam.teamId))
      );

    return { success: true };
  }
);

const deleteWebhookSchema = z.object({
  webhookId: z.number(),
});

export const deleteWebhook = validatedActionWithUser(
  deleteWebhookSchema,
  async (data, _, user) => {
    const { webhookId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(webhooks)
      .where(
        and(eq(webhooks.id, webhookId), eq(webhooks.teamId, userWithTeam.teamId))
      );

    return { success: true };
  }
);

const getWebhookDeliveriesSchema = z.object({
  webhookId: z.number(),
});

export const getWebhookDeliveries = validatedActionWithUser(
  getWebhookDeliveriesSchema,
  async (data, _, user) => {
    const { webhookId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    // Verify webhook belongs to user's team
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(
        and(eq(webhooks.id, webhookId), eq(webhooks.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (!webhook) {
      return { error: 'Webhook not found' };
    }

    const deliveries = await db
      .select({
        id: webhookDeliveries.id,
        eventType: webhookDeliveries.eventType,
        responseStatus: webhookDeliveries.responseStatus,
        attemptCount: webhookDeliveries.attemptCount,
        deliveredAt: webhookDeliveries.deliveredAt,
        createdAt: webhookDeliveries.createdAt,
      })
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.webhookId, webhookId))
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(50);

    return { success: true, deliveries };
  }
);
