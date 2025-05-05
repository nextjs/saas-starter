// ===================== 1. 导入区 =====================
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
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// ===================== 2. 主表定义 =====================
/** 用户表 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

/** 团队表 */
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  currentPlanId: integer('current_plan_id').references(() => plans.id),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  subscriptionRenewsAt: timestamp('subscription_renews_at'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
});

/** 订阅计划表 */
export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  interval: varchar('interval', { length: 20 }).notNull().default('month'),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  isActive: boolean('is_active').notNull().default(true),
  creditsPerCycle: integer('credits_per_cycle').notNull(),
  features: json('features').$type<string[]>(),
  stripeProductId: text('stripe_product_id').unique(),
  stripePriceId: text('stripe_price_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ===================== 3. 关联/中间表定义 =====================
/** 团队成员表 */
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  teamId: integer('team_id').notNull().references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

/** 邀请表 */
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by').notNull().references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

/** API密钥表 */
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  teamId: integer('team_id').notNull().references(() => teams.id),
  name: varchar('name', { length: 100 }).notNull(),
  key: text('key').notNull().unique(),
  prefix: varchar('prefix', { length: 10 }).notNull(),
  lastUsed: timestamp('last_used'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  revokedAt: timestamp('revoked_at'),
  permissions: json('permissions').$type<string[]>().default(['read']),
});

/** 积分批次表 */
export const creditBatches = pgTable('credit_batches', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  initialAmount: integer('initial_amount').notNull(),
  remainingAmount: integer('remaining_amount').notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  sourceRefId: text('source_ref_id'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/** 积分流水表 */
export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  batchId: integer('batch_id').references(() => creditBatches.id),
  amount: integer('amount').notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ===================== 4. 业务日志与使用记录表 =====================
/** 活动日志表 */
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

/** API使用记录表 */
export const apiUsage = pgTable('api_usage', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  apiKeyId: integer('api_key_id').references(() => apiKeys.id),
  endpoint: text('endpoint').notNull(),
  creditsConsumed: integer('credits_consumed').notNull(),
  executionTimeMs: integer('execution_time_ms'),
  responseStatus: integer('response_status'),
  requestId: text('request_id'),
  ipAddress: varchar('ip_address', { length: 45 }),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// ===================== 5. 所有表关系定义 =====================
export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  apiKeys: many(apiKeys),
}));

export const teamsRelations = relations(teams, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  creditBatches: many(creditBatches),
  creditTransactions: many(creditTransactions),
  apiUsage: many(apiUsage),
  apiKeys: many(apiKeys),
  plan: one(plans, {
    fields: [teams.currentPlanId],
    references: [plans.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  teams: many(teams),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [apiKeys.teamId],
    references: [teams.id],
  }),
}));

export const creditBatchesRelations = relations(creditBatches, ({ one, many }) => ({
  team: one(teams, {
    fields: [creditBatches.teamId],
    references: [teams.id],
  }),
  transactions: many(creditTransactions),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  team: one(teams, {
    fields: [creditTransactions.teamId],
    references: [teams.id],
  }),
  batch: one(creditBatches, {
    fields: [creditTransactions.batchId],
    references: [creditBatches.id],
  }),
  createdByUser: one(users, {
    fields: [creditTransactions.createdBy],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const apiUsageRelations = relations(apiUsage, ({ one }) => ({
  team: one(teams, {
    fields: [apiUsage.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [apiUsage.userId],
    references: [users.id],
  }),
  apiKey: one(apiKeys, {
    fields: [apiUsage.apiKeyId],
    references: [apiKeys.id],
  }),
}));

// ===================== 6. 类型与枚举 =====================
// 用户相关类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
// 团队相关类型
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
// 团队成员相关类型
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
// 活动日志相关类型
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
// 邀请相关类型
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
// 计划相关类型
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
// API密钥相关类型
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
// 积分相关类型
export type CreditBatch = typeof creditBatches.$inferSelect;
export type NewCreditBatch = typeof creditBatches.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type NewApiUsage = typeof apiUsage.$inferInsert;
// 复合类型
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};
export type TeamWithCredits = Team & {
  availableCredits: number;
  creditBatches: CreditBatch[];
};
export type ApiUsageStats = {
  endpoint: string;
  totalCalls: number;
  totalCreditsConsumed: number;
  averageExecutionTime: number;
};
// 枚举类型
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  CREATE_API_KEY = 'CREATE_API_KEY',
  REVOKE_API_KEY = 'REVOKE_API_KEY',
  API_KEY_USED = 'API_KEY_USED',
  UPDATE_TEAM_NAME = 'UPDATE_TEAM_NAME'
}
export enum CreditTransactionType {
  GRANT = 'grant',
  USAGE = 'usage',
  EXPIRE = 'expire',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}
export enum CreditSourceType {
  SUBSCRIPTION = 'subscription',
  TOPUP = 'topup',
  BONUS = 'bonus',
  TRIAL = 'trial',
  FREE_PLAN = 'free_plan',
}

// ===================== 7. zod 验证模式 =====================
export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
export const teamInsertSchema = createInsertSchema(teams);
export const teamSelectSchema = createSelectSchema(teams);
export const apiKeyInsertSchema = createInsertSchema(apiKeys);
export const apiKeySelectSchema = createSelectSchema(apiKeys);
// ... 其他表的zod schema 可按需添加 ...
