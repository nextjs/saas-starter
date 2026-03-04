import { prisma } from "@/lib/prisma";

/**
 * Create an in-app notification for a workspace member.
 */
export async function createNotification({
  workspaceId,
  memberId,
  type,
  title,
  body,
  linkUrl,
}: {
  workspaceId: string;
  memberId: string;
  type: string;
  title: string;
  body?: string;
  linkUrl?: string;
}) {
  return prisma.notification.create({
    data: {
      workspaceId,
      userId: memberId,
      type,
      title,
      body: body ?? null,
      entityId: linkUrl ?? null,
    },
  });
}

/**
 * Get unread notifications for a member.
 */
export async function getUnreadNotifications(
  workspaceId: string,
  memberId: string,
  limit = 20
) {
  return prisma.notification.findMany({
    where: { workspaceId, userId: memberId, readAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Mark notifications as read.
 */
export async function markNotificationsRead(
  workspaceId: string,
  memberId: string,
  notificationIds?: string[]
) {
  const where = notificationIds
    ? { workspaceId, userId: memberId, id: { in: notificationIds } }
    : { workspaceId, userId: memberId, readAt: null };

  return prisma.notification.updateMany({
    where,
    data: { readAt: new Date() },
  });
}

/**
 * Send email notification via Resend (if configured).
 * Silently no-ops if RESEND_API_KEY is not set.
 */
export async function sendEmailNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Orangeleaf CRM <notifications@orangeleaf.app>",
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return null;
  }
}
