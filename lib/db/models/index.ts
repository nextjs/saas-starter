// Export all models
export { User } from './user.model';
export { Team } from './team.model';
export { Invitation } from './invitation.model';
export { ActivityLog } from './activityLog.model';

// Export all interfaces
export type { IUser, ITeamMembership } from './user.model';
export type { ITeam, ITeamMember } from './team.model';
export type { IInvitation } from './invitation.model';
export type { IActivityLog } from './activityLog.model';

// Activity type enum (matches old schema)
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

// Helper types for compatibility with old code
export type TeamDataWithMembers = ITeam;
