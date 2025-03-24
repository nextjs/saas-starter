// Team types
export const teams = {
  id: "id",
  name: "name",
  createdAt: "created_at",
  updatedAt: "updated_at",
  stripeCustomerId: "stripe_customer_id",
  stripeSubscriptionId: "stripe_subscription_id",
  stripeProductId: "stripe_product_id",
  planName: "plan_name",
  subscriptionStatus: "subscription_status",
};

// Team members schema
export const teamMembers = {
  id: "id",
  userId: "user_id",
  teamId: "team_id",
  role: "role",
  joinedAt: "joined_at",
};

// Define relationships between tables
export const teamsRelations = {
  teamMembers: { table: "team_members", relation: "many" },
  activityLogs: { table: "activity_logs", relation: "many" },
  invitations: { table: "invitations", relation: "many" },
};

export const teamMembersRelations = {
  user: {
    table: "users",
    relation: "one",
    foreignKey: "user_id",
    references: "id"
  },
  team: {
    table: "teams",
    relation: "one",
    foreignKey: "team_id",
    references: "id"
  },
};

// Type definitions for team
export type Team = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeProductId: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
};

export type NewTeam = Omit<Team, "id" | "createdAt" | "updatedAt">;

export type TeamMember = {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  joinedAt: Date;
};

export type NewTeamMember = Omit<TeamMember, "id" | "joinedAt">;

export type TeamDataWithMembers = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeProductId: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
  members: {
    id: number;
    userId: number;
    role: string;
    user: {
      id: number;
      name: string | null;
      email: string;
    };
  }[];
};
