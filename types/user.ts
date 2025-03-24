// User types
export const users = {
  id: "id",
  name: "name",
  email: "email",
  passwordHash: "password_hash",
  role: "role",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
};

export const usersRelations = {
  teamMembers: { table: "team_members", relation: "many" },
  invitationsSent: { table: "invitations", relation: "many" },
};

// Type definitions for user
export type User = {
  id: number;
  name: string | null;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type NewUser = Omit<User, "id" | "createdAt" | "updatedAt">;
