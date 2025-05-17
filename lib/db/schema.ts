import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text().notNull(),
  role: varchar({ length: 20 }).notNull().default('member'),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  deletedAt: timestamp(),
});

export const teams = pgTable('teams', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  stripeCustomerId: text().unique(),
  stripeSubscriptionId: text().unique(),
  stripeProductId: text(),
  planName: varchar({ length: 50 }),
  subscriptionStatus: varchar({ length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  teamId: integer()
    .notNull()
    .references(() => teams.id),
  role: varchar({ length: 50 }).notNull(),
  joinedAt: timestamp().notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial().primaryKey(),
  teamId: integer()
    .notNull()
    .references(() => teams.id),
  userId: integer().references(() => users.id),
  action: text().notNull(),
  timestamp: timestamp().notNull().defaultNow(),
  ipAddress: varchar({ length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial().primaryKey(),
  teamId: integer()
    .notNull()
    .references(() => teams.id),
  email: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 50 }).notNull(),
  invitedBy: integer()
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp().notNull().defaultNow(),
  status: varchar({ length: 20 }).notNull().default('pending'),
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
