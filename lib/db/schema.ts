import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uuid
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import {authUsers} from "@/lib/db/external";

import {
  restaraunts,
  agentPrompts,
  menus,
  publicConfigurations
} from '@/lib/db/external';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
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
  userId: uuid('user_id') // <-- CHANGED from integer
      .notNull()
      .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const teamRestaraunts = pgTable('team_restaraunts', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' })
      .unique(),
  restarauntId: uuid('restaraunt_id') // Keeping spelling consistent
      .notNull()
      .references(() => restaraunts.id, { onDelete: 'cascade' })
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: uuid('user_id').references(() => users.id),
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
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
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

export const teamRestarauntsRelations = relations(
    teamRestaraunts,
    ({ one }) => ({
      team: one(teams, {
        fields: [teamRestaraunts.teamId],
        references: [teams.id]
      }),
      restaraunt: one(restaraunts, {
        fields: [teamRestaraunts.restarauntId],
        references: [restaraunts.id]
      })
    })
);

export const restarauntsRelations = relations(restaraunts, ({ many }) => ({
  agentPrompts: many(agentPrompts),
  menus: many(menus),
  publicConfigurations: many(publicConfigurations),
  teamRestaraunts: many(teamRestaraunts)
}));

export const agentPromptsRelations = relations(agentPrompts, ({ one }) => ({
  restaraunt: one(restaraunts, {
    fields: [agentPrompts.restaurantId],
    references: [restaraunts.id]
  })
}));

export const menusRelations = relations(menus, ({ one }) => ({
  restaraunt: one(restaraunts, {
    fields: [menus.restaurantId],
    references: [restaraunts.id]
  })
}));

export const publicConfigurationsRelations = relations(
    publicConfigurations,
    ({ one }) => ({
      restaraunt: one(restaraunts, {
        fields: [publicConfigurations.restaurantId],
        references: [restaraunts.id]
      })
    })
);

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
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export type Restaraunt = typeof restaraunts.$inferSelect;
export type NewRestaraunt = typeof restaraunts.$inferInsert;
export type AgentPrompt = typeof agentPrompts.$inferSelect;
export type NewAgentPrompt = typeof agentPrompts.$inferInsert;
export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
export type PublicConfiguration = typeof publicConfigurations.$inferSelect;
export type NewPublicConfiguration = typeof publicConfigurations.$inferInsert;
export type TeamRestaraunt = typeof teamRestaraunts.$inferSelect;
export type NewTeamRestaraunt = typeof teamRestaraunts.$inferInsert;
export { agentTypeEnum } from '@/lib/db/external';


export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  CREATE_RESTAURANT = 'CREATE_RESTAURANT',
  UPDATE_RESTAURANT = 'UPDATE_RESTAURANT',
  DELETE_RESTAURANT = 'DELETE_RESTAURANT'
}
