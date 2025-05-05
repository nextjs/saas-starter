/**
 * 数据库模式定义文件
 * 使用Drizzle ORM定义PostgreSQL数据库表结构、关系和类型
 */
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  json,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * 用户表
 * 存储系统中所有用户的基本信息
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),                                      // 用户ID，主键
  name: varchar('name', { length: 100 }),                             // 用户名称
  email: varchar('email', { length: 255 }).notNull().unique(),        // 电子邮箱，唯一
  passwordHash: text('password_hash').notNull(),                      // 密码哈希
  role: varchar('role', { length: 20 }).notNull().default('member'),  // 用户角色
  createdAt: timestamp('created_at').notNull().defaultNow(),          // 创建时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),          // 更新时间
  deletedAt: timestamp('deleted_at'),                                 // 删除时间（软删除）
});

/**
 * 团队表
 * 存储系统中的团队信息，包括订阅和计划相关数据
 */
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),                                      // 团队ID，主键
  name: varchar('name', { length: 100 }).notNull(),                   // 团队名称
  createdAt: timestamp('created_at').notNull().defaultNow(),          // 创建时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),          // 更新时间
  currentPlanId: integer('current_plan_id').references(() => plans.id), // 当前计划ID
  subscriptionStatus: varchar('subscription_status', { length: 20 }),   // 订阅状态
  subscriptionRenewsAt: timestamp('subscription_renews_at'),            // 订阅续费时间
  stripeCustomerId: text('stripe_customer_id').unique(),                // Stripe客户ID
  stripeSubscriptionId: text('stripe_subscription_id').unique(),        // Stripe订阅ID
  stripeProductId: text('stripe_product_id'),                           // Stripe产品ID
  planName: varchar('plan_name', { length: 50 }),                       // 计划名称
});

/**
 * 团队成员表
 * 存储用户与团队的关联关系
 */
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),                                      // 记录ID，主键
  userId: integer('user_id')                                          // 用户ID，外键
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')                                          // 团队ID，外键
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),                    // 成员角色
  joinedAt: timestamp('joined_at').notNull().defaultNow(),            // 加入时间
});

/**
 * 活动日志表
 * 记录系统中的用户活动，用于审计和跟踪
 */
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),                                      // 日志ID，主键
  teamId: integer('team_id')                                          // 团队ID，外键
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),              // 用户ID，外键
  action: text('action').notNull(),                                   // 活动类型
  timestamp: timestamp('timestamp').notNull().defaultNow(),           // 活动时间
  ipAddress: varchar('ip_address', { length: 45 }),                   // IP地址
});

/**
 * 邀请表
 * 存储团队成员邀请信息
 */
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),                                      // 邀请ID，主键
  teamId: integer('team_id')                                          // 团队ID，外键
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),                 // 被邀请人邮箱
  role: varchar('role', { length: 50 }).notNull(),                    // 邀请角色
  invitedBy: integer('invited_by')                                    // 邀请人ID，外键
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),          // 邀请时间
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 邀请状态
});

/**
 * 订阅计划表
 * 存储系统中可用的订阅计划信息
 */
export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),                                      // 计划ID，主键
  name: varchar('name', { length: 100 }).notNull(),                   // 计划名称
  description: text('description'),                                   // 计划描述
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),     // 价格
  interval: varchar('interval', { length: 20 }).notNull().default('month'), // 计费周期
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),    // 货币
  isActive: boolean('is_active').notNull().default(true),             // 是否激活
  creditsPerCycle: integer('credits_per_cycle').notNull(),            // 每周期积分数
  features: json('features').$type<string[]>(),                       // 功能列表
  stripeProductId: text('stripe_product_id').unique(),                // Stripe产品ID
  stripePriceId: text('stripe_price_id').unique(),                    // Stripe价格ID
  createdAt: timestamp('created_at').notNull().defaultNow(),          // 创建时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),          // 更新时间
  deletedAt: timestamp('deleted_at'),                                 // 删除时间（软删除）
});

/**
 * 团队表关系定义
 * 定义团队与其他表的关联关系
 */
export const teamsRelations = relations(teams, ({ many, one }) => ({
  teamMembers: many(teamMembers),       // 一个团队有多个成员
  activityLogs: many(activityLogs),     // 一个团队有多个活动日志
  invitations: many(invitations),       // 一个团队有多个邀请
  // creditBatches: many(creditBatches),
  // creditTransactions: many(creditTransactions),
  apiUsage: many(apiUsage),             // 一个团队有多个API使用记录
  apiKeys: many(apiKeys),               // 一个团队有多个API密钥
  plan: one(plans, {                    // 一个团队关联一个计划
    fields: [teams.stripeProductId],
    references: [plans.stripeProductId],
  }),
}));

/**
 * 用户表关系定义
 * 定义用户与其他表的关联关系
 */
export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),       // 一个用户可以是多个团队的成员
  invitationsSent: many(invitations),   // 一个用户可以发送多个邀请
  apiKeys: many(apiKeys),               // 一个用户可以创建多个API密钥
}));

/**
 * 邀请表关系定义
 * 定义邀请与团队和用户的关联关系
 */
