import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
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
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: json('metadata').$type<Record<string, any>>(),
});

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: uuid('invited_by').notNull().references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const userProgress = pgTable('user_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  lessonId: uuid('lesson_id').notNull(),
  completed: boolean('completed').notNull().default(false),
  lastAccessed: timestamp('last_accessed').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Table to track completion of AI Guides documents
export const aiguidesProgress = pgTable('aiguides_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  guideId: uuid('guide_id').notNull(),
  documentId: uuid('document_id').notNull(),
  completed: boolean('completed').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Table to track completion of AI-Driven Operating Procedures documents
export const aiopProgress = pgTable('aiop_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  aiopId: uuid('aiop_id').notNull(),
  documentId: uuid('document_id').notNull(),
  completed: boolean('completed').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const quizResults = pgTable('quiz_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().unique(),
  
  // User identification
  email: varchar('email', { length: 255 }),
  registeredEmail: varchar('registered_email', { length: 255 }),
  userId: uuid('user_id').references(() => users.id),
  
  // Quiz progress
  currentStep: integer('current_step'),
  lastCompletedStep: integer('last_completed_step'),
  score: integer('score'),
  
  // Quiz answers (stored as json backup)
  answers: json('answers').$type<Record<string, string | string[]>>(),
  
  // Single choice question answers
  q1_gender: text('q1_gender'), // What is your gender?
  q2_age_group: text('q2_age_group'), // What is your age group?
  q3_goal: text('q3_goal'), // What is your goal?
  q4_income_source: text('q4_income_source'), // What is your current income source?
  q5_work_hours: text('q5_work_hours'), // How many hours do you typically work each day?
  q7_income_range: text('q7_income_range'), // What is your current income range?
  q8_income_goal: text('q8_income_goal'), // What is your ideal income goal?
  q10_work_life_harmony: text('q10_work_life_harmony'), // Is achieving harmony between professional responsibilities and personal time important to you?
  q11_passion_prevented: text('q11_passion_prevented'), // Do you ever experience that your professional obligations prevent you from engaging in your personal passions?
  q12_flexibility_priority: text('q12_flexibility_priority'), // Do you consider flexibility in your income potential, workspace location, and schedule a priority in your career?
  q14_outside_employment: text('q14_outside_employment'), // Have you ventured into income-generating activities outside traditional employment?
  q15_contractor_consideration: text('q15_contractor_consideration'), // Have you contemplated offering your services as an independent contractor on a part-time basis?
  q16_ai_experience: text('q16_ai_experience'), // What is your level of experience with artificial intelligence applications?
  q17_ai_awareness: text('q17_ai_awareness'), // Are you aware that artificial intelligence technologies can enhance your efficiency and earning potential?
  q20_marketing_capabilities: text('q20_marketing_capabilities'), // How would you evaluate your existing capabilities in Online Marketing and Promotion?
  q24_monthly_income_goal: text('q24_monthly_income_goal'), // What is your desired monthly income goal from AI-powered online activities?
  q26_daily_time_commitment: text('q26_daily_time_commitment'), // What duration can you dedicate each day to developing your artificial intelligence skills?
  
  // Multi-choice question answers (stored as arrays)
  q19_professional_domains: json('q19_professional_domains').$type<string[]>(), // Which professional domains would appeal to you most if you pursued independent contract work?
  q22_ai_platforms: json('q22_ai_platforms').$type<string[]>(), // Which artificial intelligence platforms, applications, or technologies have you previously encountered or used?
  q25_success_celebration: json('q25_success_celebration').$type<string[]>(), // Upon achieving your financial objectives, how do you intend to celebrate your success?
  
  // Timestamps for key milestones
  q1_completed_at: timestamp('q1_completed_at'), // First question timestamp
  q10_completed_at: timestamp('q10_completed_at'), // Halfway point timestamp
  q20_completed_at: timestamp('q20_completed_at'), // Near-end timestamp
  q27_completed_at: timestamp('q27_completed_at'), // Summary view timestamp
  
  // Form data
  newsletterOptedIn: boolean('newsletter_opted_in').default(false),
  termsAccepted: boolean('terms_accepted').default(false),
  
  // Timing information
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  timeSpentSeconds: integer('time_spent_seconds'),
  
  // Analytics data
  referrer: text('referrer'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  browser: text('browser'),
  device: text('device'),
});

// Add lessonRatings table to store lesson ratings
export const lessonRatings = pgTable('lesson_ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  lessonId: uuid('lesson_id').notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  progress: many(userProgress),
  ratings: many(lessonRatings),
  quizResults: many(quizResults),
  aiopProgress: many(aiopProgress),
  aiguidesProgress: many(aiguidesProgress),
  challengeProgress: many(challengeProgress),
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

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

// Define prompts table for daily prompt content
export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  paragraph_content: text('paragraph_content'),
  code_content: text('code_content'),
  content_date: timestamp('content_date').notNull(),
});

// Define tools table for dynamic tools
export const tools = pgTable('tool', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }),
  code_content: varchar('code_content', { length: 255 }),
  paragraph_content: text('paragraph_content'),
  content_date: timestamp('content_date').notNull(),
  icon: text('icon'),
  link: text('link'),
  tags: text('tags'),
  price_model: text('price_model'),
  price: text('price'),
  billing: text('billing'),
  refund: text('refund'),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const aiTools = pgTable('ai_tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  url: text('url'),
  price_model: varchar('price_model', { length: 50 }),
  price: varchar('price', { length: 50 }),
  billing: varchar('billing', { length: 50 }),
  refund: varchar('refund', { length: 50 }),
  tags: json('tags').$type<string[]>(),
  type: varchar('type', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const challengeProgress = pgTable('challenge_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  challengeId: uuid('challenge_id').notNull(),
  startDate: timestamp('start_date').notNull().defaultNow(),
  lastCompletedDay: integer('last_completed_day').notNull().default(0),
  dayCompletionDates: json('day_completion_dates').$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  time_duration: text('time_duration'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

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

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

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
  LESSON_COMPLETED = 'LESSON_COMPLETED',
  LESSON_RATED = 'LESSON_RATED',
}

export type Prompt = typeof prompts.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type AiTool = typeof aiTools.$inferSelect;
export type NewAiTool = typeof aiTools.$inferInsert;

export type LessonRating = typeof lessonRatings.$inferSelect;
export type NewLessonRating = typeof lessonRatings.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type QuizResult = typeof quizResults.$inferSelect;
export type NewQuizResult = typeof quizResults.$inferInsert;

export type AiopProgress = typeof aiopProgress.$inferSelect;
export type NewAiopProgress = typeof aiopProgress.$inferInsert;

export type AiguidesProgress = typeof aiguidesProgress.$inferSelect;
export type NewAiguidesProgress = typeof aiguidesProgress.$inferInsert;

export type NewPrompt = typeof prompts.$inferInsert;

export type ChallengeProgress = typeof challengeProgress.$inferSelect;
export type NewChallengeProgress = typeof challengeProgress.$inferInsert;

export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
