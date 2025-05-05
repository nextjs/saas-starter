import { desc, and, eq, isNull, between, like, sql, SQL, gt, gte, lte } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, plans, ActivityType, apiUsage, apiKeys, creditBatches } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

/**
 * 获取当前登录用户信息
 *
 * 通过验证会话Cookie获取当前登录用户
 *
 * @returns 返回用户对象，如果未登录则返回null
 */
export async function getUser() {
  // 从请求中获取会话Cookie
  const sessionCookie = (await cookies()).get('session');
  // 如果Cookie不存在或值为空，返回null
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  // 验证会话令牌
  const sessionData = await verifyToken(sessionCookie.value);
  // 如果会话数据无效或不包含用户ID，返回null
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  // 检查会话是否过期
  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  // 从数据库查询用户信息
  const user = await db
    .select()
    .from(users)
    .where(and(
      eq(users.id, sessionData.user.id), // 匹配用户ID
      isNull(users.deletedAt) // 确保用户未被删除
    ))
    .limit(1);

  // 如果未找到用户，返回null
  if (user.length === 0) {
    return null;
  }

  // 返回找到的用户
  return user[0];
}

/**
 * 通过Stripe客户ID查找团队
 *
 * @param customerId Stripe客户ID
 * @returns 返回团队对象，如果未找到则返回null
 */
export async function getTeamByStripeCustomerId(customerId: string) {
  // 查询匹配Stripe客户ID的团队
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  // 如果找到团队则返回，否则返回null
  return result.length > 0 ? result[0] : null;
}

/**
 * 更新团队的订阅信息
 *
 * @param teamId 团队ID
 * @param subscriptionData 订阅数据对象，包含Stripe订阅ID、产品ID、计划名称和订阅状态
 */
export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  // 更新团队的订阅信息
  await db
    .update(teams)
    .set({
      ...subscriptionData, // 展开订阅数据
      updatedAt: new Date() // 更新修改时间
    })
    .where(eq(teams.id, teamId)); // 匹配团队ID
}

/**
 * 获取用户及其所属团队信息
 *
 * @param userId 用户ID
 * @returns 返回包含用户和团队ID的对象
 */
export async function getUserWithTeam(userId: number) {
  // 查询用户及其所属团队
  const result = await db
    .select({
      user: users, // 选择整个用户对象
      teamId: teamMembers.teamId // 选择团队ID
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId)) // 关联团队成员表
    .where(eq(users.id, userId)) // 匹配用户ID
    .limit(1);

  // 返回查询结果
  return result[0];
}

/**
 * 获取用户活动日志
 * 支持分页、按活动类型筛选、日期范围筛选和关键词搜索
 *
 * @param options 查询选项
 * @param options.page 页码，默认为1
 * @param options.limit 每页记录数，默认为10
 * @param options.action 活动类型筛选
 * @param options.startDate 开始日期
 * @param options.endDate 结束日期
 * @param options.search 搜索关键词
 * @returns 活动日志列表
 * @throws 如果用户未认证，抛出错误
 */
export async function getActivityLogs(options?: {
  page?: number;
  limit?: number;
  action?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}) {
  // 获取当前登录用户
  const user = await getUser();
  // 如果用户未登录，抛出错误
  if (!user) {
    throw new Error('User not authenticated');
  }

  // 解构查询选项，设置默认值
  const {
    page = 1, // 默认第1页
    limit = 10, // 默认每页10条
    action, // 活动类型
    startDate, // 开始日期
    endDate, // 结束日期
    search // 搜索关键词
  } = options || {};

  // 计算分页偏移量
  const offset = (page - 1) * limit;

  // 获取查询条件
  const whereCondition = buildActivityLogsCondition(user.id, action, startDate, endDate, search);

  // 执行查询并返回结果
  return await db
    .select({
      id: activityLogs.id, // 活动ID
      action: activityLogs.action, // 活动类型
      timestamp: activityLogs.timestamp, // 活动时间
      ipAddress: activityLogs.ipAddress, // IP地址
      userName: users.name // 用户名
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id)) // 关联用户表获取用户名
    .where(whereCondition) // 应用筛选条件
    .orderBy(desc(activityLogs.timestamp)) // 按时间降序排列
    .limit(limit) // 限制返回记录数
    .offset(offset); // 设置偏移量实现分页
}

/**
 * 获取符合条件的活动日志总数
 *
 * @param options 查询选项
 * @param options.action 活动类型筛选
 * @param options.startDate 开始日期
 * @param options.endDate 结束日期
 * @param options.search 搜索关键词
 * @returns 符合条件的记录总数
 * @throws 如果用户未认证，抛出错误
 */
