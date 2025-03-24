// Activity logs schema and types
export const activityLogs = {
  id: "id",
  teamId: "team_id",
  userId: "user_id",
  action: "action",
  timestamp: "timestamp",
  ipAddress: "ip_address",
};

export const activityLogsRelations = {
  team: { 
    table: "teams", 
    relation: "one",
    foreignKey: "team_id",
    references: "id"
  },
  user: { 
    table: "users", 
    relation: "one",
    foreignKey: "user_id",
    references: "id"
  },
};

export type ActivityLog = {
  id: number;
  teamId: number;
  userId: number | null;
  action: string;
  timestamp: Date;
  ipAddress: string | null;
};

export type NewActivityLog = Omit<ActivityLog, "id" | "timestamp">;

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_TEAM = "CREATE_TEAM",
  REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
  INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
  ACCEPT_INVITATION = "ACCEPT_INVITATION",
}
