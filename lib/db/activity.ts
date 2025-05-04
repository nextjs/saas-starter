import { db } from './drizzle';
import { activityLogs, ActivityType } from './schema';

export async function logActivity(
  teamId: number,
  userId: number,
  action: ActivityType,
  ipAddress?: string
) {
  await db.insert(activityLogs).values({
    teamId,
    userId,
    action,
    ipAddress: ipAddress || '',
  });
}