export async function getActivityLogsCount(options?: {
  action?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}) {
  // 获取当前登录用户
  const user = await getUser();
  // 如果用户未登录，抛出错误
  if (!user) {
    throw new Error('User not authenticated');
  }

  // 解构查询选项
  const {
    action, // 活动类型
    startDate, // 开始日期
    endDate, // 结束日期
    search // 搜索关键词
  } = options || {};

  // 获取查询条件
  const whereCondition = buildActivityLogsCondition(user.id, action, startDate, endDate, search);

  // 执行计数查询
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityLogs)
    .where(whereCondition);

  // 返回记录总数
  return countResult[0]?.count || 0;
}

/**
 * 构建活动日志查询条件
 *
 * @param userId 用户ID
 * @param action 活动类型
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param search 搜索关键词
 * @returns SQL条件表达式
 */
function buildActivityLogsCondition(
  userId: number,
  action?: ActivityType | undefined,
  startDate?: Date | undefined,
  endDate?: Date | undefined,
  search?: string | undefined
) {
  // 创建查询条件数组，初始条件为用户ID匹配
  let conditions: SQL[] = [eq(activityLogs.userId, userId)];

  // 如果指定了活动类型，添加活动类型筛选条件
  if (action) {
    conditions.push(eq(activityLogs.action, action));
  }

  // 如果指定了日期范围，添加日期范围筛选条件
  if (startDate && endDate) {
    conditions.push(
      between(activityLogs.timestamp, startDate, endDate)
    );
  }

  // 如果指定了搜索关键词，添加模糊搜索条件
  if (search) {
    conditions.push(
      like(sql`LOWER(${activityLogs.action})`, `%${search.toLowerCase()}%`)
    );
  }

  // 组合所有条件：如果有多个条件使用AND连接，否则直接使用单个条件
  return conditions.length > 1
    ? and(...conditions)
    : conditions[0];
}

/**
 * 获取当前用户所属的团队及其成员信息
 *
 * @returns 返回团队对象（包含成员信息），如果未找到则返回null
 */
