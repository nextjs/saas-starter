import { db } from '@/lib/db/drizzle';
import { notifications } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export async function createNotification(
  userId: number,
  title: string,
  message: string,
  type: NotificationType = 'info',
  actionUrl?: string
) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      title,
      message,
      type,
      actionUrl,
    })
    .returning();

  return notification;
}

export async function getUnreadNotifications(userId: number) {
  return await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, 0)))
    .orderBy(desc(notifications.createdAt));
}

export async function getAllNotifications(userId: number, limit = 50) {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markAsRead(notificationId: number, userId: number) {
  await db
    .update(notifications)
    .set({ read: 1 })
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.userId, userId))
    );
}

export async function markAllAsRead(userId: number) {
  await db
    .update(notifications)
    .set({ read: 1 })
    .where(eq(notifications.userId, userId));
}

export async function deleteNotification(notificationId: number, userId: number) {
  await db
    .delete(notifications)
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.userId, userId))
    );
}
