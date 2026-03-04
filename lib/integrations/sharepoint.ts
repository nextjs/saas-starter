import { prisma } from "@/lib/prisma";

/**
 * Resolve a SharePoint / OneDrive sharing URL into file metadata
 * using the Microsoft Graph /shares endpoint.
 *
 * This converts a user-pasted SharePoint link into structured metadata
 * (title, file type, size, last modified, driveItemId, siteId).
 *
 * Requires a valid Microsoft Graph access token from the user's email integration.
 */
export async function resolveSharePointUrl(
  accessToken: string,
  sharingUrl: string
): Promise<{
  title: string;
  fileType: string | null;
  fileSize: number | null;
  lastModifiedAt: Date | null;
  lastModifiedBy: string | null;
  driveItemId: string | null;
  siteId: string | null;
} | null> {
  // Encode the sharing URL for the Graph /shares endpoint
  // See: https://learn.microsoft.com/en-us/graph/api/shares-get
  const encodedUrl = Buffer.from(sharingUrl).toString("base64url");
  const shareToken = `u!${encodedUrl}`;

  try {
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/shares/${shareToken}/driveItem?$select=id,name,size,file,lastModifiedDateTime,lastModifiedBy,parentReference`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      console.error("Graph /shares error:", res.status, await res.text());
      return null;
    }

    const item = await res.json();

    return {
      title: item.name ?? "Untitled",
      fileType: item.file?.mimeType
        ? getExtensionFromMimeType(item.file.mimeType)
        : getExtensionFromName(item.name),
      fileSize: item.size ?? null,
      lastModifiedAt: item.lastModifiedDateTime
        ? new Date(item.lastModifiedDateTime)
        : null,
      lastModifiedBy: item.lastModifiedBy?.user?.displayName ?? null,
      driveItemId: item.id ?? null,
      siteId: item.parentReference?.siteId ?? null,
    };
  } catch (err) {
    console.error("Failed to resolve SharePoint URL:", err);
    return null;
  }
}

/**
 * Refresh metadata for a linked document from Graph.
 */
export async function refreshDocumentMetadata(
  accessToken: string,
  driveItemId: string,
  siteId: string | null
): Promise<{
  title: string;
  fileSize: number | null;
  lastModifiedAt: Date | null;
  lastModifiedBy: string | null;
} | null> {
  // If we have a siteId, use it for a more specific query
  const endpoint = siteId
    ? `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${driveItemId}?$select=name,size,lastModifiedDateTime,lastModifiedBy`
    : `https://graph.microsoft.com/v1.0/me/drive/items/${driveItemId}?$select=name,size,lastModifiedDateTime,lastModifiedBy`;

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;

    const item = await res.json();
    return {
      title: item.name,
      fileSize: item.size ?? null,
      lastModifiedAt: item.lastModifiedDateTime
        ? new Date(item.lastModifiedDateTime)
        : null,
      lastModifiedBy: item.lastModifiedBy?.user?.displayName ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Send a notification card to a Microsoft Teams channel via incoming webhook.
 */
export async function sendTeamsNotification(
  webhookUrl: string,
  card: {
    title: string;
    subtitle?: string;
    text: string;
    url?: string;
    urlLabel?: string;
  }
): Promise<boolean> {
  const payload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: "F97316", // Orange
    summary: card.title,
    sections: [
      {
        activityTitle: card.title,
        activitySubtitle: card.subtitle ?? "",
        text: card.text,
      },
    ],
    potentialAction: card.url
      ? [
          {
            "@type": "OpenUri",
            name: card.urlLabel ?? "View in CRM",
            targets: [{ os: "default", uri: card.url }],
          },
        ]
      : [],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get an access token for Microsoft Graph from the user's email integration.
 */
export async function getGraphTokenForMember(
  workspaceId: string,
  userId: string
): Promise<string | null> {
  const integration = await prisma.emailIntegration.findFirst({
    where: {
      workspaceId,
      userId,
      provider: "MICROSOFT",
      isActive: true,
    },
    select: { accessToken: true, refreshToken: true, expiresAt: true },
  });

  if (!integration) return null;

  // Check if token is still valid (with 5 min buffer)
  if (integration.expiresAt && integration.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return integration.accessToken;
  }

  // Try to refresh
  if (integration.refreshToken) {
    try {
      const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.AZURE_AD_CLIENT_ID!,
          client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
          refresh_token: integration.refreshToken,
          grant_type: "refresh_token",
          scope: "https://graph.microsoft.com/.default",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await prisma.emailIntegration.updateMany({
          where: { workspaceId, userId, provider: "MICROSOFT" },
          data: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token ?? integration.refreshToken,
            expiresAt: new Date(Date.now() + data.expires_in * 1000),
          },
        });
        return data.access_token;
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

function getExtensionFromMimeType(mimeType: string): string | null {
  const map: Record<string, string> = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/msword": "doc",
    "application/vnd.ms-excel": "xls",
    "application/vnd.ms-powerpoint": "ppt",
  };
  return map[mimeType] ?? null;
}

function getExtensionFromName(name: string | undefined): string | null {
  if (!name) return null;
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
}