export async function getTeamForUser() {
  // 获取当前登录用户
  const user = await getUser();
  // 如果用户未登录，返回null
  if (!user) {
    return null;
  }

  // 使用Drizzle的关系查询API查询团队及其成员
  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id), // 匹配用户ID
    with: {
      team: { // 关联团队
        with: {
          teamMembers: { // 关联团队的所有成员
            with: {
              user: { // 关联成员的用户信息
                columns: { // 只选择需要的用户字段
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  // 返回团队对象，如果未找到则返回null
  return result?.team || null;
}

/**
 * 获取所有活跃的订阅计划
 *
 * @returns 返回按价格排序的活跃订阅计划列表
 */
export async function getPlans() {
  // 查询所有活跃的订阅计划，按价格升序排列
  return await db
    .select()
    .from(plans)
    .where(eq(plans.isActive, true)) // 只选择活跃的订阅计划
    .orderBy(plans.price); // 按价格排序
}

/**
 * 根据Stripe产品ID获取计划信息
 *
 * @param stripeProductId Stripe产品ID
 * @returns 返回计划信息，如果未找到则返回null
 */
export async function getPlanByStripeProductId(stripeProductId: string) {
  // 查询匹配Stripe产品ID的计划
  const result = await db
    .select()
    .from(plans)
    .where(eq(plans.stripeProductId, stripeProductId))
    .limit(1);

  // 返回计划信息，如果未找到则返回null
  return result.length > 0 ? result[0] : null;
}

/**
 * 获取用户API使用记录
 *
 * @param options 查询选项
 * @param options.page 页码，默认为1
 * @param options.limit 每页记录数，默认为10
 * @returns API使用记录列表
 * @throws 如果用户未认证，抛出错误
 */
export async function getUserApiUsage(options?: {
  page?: number;
  limit?: number;
}) {
  // 获取当前登录用户
  const user = await getUser();
  // 如果用户未登录，抛出错误
  if (!user) {
    throw new Error('用户未认证');
  }

  // 获取用户所属团队
  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    throw new Error('用户未关联团队');
  }

  // 解构查询选项，设置默认值
  const {
    page = 1, // 默认第1页
    limit = 10, // 默认每页10条
  } = options || {};

  // 计算分页偏移量
  const offset = (page - 1) * limit;

  // 执行查询并返回结果
  return await db
    .select({
      id: apiUsage.id,
      endpoint: apiUsage.endpoint,
      creditsConsumed: apiUsage.creditsConsumed,
      executionTimeMs: apiUsage.executionTimeMs,
      responseStatus: apiUsage.responseStatus,
      ipAddress: apiUsage.ipAddress,
      timestamp: apiUsage.timestamp,
      apiKeyName: apiKeys.name
    })
    .from(apiUsage)
    .leftJoin(apiKeys, eq(apiUsage.apiKeyId, apiKeys.id))
    .where(eq(apiUsage.teamId, userWithTeam.teamId))
    .orderBy(desc(apiUsage.timestamp))
    .limit(limit)
    .offset(offset);
}

/**
 * 获取用户API使用记录总数
 *
 * @returns API使用记录总数
 * @throws 如果用户未认证，抛出错误
 */
export async function getUserApiUsageCount() {
  // 获取当前登录用户
  const user = await getUser();
  // 如果用户未登录，抛出错误
  if (!user) {
    throw new Error('用户未认证');
  }

  // 获取用户所属团队
  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    throw new Error('用户未关联团队');
  }

  // 执行计数查询
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(apiUsage)
    .where(eq(apiUsage.teamId, userWithTeam.teamId));

  // 返回记录总数
  return countResult[0]?.count || 0;
}

/**
 * 获取团队可用积分总数
 *
 * @param teamId 团队ID
 * @returns 返回团队可用积分总数
 */
export async function getTeamAvailableCredits(teamId: number) {
  // 查询未过期的积分批次
  const result = await db
    .select({
      total: sql<number>`SUM(${creditBatches.remainingAmount})`
    })
    .from(creditBatches)
    .where(and(
      eq(creditBatches.teamId, teamId),
      gt(creditBatches.expiresAt, new Date())
    ));

  // 返回总积分数，如果没有则返回0
  return result[0]?.total || 0;
}

/**
 * 获取团队积分批次列表
 *
 * @param options 查询选项
 * @param options.teamId 团队ID
 * @param options.page 页码，默认为1
 * @param options.limit 每页记录数，默认为10
 * @returns 积分批次列表
 */
export async function getTeamCreditBatches(options: {
  teamId: number;
  page?: number;
  limit?: number;
}) {
  // 解构查询选项，设置默认值
  const {
    teamId,
    page = 1,
    limit = 10
  } = options;

  // 计算分页偏移量
  const offset = (page - 1) * limit;

  // 执行查询并返回结果
  return await db
    .select()
    .from(creditBatches)
    .where(eq(creditBatches.teamId, teamId))
    .orderBy(desc(creditBatches.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * 获取当前用户团队的积分信息
 *
 * @returns 返回团队积分信息，如果未找到则返回null
 * @throws 如果用户未认证，抛出错误
 */
export async function getCurrentTeamCredits() {
  // 获取当前登录用户
  const user = await getUser();
  // 如果用户未登录，抛出错误
  if (!user) {
    throw new Error('用户未认证');
  }

  // 获取用户所属团队
  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    throw new Error('用户未关联团队');
  }

  // 获取团队可用积分
  const availableCredits = await getTeamAvailableCredits(userWithTeam.teamId);

  // 获取积分批次
  const creditBatchesList = await getTeamCreditBatches({
    teamId: userWithTeam.teamId,
    limit: 100 // 获取最近100条记录
  });

  // 返回团队积分信息
  return {
    teamId: userWithTeam.teamId,
    availableCredits,
    creditBatches: creditBatchesList
  };
}

/**
 * 获取用户API使用统计
 *
 * @returns 返回API使用统计信息
 * @throws 如果用户未认证，抛出错误
 */
export async function getUserApiUsageStats() {
  // 获取当前登录用户
  const user = await getUser();
  // 如果用户未登录，抛出错误
  if (!user) {
    throw new Error('用户未认证');
  }

  // 获取用户所属团队
  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    throw new Error('用户未关联团队');
  }

  // 获取当前月份的开始和结束日期
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 查询本月API调用总数
  const result = await db
    .select({
      total: sql<number>`count(*)`,
      creditsUsed: sql<number>`SUM(${apiUsage.creditsConsumed})`
    })
    .from(apiUsage)
    .where(and(
      eq(apiUsage.teamId, userWithTeam.teamId),
      gte(apiUsage.timestamp, startOfMonth),
      lte(apiUsage.timestamp, endOfMonth)
    ));

  // 返回统计信息
  return {
    total: result[0]?.total || 0,
    creditsUsed: result[0]?.creditsUsed || 0,
    period: {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString()
    }
  };
}
