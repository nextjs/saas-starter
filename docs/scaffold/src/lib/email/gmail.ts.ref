// src/lib/email/gmail.ts
// Gmail API email sync
// Uses history API for incremental sync + Pub/Sub push webhooks

import { db } from "@/lib/db";
import { createActivity, matchContactByEmail } from "@/lib/email/shared";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

// ── Token refresh ─────────────────────────────────────────────

export async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error(`Google token refresh failed: ${await res.text()}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

// ── Register Pub/Sub push watch ───────────────────────────────

export async function registerGmailWatch(
  accessToken: string
): Promise<{ historyId: string; expiration: string }> {
  const res = await fetch(`${GMAIL_API}/users/me/watch`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      labelIds: ["INBOX", "SENT"],
      topicName: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/topics/gmail-crm-push`,
    }),
  });

  if (!res.ok) throw new Error(`Gmail watch failed: ${await res.text()}`);
  return res.json();
}

// ── History-based incremental sync ───────────────────────────

export async function syncGmailMessages(integrationId: string) {
  const integration = await db.emailIntegration.findUniqueOrThrow({
    where: { id: integrationId },
  });

  // Refresh token if needed
  let accessToken = integration.accessToken;
  if (integration.expiresAt && integration.expiresAt < new Date(Date.now() + 60_000)) {
    if (!integration.refreshToken) throw new Error("No refresh token");
    const refreshed = await refreshGoogleToken(integration.refreshToken);
    accessToken = refreshed.accessToken;
    await db.emailIntegration.update({
      where: { id: integrationId },
      data: { accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt },
    });
  }

  // If no historyId, do a full profile fetch to get starting point
  let startHistoryId = integration.historyId;
  if (!startHistoryId) {
    const profile = await fetch(`${GMAIL_API}/users/me/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => r.json());
    startHistoryId = profile.historyId;
  }

  // Fetch history changes
  const historyRes = await fetch(
    `${GMAIL_API}/users/me/history?startHistoryId=${startHistoryId}&historyTypes=messageAdded&labelId=INBOX&labelId=SENT`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const historyData = await historyRes.json();

  if (historyData.error?.code === 404) {
    // historyId too old — reset
    await db.emailIntegration.update({ where: { id: integrationId }, data: { historyId: null } });
    return syncGmailMessages(integrationId);
  }

  const messageIds: string[] = [];
  for (const record of historyData.history ?? []) {
    for (const msg of record.messagesAdded ?? []) {
      if (!messageIds.includes(msg.message.id)) {
        messageIds.push(msg.message.id);
      }
    }
  }

  // Fetch full message details (batch to avoid rate limits)
  let created = 0;
  for (const messageId of messageIds) {
    try {
      const msg = await fetchGmailMessage(accessToken, messageId);
      if (!msg) continue;

      const internalDomain = integration.email.split("@")[1];
      const fromEmail = extractEmail(msg.from);
      const isInbound = !fromEmail.endsWith(`@${internalDomain}`);
      const contactEmail = isInbound ? fromEmail : extractEmail(msg.to[0] ?? "");

      if (!contactEmail) continue;

      const { contactId, opportunityId } = await matchContactByEmail(
        integration.workspaceId,
        contactEmail
      );

      // Upsert thread
      const thread = await db.emailThread.upsert({
        where: { externalThreadId: msg.threadId },
        update: { lastMessageAt: msg.sentAt, messageCount: { increment: 1 }, snippet: msg.body.slice(0, 200) },
        create: {
          workspaceId: integration.workspaceId,
          emailIntegrationId: integration.id,
          contactId,
          externalThreadId: msg.threadId,
          subject: msg.subject,
          lastMessageAt: msg.sentAt,
          isInbound,
          snippet: msg.body.slice(0, 200),
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
            from: fromEmail,
            to: msg.to,
            cc: msg.cc,
            subject: msg.subject,
            body: msg.body,
            sentAt: msg.sentAt,
          },
        });

        await createActivity({
          workspaceId: integration.workspaceId,
          type: "EMAIL",
          title: `${isInbound ? "📥" : "📤"} ${msg.subject}`,
          body: msg.body.slice(0, 500),
          contactId,
          opportunityId,
          emailThreadId: thread.id,
          isAutomated: true,
          createdById: "system",
          metadata: { messageId: msg.id, provider: "GOOGLE", isInbound },
        });

        created++;
      }
    } catch (err) {
      console.error(`Failed to process Gmail message ${messageId}:`, err);
    }
  }

  // Save new historyId
  const newHistoryId = historyData.historyId ?? startHistoryId;
  await db.emailIntegration.update({
    where: { id: integrationId },
    data: { historyId: newHistoryId, lastSyncAt: new Date() },
  });

  return { synced: created, total: messageIds.length };
}

// ── Low-level message fetch ───────────────────────────────────

async function fetchGmailMessage(accessToken: string, messageId: string) {
  const res = await fetch(
    `${GMAIL_API}/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) return null;
  const msg = await res.json();

  const headers: Record<string, string> = {};
  for (const h of msg.payload?.headers ?? []) {
    headers[h.name.toLowerCase()] = h.value;
  }

  const body = extractGmailBody(msg.payload);

  return {
    id: msg.id,
    threadId: msg.threadId,
    subject: headers.subject ?? "(no subject)",
    from: headers.from ?? "",
    to: parseAddressList(headers.to),
    cc: parseAddressList(headers.cc),
    body,
    sentAt: new Date(parseInt(msg.internalDate)),
  };
}

function extractGmailBody(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }
  for (const part of payload.parts ?? []) {
    const text = extractGmailBody(part);
    if (text) return text;
  }
  return "";
}

function extractEmail(str: string): string {
  const match = str.match(/<([^>]+)>/);
  return (match ? match[1] : str).trim().toLowerCase();
}

function parseAddressList(str = ""): string[] {
  return str.split(",").map(extractEmail).filter(Boolean);
}
