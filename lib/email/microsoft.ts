// Microsoft Graph API email sync — delta queries

import { prisma } from "@/lib/prisma";
import { createActivity, matchContactByEmail } from "@/lib/email/shared";

const GRAPH_API = "https://graph.microsoft.com/v1.0";

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
      clientState: integrationId,
    }),
  });

  if (!res.ok) throw new Error(`Subscription failed: ${await res.text()}`);
  const data = await res.json();
  return data.id;
}

export async function syncOutlookMessages(integrationId: string) {
  const integration = await prisma.emailIntegration.findUniqueOrThrow({
    where: { id: integrationId },
  });

  let accessToken = integration.accessToken;
  if (integration.expiresAt && integration.expiresAt < new Date(Date.now() + 60_000)) {
    if (!integration.refreshToken) throw new Error("No refresh token");
    const refreshed = await refreshMicrosoftToken(integration.refreshToken);
    accessToken = refreshed.accessToken;
    await prisma.emailIntegration.update({
      where: { id: integrationId },
      data: { accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt },
    });
  }

  let url: string;
  if (integration.deltaLink) {
    url = integration.deltaLink;
  } else {
    const since = integration.syncFromDate.toISOString();
    url = `${GRAPH_API}/me/messages/delta?$filter=receivedDateTime ge ${since}&$select=id,subject,from,toRecipients,ccRecipients,body,receivedDateTime,conversationId,isDraft&$top=50`;
  }

  const allMessages: MicrosoftMessage[] = [];
  let nextDeltaLink: string | null = null;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    if (!res.ok) {
      if (res.status === 410) {
        await prisma.emailIntegration.update({
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

  let created = 0;
  for (const msg of allMessages) {
    if (msg.isDraft) continue;

    const fromEmail = msg.from?.emailAddress?.address;
    if (!fromEmail) continue;

    // Internal domain filtering
    const internalDomains = await getInternalDomains(integration.workspaceId);
    const fromDomain = fromEmail.split("@")[1]?.toLowerCase();
    const toDomain = msg.toRecipients?.[0]?.emailAddress?.address?.split("@")[1]?.toLowerCase();
    if (fromDomain && toDomain && internalDomains.has(fromDomain) && internalDomains.has(toDomain)) {
      continue; // Skip internal-to-internal
    }

    const isInbound = !fromEmail.toLowerCase().endsWith(`@${integration.email.split("@")[1]}`);
    const contactEmail = isInbound ? fromEmail : msg.toRecipients?.[0]?.emailAddress?.address;
    if (!contactEmail) continue;

    const { contactId, opportunityId } = await matchContactByEmail(
      integration.workspaceId,
      contactEmail
    );

    let thread = await prisma.emailThread.findFirst({
      where: { externalThreadId: msg.conversationId },
    });

    if (thread) {
      thread = await prisma.emailThread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: new Date(msg.receivedDateTime),
          messageCount: { increment: 1 },
          snippet: stripHtml(msg.body?.content ?? "").slice(0, 200),
        },
      });
    } else {
      thread = await prisma.emailThread.create({
        data: {
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
    }

    const existing = await prisma.emailMessage.findUnique({
      where: { threadId_messageId: { threadId: thread.id, messageId: msg.id } },
    });

    if (!existing) {
      await prisma.emailMessage.create({
        data: {
          threadId: thread.id,
          messageId: msg.id,
          from: msg.from.emailAddress.address,
          to: msg.toRecipients?.map((r) => r.emailAddress.address) ?? [],
          cc: msg.ccRecipients?.map((r) => r.emailAddress.address) ?? [],
          subject: msg.subject ?? "(no subject)",
          body: stripHtml(msg.body?.content ?? ""),
          bodyHtml: msg.body?.content,
          sentAt: new Date(msg.receivedDateTime),
        },
      });

      await createActivity({
        workspaceId: integration.workspaceId,
        type: "EMAIL",
        title: `${isInbound ? "Received" : "Sent"}: ${msg.subject ?? "(no subject)"}`,
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

  if (nextDeltaLink) {
    await prisma.emailIntegration.update({
      where: { id: integrationId },
      data: { deltaLink: nextDeltaLink, lastSyncAt: new Date() },
    });
  }

  return { synced: created, total: allMessages.length };
}

// Helpers

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

async function getInternalDomains(workspaceId: string): Promise<Set<string>> {
  const domains = await prisma.allowedDomain.findMany({
    where: { workspaceId, isInternal: true },
    select: { domain: true },
  });
  return new Set(domains.map((d) => d.domain.toLowerCase()));
}
