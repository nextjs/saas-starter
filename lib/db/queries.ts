import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
// import { TeamDataWithMembers } from '@/types/team';
// import { teams, teamMembers } from "@/types/team";
// import { users } from "@/types/user";

// Get the current user from Supabase
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get team for a user
/*
export async function getTeamForUser(userId: string): Promise<TeamDataWithMembers | null> {
  try {
    console.log(`Getting team for user ID: ${userId}`);

    // First get the user's team ID from the team_members table
    const teamMembersResult = await db
      .select({
        teamId: teamMembers.teamId,
      })
      .from(teamMembers)
      .where(sql`${teamMembers.userId} = ${userId}`)
      .limit(1);

    if (teamMembersResult.length === 0) {
      console.log(`No team found for user ID: ${userId}`);
      return null;
    }

    const teamId = teamMembersResult[0].teamId;
    console.log(`Found team ID: ${teamId} for user ID: ${userId}`);

    // Then get the team data with members
    const teamData = await db
      .select({
        id: teams.id,
        name: teams.name,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        stripeCustomerId: teams.stripeCustomerId,
        stripeSubscriptionId: teams.stripeSubscriptionId,
        stripeProductId: teams.stripeProductId,
        planName: teams.planName,
        subscriptionStatus: teams.subscriptionStatus,
      })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (teamData.length === 0) {
      console.log(`Team with ID: ${teamId} not found`);
      return null;
    }

    // Get all team members
    const members = await db
      .select({
        id: teamMembers.id,
        userId: teamMembers.userId,
        role: teamMembers.role,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));

    // Filter out any null users and ensure the type is correct
    const validMembers = members.filter(member => member.user !== null).map(member => ({
      ...member,
      user: member.user!  // Non-null assertion since we filtered nulls
    }));

    return {
      ...teamData[0],
      members: validMembers,
      stripeCustomerId: teamData[0].stripeCustomerId || null,
      stripeSubscriptionId: teamData[0].stripeSubscriptionId || null,
      stripeProductId: teamData[0].stripeProductId || null,
      planName: teamData[0].planName || null,
      subscriptionStatus: teamData[0].subscriptionStatus || null,
    };
  } catch (error) {
    console.error('Error getting team for user:', error);
    return null;
  }
}

// Get user with team data
export async function getUserWithTeam(userId: string) {
  try {
    const teamMembersResult = await db
      .select({
        teamId: teamMembers.teamId,
        role: teamMembers.role,
      })
      .from(teamMembers)
      .where(sql`${teamMembers.userId} = ${userId}`)
      .limit(1);

    if (teamMembersResult.length === 0) {
      return null;
    }

    return teamMembersResult[0];
  } catch (error) {
    console.error('Error getting user with team:', error);
    return null;
  }
}

// Log activity (keeping this for compatibility, but it needs to be updated to work with string user IDs)
export async function logActivity(
  teamId: number,
  userId: string,
  action: string,
  ipAddress?: string
) {
  console.log(`Activity logged: ${action} by user ${userId} in team ${teamId}`);
  // This function would need to be updated to handle string user IDs
  // For now, we'll just log the activity
}
*/
