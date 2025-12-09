import { createHmac, randomBytes } from 'crypto';
import { db } from '@/lib/db/drizzle';
import { webhooks, webhookDeliveries, WebhookEventType } from '@/lib/db/schema';
import { eq, and, lte, isNull } from 'drizzle-orm';

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: any;
  teamId: number;
}

/**
 * Generate a webhook secret for signing payloads
 */
export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}

/**
 * Sign a webhook payload with HMAC SHA-256
 */
export function signWebhookPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify a webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = signWebhookPayload(payload, secret);
  return signature === expectedSignature;
}

/**
 * Trigger webhook deliveries for a specific event
 */
export async function triggerWebhookEvent(
  teamId: number,
  event: WebhookEventType,
  data: any
) {
  // Find all active webhooks for this team that are subscribed to this event
  const activeWebhooks = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.teamId, teamId), eq(webhooks.active, 1)));

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
    teamId,
  };

  const deliveries = [];

  for (const webhook of activeWebhooks) {
    const events = JSON.parse(webhook.events) as string[];

    // Check if this webhook is subscribed to this event
    if (events.includes(event) || events.includes('*')) {
      deliveries.push(deliverWebhook(webhook.id, event, payload, webhook.url, webhook.secret));
    }
  }

  await Promise.allSettled(deliveries);
}

/**
 * Deliver a webhook to a specific endpoint
 */
async function deliverWebhook(
  webhookId: number,
  eventType: WebhookEventType,
  payload: WebhookPayload,
  url: string,
  secret: string,
  attemptCount: number = 1
) {
  const payloadString = JSON.stringify(payload);
  const signature = signWebhookPayload(payloadString, secret);

  const deliveryRecord = {
    webhookId,
    eventType,
    payload: payloadString,
    attemptCount,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'User-Agent': 'SaaS-Webhook/1.0',
      },
      body: payloadString,
    });

    const responseBody = await response.text();

    // Update webhook last triggered timestamp
    await db
      .update(webhooks)
      .set({ lastTriggeredAt: new Date() })
      .where(eq(webhooks.id, webhookId));

    // Record successful delivery
    await db.insert(webhookDeliveries).values({
      ...deliveryRecord,
      responseStatus: response.status,
      responseBody: responseBody.substring(0, 1000), // Limit response body
      deliveredAt: new Date(),
    });

    return { success: true, status: response.status };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Calculate next retry time using exponential backoff
    const nextRetryAt = calculateNextRetry(attemptCount);

    await db.insert(webhookDeliveries).values({
      ...deliveryRecord,
      responseStatus: 0,
      responseBody: errorMessage.substring(0, 1000),
      nextRetryAt,
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Calculate next retry time using exponential backoff
 * Retry after: 1min, 5min, 30min, 2h, 6h
 */
function calculateNextRetry(attemptCount: number): Date | null {
  const delays = [60, 300, 1800, 7200, 21600]; // in seconds
  const maxAttempts = delays.length;

  if (attemptCount >= maxAttempts) {
    return null; // No more retries
  }

  const delaySeconds = delays[attemptCount];
  return new Date(Date.now() + delaySeconds * 1000);
}

/**
 * Retry failed webhook deliveries
 */
export async function retryFailedWebhooks() {
  const now = new Date();

  // Find deliveries that need to be retried
  const failedDeliveries = await db
    .select({
      id: webhookDeliveries.id,
      webhookId: webhookDeliveries.webhookId,
      eventType: webhookDeliveries.eventType,
      payload: webhookDeliveries.payload,
      attemptCount: webhookDeliveries.attemptCount,
    })
    .from(webhookDeliveries)
    .where(
      and(
        isNull(webhookDeliveries.deliveredAt),
        lte(webhookDeliveries.nextRetryAt, now)
      )
    )
    .limit(100);

  for (const delivery of failedDeliveries) {
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, delivery.webhookId))
      .limit(1);

    if (!webhook || !webhook.active) {
      continue;
    }

    const payload: WebhookPayload = JSON.parse(delivery.payload);

    await deliverWebhook(
      webhook.id,
      delivery.eventType as WebhookEventType,
      payload,
      webhook.url,
      webhook.secret,
      delivery.attemptCount + 1
    );

    // Mark the old delivery attempt as superseded
    await db
      .update(webhookDeliveries)
      .set({ nextRetryAt: null })
      .where(eq(webhookDeliveries.id, delivery.id));
  }
}
