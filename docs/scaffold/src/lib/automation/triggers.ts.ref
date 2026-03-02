// src/lib/automation/triggers.ts
// Event trigger system — fires on every significant CRM action

import { db } from "@/lib/db";
import { createHmac } from "crypto";

export type TriggerEvent =
  | "opportunity.created"
  | "opportunity.updated"
  | "opportunity.stage_changed"
  | "opportunity.won"
  | "opportunity.lost"
  | "contact.created"
  | "contact.updated"
  | "account.created"
  | "activity.logged"
  | "deal.stale"
  | "email.received";

export interface TriggerPayload {
  workspaceId: string;
  event: TriggerEvent;
  entityId: string;
  data: Record<string, unknown>;
  triggeredBy?: string;
}

export async function fireTrigger(payload: TriggerPayload) {
  // Run all side effects in parallel — log to audit, run automations, fire webhooks
  await Promise.allSettled([
    logAudit(payload),
    runBuiltinAutomations(payload),
    fireWebhooks(payload),
  ]);
}

// ── Built-in automations ──────────────────────────────────────

async function runBuiltinAutomations(payload: TriggerPayload) {
  switch (payload.event) {
    case "opportunity.stage_changed": {
      const { fromStage, toStage, opportunityId } = payload.data as any;
      await db.activity.create({
        data: {
          workspaceId: payload.workspaceId,
          type: "STAGE_CHANGE",
          opportunityId,
          title: `Stage moved: ${fromStage} → ${toStage}`,
          isAutomated: true,
          createdById: payload.triggeredBy ?? "system",
        },
      });
      break;
    }

    case "opportunity.won": {
      await db.activity.create({
        data: {
          workspaceId: payload.workspaceId,
          type: "SYSTEM",
          opportunityId: payload.entityId,
          title: "🎉 Deal marked as Won",
          isAutomated: true,
          createdById: payload.triggeredBy ?? "system",
        },
      });

      // Update opportunity status and close date
      await db.opportunity.update({
        where: { id: payload.entityId },
        data: { status: "WON", actualCloseDate: new Date() },
      });
      break;
    }

    case "opportunity.lost": {
      const { reason } = payload.data as { reason?: string };
      await db.activity.create({
        data: {
          workspaceId: payload.workspaceId,
          type: "SYSTEM",
          opportunityId: payload.entityId,
          title: `Deal marked as Lost${reason ? ` — ${reason}` : ""}`,
          isAutomated: true,
          createdById: payload.triggeredBy ?? "system",
        },
      });
      await db.opportunity.update({
        where: { id: payload.entityId },
        data: {
          status: "LOST",
          actualCloseDate: new Date(),
          lostReason: reason,
        },
      });
      break;
    }
  }
}

// ── Webhook delivery ──────────────────────────────────────────

async function fireWebhooks(payload: TriggerPayload) {
  const webhooks = await db.webhook.findMany({
    where: {
      workspaceId: payload.workspaceId,
      isActive: true,
      events: { has: payload.event },
    },
  });

  await Promise.allSettled(
    webhooks.map((wh) =>
      fetch(wh.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CRM-Event": payload.event,
          "X-CRM-Signature": sign(JSON.stringify(payload), wh.secret),
          "X-CRM-Delivery": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      }).catch((err) => console.error(`Webhook ${wh.url} failed:`, err))
    )
  );
}

// ── Audit log ─────────────────────────────────────────────────

async function logAudit(payload: TriggerPayload) {
  await db.auditLog.create({
    data: {
      workspaceId: payload.workspaceId,
      userId: payload.triggeredBy ?? "system",
      action: payload.event,
      entity: payload.event.split(".")[0],
      entityId: payload.entityId,
      after: payload.data,
    },
  });
}

function sign(payload: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
}
