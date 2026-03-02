// src/lib/email/microsoft.ts
// Microsoft Graph API email sync
// Uses delta queries — only fetches changes since last sync

import { db } from "@/lib/db";
import { createActivity, matchContactByEmail } from "@/lib/email/shared";

const GRAPH_API = "https://graph.microsoft.com/v1.0";

// ── Token refresh ─────────────────────────────────────────────

export async function refreshMicrosoftToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const params = new URLSearchParams({
    client_id: process.env.AZURE_AD_CLIENT_ID!,
    client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope: "openid profile email offline_access Mail.Read Mail.ReadWrite Mail.Send",
  });

  const tenantId = process.env.AZURE_AD_TENANT_ID ?? "common";
  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    { method: "POST", body: params }
  );

  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  const data = await res.json();

  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

// ── Register subscription (push notifications) ────────────────
// Outlook supports push webhooks — no polling needed if this is set up.
// Subscriptions expire after 3 days and must be renewed.

export async function registerOutlookSubscription(
  accessToken: string,
  integrationId: string
): Promise<string> {
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`${GRAPH_API}/subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      changeType: "created,updated",
      notificationUrl: `${process.env.NEXTAUTH_URL}/api/workspace/email/webhook/microsoft`,
      resource: "me/messages",
      expirationDateTime: expiresAt,
      clientState: integrationId, // used to verify webhook authenticity
    }),
  });

  if (!res.ok) throw new Error(`Subscription failed: ${await res.text()}`);
  const data = await res.json();
  return data.id;
}

// ── Delta sync (incremental) ──────────────────────────────────
// Uses $deltaToken to only fetch messages changed since last sync.
// On first run, fetches all messages from syncFromDate.

export async function syncOutlookMessages(integrationId: string) {
  const integration = await db.emailIntegration.findUniqueOrThrow({
    where: { id: integrationId },
  });

  // Refresh token if expired
  let accessToken = integration.accessToken;
  if (integration.expiresAt && integration.expiresAt < new Date(Date.now() + 60_000)) {
    if (!integration.refreshToken) throw new Error("No refresh token");
    const refreshed = await refreshMicrosoftToken(integration.refreshToken);
    accessToken = refreshed.accessToken;
    await db.emailIntegration.update({
      where: { id: integrationId },
      data: { accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt },
    });
  }

  // Build delta URL
  let url: string;
  if (integration.deltaLink) {
    // Subsequent sync — use stored delta link
    url = integration.deltaLink;
  } else {
    // First sync — fetch from syncFromDate
    const since = integration.syncFromDate.toISOString();
    url = `${GRAPH_API}/me/messages/delta?$filter=receivedDateTime ge ${since}&$select=id,subject,from,toRecipients,ccRecipients,body,receivedDateTime,conversationId,isDraft&$top=50`;
  }

  const allMessages: MicrosoftMessage[] = [];
  let nextDeltaLink: string | null = null;

  // Page through all results
  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    if (!res.ok) {
      if (res.status === 410) {
        // Delta token expired — restart full sync
        await db.emailIntegration.update({
          where: { id: integrationId },
          data: { deltaLink: null },
        });
        return syncOutlookMessages(integrationId);
      }
      throw new Error(`Graph API error: ${res.status}`);
    }

    const data = await res.json();
    allMessages.push(...(data.value ?? []));

    if (data["@odata.nextLink"]) {
      url = data["@odata.nextLink"];
    } else {
      nextDeltaLink = data["@odata.deltaLink"] ?? null;
      break;
    }
  }

  // Process messages
  let created = 0;
  for (const msg of allMessages) {
    if (msg.isDraft) continue;

    const fromEmail = msg.from?.emailAddress?.address;
    if (!fromEmail) continue;

    const internalDomain = integration.email.split("@")[1];
    const isInbound = !fromEmail.toLowerCase().endsWith(`@${internalDomain}`);

    const contactEmail = isInbound ? fromEmail : msg.toRecipients?.[0]?.emailAddress?.address;
    if (!contactEmail) continue;

    const { contactId, opportunityId } = await matchContactByEmail(
      integration.workspaceId,
      contactEmail
    );

    // Upsert thread
    const thread = await db.emailThread.upsert({
      where: { externalThreadId: msg.conversationId },
      update: {
        lastMessageAt: new Date(msg.receivedDateTime),
        messageCount: { increment: 1 },
        snippet: stripHtml(msg.body?.content ?? "").slice(0, 200),
        ...(contactId && !await threadHasContact(msg.conversationId) ? { contactId } : {}),
      },
      create: {
        workspaceId: integration.workspaceId,
        emailIntegrationId: integration.id,
        contactId,
        externalThreadId: msg.conversationId,
        subject: msg.subject ?? "(no subject)",
        lastMessageAt: new Date(msg.receivedDateTime),
        isInbound,
        snippet: stripHtml(msg.body?.content ?? "").slice(0, 200),
      },
    });

    // Upsert message
    const existing = await db.emailMessage.findUnique({
      where: { threadId_messageId: { threadId: thread.id, messageId: msg.id } },
    });

    if (!existing) {
      await db.emailMessage.create({
        data: {
          threadId: thread.id,
          messageId: msg.id,
          from: msg.from.emailAddress.address,
          to: msg.toRecipients?.map((r: any) => r.emailAddress.address) ?? [],
          cc: msg.ccRecipients?.map((r: any) => r.emailAddress.address) ?? [],
          subject: msg.subject ?? "(no subject)",
          body: stripHtml(msg.body?.content ?? ""),
          bodyHtml: msg.body?.content,
          sentAt: new Date(msg.receivedDateTime),
        },
      });

      // Create activity log entry
      await createActivity({
        workspaceId: integration.workspaceId,
        type: "EMAIL",
        title: `${isInbound ? "📥" : "📤"} ${msg.subject ?? "(no subject)"}`,
        body: stripHtml(msg.body?.content ?? "").slice(0, 500),
        contactId,
        opportunityId,
        emailThreadId: thread.id,
        isAutomated: true,
        createdById: "system",
        metadata: {
          messageId: msg.id,
          provider: "MICROSOFT",
          from: msg.from.emailAddress.address,
          isInbound,
        },
      });

      created++;
    }
  }

  // Save delta link for next sync
  if (nextDeltaLink) {
    await db.emailIntegration.update({
      where: { id: integrationId },
      data: { deltaLink: nextDeltaLink, lastSyncAt: new Date() },
    });
  }

  return { synced: created, total: allMessages.length };
}

// ── Helpers ───────────────────────────────────────────────────

interface MicrosoftMessage {
  id: string;
  subject: string;
  conversationId: string;
  receivedDateTime: string;
  isDraft: boolean;
  from: { emailAddress: { address: string; name: string } };
  toRecipients: Array<{ emailAddress: { address: string } }>;
  ccRecipients: Array<{ emailAddress: { address: string } }>;
  body: { content: string; contentType: string };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function threadHasContact(externalThreadId: string): Promise<boolean> {
  const thread = await db.emailThread.findUnique({ where: { externalThreadId } });
  return !!thread?.contactId;
}
