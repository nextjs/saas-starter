import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const ebayAccounts = pgTable(
  'ebay_accounts',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    sellerUsername: varchar('seller_username', { length: 255 }).notNull(),
    sellerAccountId: varchar('seller_account_id', { length: 255 }).notNull(),
    environment: varchar('environment', { length: 20 }).notNull(),
    defaultMarketplaceId: varchar('default_marketplace_id', { length: 50 }),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    lastSyncedAt: timestamp('last_synced_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    teamIdx: index('ebay_accounts_team_id_idx').on(table.teamId),
    statusIdx: index('ebay_accounts_status_idx').on(table.status),
    teamSellerEnvironmentUniqueIdx: uniqueIndex(
      'ebay_accounts_team_seller_environment_unique_idx'
    ).on(table.teamId, table.sellerAccountId, table.environment),
  })
);

export const ebayTokens = pgTable(
  'ebay_tokens',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    ebayAccountId: integer('ebay_account_id')
      .notNull()
      .references(() => ebayAccounts.id),
    encryptedAccessToken: text('encrypted_access_token').notNull(),
    encryptedRefreshToken: text('encrypted_refresh_token').notNull(),
    accessTokenExpiresAt: timestamp('access_token_expires_at').notNull(),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at').notNull(),
    scopes: text('scopes'),
    tokenType: varchar('token_type', { length: 50 }).notNull().default('Bearer'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    teamIdx: index('ebay_tokens_team_id_idx').on(table.teamId),
    ebayAccountIdx: index('ebay_tokens_ebay_account_id_idx').on(
      table.ebayAccountId
    ),
    accessTokenExpiresAtIdx: index(
      'ebay_tokens_access_token_expires_at_idx'
    ).on(table.accessTokenExpiresAt),
  })
);

export const ebayMarketplaces = pgTable(
  'ebay_marketplaces',
  {
    id: serial('id').primaryKey(),
    marketplaceId: varchar('marketplace_id', { length: 50 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    country: varchar('country', { length: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    siteId: varchar('site_id', { length: 20 }),
    isEnabled: boolean('is_enabled').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    marketplaceUniqueIdx: uniqueIndex(
      'ebay_marketplaces_marketplace_id_unique_idx'
    ).on(table.marketplaceId),
  })
);

export const syncJobs = pgTable(
  'sync_jobs',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    ebayAccountId: integer('ebay_account_id').references(() => ebayAccounts.id),
    jobType: varchar('job_type', { length: 50 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    startedAt: timestamp('started_at'),
    finishedAt: timestamp('finished_at'),
    recordsProcessed: integer('records_processed').notNull().default(0),
    recordsSucceeded: integer('records_succeeded').notNull().default(0),
    recordsFailed: integer('records_failed').notNull().default(0),
    errorMessage: text('error_message'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    teamIdx: index('sync_jobs_team_id_idx').on(table.teamId),
    ebayAccountIdx: index('sync_jobs_ebay_account_id_idx').on(
      table.ebayAccountId
    ),
    jobTypeIdx: index('sync_jobs_job_type_idx').on(table.jobType),
    statusIdx: index('sync_jobs_status_idx').on(table.status),
    createdAtIdx: index('sync_jobs_created_at_idx').on(table.createdAt),
  })
);

export const apiCallLogs = pgTable(
  'api_call_logs',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    ebayAccountId: integer('ebay_account_id').references(() => ebayAccounts.id),
    syncJobId: integer('sync_job_id').references(() => syncJobs.id),
    apiName: varchar('api_name', { length: 100 }).notNull(),
    endpoint: text('endpoint').notNull(),
    method: varchar('method', { length: 10 }).notNull(),
    statusCode: integer('status_code'),
    success: boolean('success').notNull().default(false),
    requestStartedAt: timestamp('request_started_at').notNull(),
    responseReceivedAt: timestamp('response_received_at'),
    durationMs: integer('duration_ms'),
    errorMessage: text('error_message'),
    requestId: varchar('request_id', { length: 255 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    teamIdx: index('api_call_logs_team_id_idx').on(table.teamId),
    ebayAccountIdx: index('api_call_logs_ebay_account_id_idx').on(
      table.ebayAccountId
    ),
    apiNameIdx: index('api_call_logs_api_name_idx').on(table.apiName),
    successIdx: index('api_call_logs_success_idx').on(table.success),
    statusCodeIdx: index('api_call_logs_status_code_idx').on(table.statusCode),
    createdAtIdx: index('api_call_logs_created_at_idx').on(table.createdAt),
  })
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    userId: integer('user_id').references(() => users.id),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: varchar('entity_id', { length: 255 }),
    action: varchar('action', { length: 100 }).notNull(),
    oldValue: jsonb('old_value').$type<Record<string, unknown>>(),
    newValue: jsonb('new_value').$type<Record<string, unknown>>(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    teamIdx: index('audit_logs_team_id_idx').on(table.teamId),
    userIdx: index('audit_logs_user_id_idx').on(table.userId),
    entityTypeIdx: index('audit_logs_entity_type_idx').on(table.entityType),
    entityIdIdx: index('audit_logs_entity_id_idx').on(table.entityId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  })
);

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  ebayAccounts: many(ebayAccounts),
  ebayTokens: many(ebayTokens),
  syncJobs: many(syncJobs),
  apiCallLogs: many(apiCallLogs),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  auditLogs: many(auditLogs),
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

export const ebayAccountsRelations = relations(ebayAccounts, ({ one, many }) => ({
  team: one(teams, {
    fields: [ebayAccounts.teamId],
    references: [teams.id],
  }),
  tokens: many(ebayTokens),
  syncJobs: many(syncJobs),
  apiCallLogs: many(apiCallLogs),
}));

export const ebayTokensRelations = relations(ebayTokens, ({ one }) => ({
  team: one(teams, {
    fields: [ebayTokens.teamId],
    references: [teams.id],
  }),
  ebayAccount: one(ebayAccounts, {
    fields: [ebayTokens.ebayAccountId],
    references: [ebayAccounts.id],
  }),
}));

export const syncJobsRelations = relations(syncJobs, ({ one, many }) => ({
  team: one(teams, {
    fields: [syncJobs.teamId],
    references: [teams.id],
  }),
  ebayAccount: one(ebayAccounts, {
    fields: [syncJobs.ebayAccountId],
    references: [ebayAccounts.id],
  }),
  apiCallLogs: many(apiCallLogs),
}));

export const apiCallLogsRelations = relations(apiCallLogs, ({ one }) => ({
  team: one(teams, {
    fields: [apiCallLogs.teamId],
    references: [teams.id],
  }),
  ebayAccount: one(ebayAccounts, {
    fields: [apiCallLogs.ebayAccountId],
    references: [ebayAccounts.id],
  }),
  syncJob: one(syncJobs, {
    fields: [apiCallLogs.syncJobId],
    references: [syncJobs.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  team: one(teams, {
    fields: [auditLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type EbayAccount = typeof ebayAccounts.$inferSelect;
export type NewEbayAccount = typeof ebayAccounts.$inferInsert;
export type EbayToken = typeof ebayTokens.$inferSelect;
export type NewEbayToken = typeof ebayTokens.$inferInsert;
export type EbayMarketplace = typeof ebayMarketplaces.$inferSelect;
export type NewEbayMarketplace = typeof ebayMarketplaces.$inferInsert;
export type SyncJob = typeof syncJobs.$inferSelect;
export type NewSyncJob = typeof syncJobs.$inferInsert;
export type ApiCallLog = typeof apiCallLogs.$inferSelect;
export type NewApiCallLog = typeof apiCallLogs.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

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
}
