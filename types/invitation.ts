// Invitation types
export const invitations = {
  id: "id",
  teamId: "team_id",
  email: "email",
  role: "role",
  invitedBy: "invited_by",
  invitedAt: "invited_at",
  status: "status",
};

export const invitationsRelations = {
  team: {
    table: "teams",
    relation: "one",
    foreignKey: "team_id",
    references: "id"
  },
  invitedBy: {
    table: "users",
    relation: "one",
    foreignKey: "invited_by",
    references: "id"
  },
};

export type Invitation = {
  id: number;
  teamId: number;
  email: string;
  role: string;
  invitedBy: number;
  invitedAt: Date;
  status: string;
};

export type NewInvitation = Omit<Invitation, "id" | "invitedAt" | "status">;
