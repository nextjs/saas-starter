import { db } from './drizzle';
import { activityLogs, ActivityType } from './schema';

/**
 * 记录用户活动日志
 * 将用户的操作记录到活动日志表中，用于审计和跟踪
 *
 * @param teamId - 团队ID，表示活动发生在哪个团队
 * @param userId - 用户ID，表示是哪个用户执行的操作
 * @param action - 活动类型，表示执行了什么操作
 * @param ipAddress - 可选的IP地址，记录操作来源
 */
export async function logActivity(
  teamId: number,
  userId: number,
  action: ActivityType,
  ipAddress?: string
) {
  // 向活动日志表插入新记录
  await db.insert(activityLogs).values({
    teamId,
    userId,
    action,
    ipAddress: ipAddress || '', // 如果没有提供IP地址，则使用空字符串
  });
}