export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {                    // 一个邀请属于一个团队
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {               // 一个邀请由一个用户发送
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

/**
 * 团队成员表关系定义
 * 定义团队成员与用户和团队的关联关系
 */
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {                    // 一个团队成员关联一个用户
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {                    // 一个团队成员属于一个团队
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

/**
 * 活动日志表关系定义
 * 定义活动日志与团队和用户的关联关系
 */
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {                    // 一个活动日志属于一个团队
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {                    // 一个活动日志关联一个用户
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

/**
 * 类型定义
 * 使用Drizzle的类型推断功能为数据库表定义TypeScript类型
 */
// 用户相关类型
export type User = typeof users.$inferSelect;                // 用户查询结果类型
export type NewUser = typeof users.$inferInsert;             // 用户插入数据类型

// 团队相关类型
export type Team = typeof teams.$inferSelect;                // 团队查询结果类型
export type NewTeam = typeof teams.$inferInsert;             // 团队插入数据类型

// 团队成员相关类型
export type TeamMember = typeof teamMembers.$inferSelect;    // 团队成员查询结果类型
export type NewTeamMember = typeof teamMembers.$inferInsert; // 团队成员插入数据类型

// 活动日志相关类型
export type ActivityLog = typeof activityLogs.$inferSelect;  // 活动日志查询结果类型
export type NewActivityLog = typeof activityLogs.$inferInsert; // 活动日志插入数据类型

// 邀请相关类型
export type Invitation = typeof invitations.$inferSelect;    // 邀请查询结果类型
export type NewInvitation = typeof invitations.$inferInsert; // 邀请插入数据类型

// 包含成员信息的团队数据类型
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// 计划相关类型
export type Plan = typeof plans.$inferSelect;               // 计划查询结果类型
export type NewPlan = typeof plans.$inferInsert;            // 计划插入数据类型

/**
 * 活动类型枚举
 * 定义系统中所有可能的活动类型
 */
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',                    // 注册
  SIGN_IN = 'SIGN_IN',                    // 登录
  SIGN_OUT = 'SIGN_OUT',                  // 登出
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',    // 更新密码
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',      // 删除账户
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',      // 更新账户
  CREATE_TEAM = 'CREATE_TEAM',            // 创建团队
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER', // 移除团队成员
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER', // 邀请团队成员
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',   // 接受邀请
  CREATE_API_KEY = 'CREATE_API_KEY',      // 创建API密钥
  REVOKE_API_KEY = 'REVOKE_API_KEY',      // 撤销API密钥
  API_KEY_USED = 'API_KEY_USED',          // 使用API密钥
}

/**
 * API密钥表
 * 存储用户创建的API访问密钥
 */
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),                                      // 密钥ID，主键
  userId: integer('user_id')                                          // 创建者ID，外键
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')                                          // 团队ID，外键
    .notNull()
    .references(() => teams.id),
  name: varchar('name', { length: 100 }).notNull(),                   // 密钥名称
  key: text('key').notNull().unique(),                                // 密钥值
  prefix: varchar('prefix', { length: 10 }).notNull(),                // 密钥前缀
  lastUsed: timestamp('last_used'),                                   // 最后使用时间
  expiresAt: timestamp('expires_at'),                                 // 过期时间
  createdAt: timestamp('created_at').notNull().defaultNow(),          // 创建时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),          // 更新时间
  revokedAt: timestamp('revoked_at'),                                 // 撤销时间
  permissions: json('permissions').$type<string[]>().default(['read']), // 权限列表
});

/**
 * API使用记录表
 * 跟踪API的使用情况，包括消耗的积分和执行时间
 */
export const apiUsage = pgTable('api_usage', {
  id: serial('id').primaryKey(),                                      // 记录ID，主键
  teamId: integer('team_id')                                          // 团队ID，外键
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),              // 用户ID，外键
  apiKeyId: integer('api_key_id').references(() => apiKeys.id),       // API密钥ID，外键
  endpoint: text('endpoint').notNull(),                               // 请求的端点
  creditsConsumed: integer('credits_consumed').notNull(),             // 消耗的积分
  executionTimeMs: integer('execution_time_ms'),                      // 执行时间（毫秒）
  responseStatus: integer('response_status'),                         // 响应状态码
  requestId: text('request_id'),                                      // 请求ID
  ipAddress: varchar('ip_address', { length: 45 }),                   // IP地址
  timestamp: timestamp('timestamp').notNull().defaultNow(),           // 请求时间
});

/**
 * API密钥表关系定义
 * 定义API密钥与用户和团队的关联关系
 */
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {                    // 一个API密钥关联一个创建者
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  team: one(teams, {                    // 一个API密钥属于一个团队
    fields: [apiKeys.teamId],
    references: [teams.id],
  }),
}));

/**
 * API使用记录表关系定义
 * 定义API使用记录与团队、用户和API密钥的关联关系
 */
export const apiUsageRelations = relations(apiUsage, ({ one }) => ({
  team: one(teams, {                    // 一个API使用记录属于一个团队
    fields: [apiUsage.teamId],
    references: [teams.id],
  }),
  user: one(users, {                    // 一个API使用记录关联一个用户
    fields: [apiUsage.userId],
    references: [users.id],
  }),
  apiKey: one(apiKeys, {                // 一个API使用记录关联一个API密钥
    fields: [apiUsage.apiKeyId],
    references: [apiKeys.id],
  }),
}));

/**
 * API密钥相关类型
 */
export type ApiKey = typeof apiKeys.$inferSelect;    // API密钥查询结果类型
export type NewApiKey = typeof apiKeys.$inferInsert; // API密钥插入数据类型
