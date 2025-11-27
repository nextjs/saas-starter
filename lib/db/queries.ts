import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { connectToDatabase } from './mongodb';
import { User, Team, ActivityLog } from './models';
import { Types } from 'mongoose';

export async function getUser() {
  await connectToDatabase();

  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'string'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  // Query for active user (deletedAt is null)
  const user = await User.findOne({
    _id: new Types.ObjectId(sessionData.user.id),
    deletedAt: null,
  }).lean();

  return user;
}

export async function getTeamByStripeCustomerId(customerId: string) {
  await connectToDatabase();

  const team = await Team.findOne({
    stripeCustomerId: customerId,
  }).lean();

  return team;
}

export async function updateTeamSubscription(
  teamId: string,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await connectToDatabase();

  await Team.updateOne(
    { _id: new Types.ObjectId(teamId) },
    {
      $set: {
        ...subscriptionData,
        updatedAt: new Date(),
      },
    }
  );
}

export async function getUserWithTeam(userId: string) {
  await connectToDatabase();

  const user = await User.findOne({
    _id: new Types.ObjectId(userId),
  }).lean();

  if (!user) {
    return null;
  }

  // Get the first team membership (if any)
  const teamId = user.teamMemberships?.[0]?.teamId;

  return {
    user,
    teamId: teamId ? teamId.toString() : null,
  };
}

export async function getActivityLogs() {
  await connectToDatabase();

  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Query activity logs for the user, sorted by timestamp descending
  const logs = await ActivityLog.find({
    userId: user._id,
  })
    .sort({ timestamp: -1 })
    .limit(10)
    .select('_id action timestamp ipAddress userName')
    .lean();

  // Map to match the old interface (id instead of _id)
  return logs.map((log) => ({
    id: log._id.toString(),
    action: log.action,
    timestamp: log.timestamp,
    ipAddress: log.ipAddress,
    userName: log.userName,
  }));
}

export async function getTeamForUser() {
  await connectToDatabase();

  const user = await getUser();
  if (!user) {
    return null;
  }

  // Get the first team membership
  const teamMembership = user.teamMemberships?.[0];
  if (!teamMembership) {
    return null;
  }

  // Fetch the team with all member details (already denormalized)
  const team = await Team.findOne({
    _id: teamMembership.teamId,
  }).lean();

  if (!team) {
    return null;
  }

  // Transform to match the old TeamDataWithMembers interface
  return {
    ...team,
    id: team._id.toString(),
    teamMembers: team.members.map((member) => ({
      id: member.userId.toString(),
      userId: member.userId.toString(),
      teamId: team._id.toString(),
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.userId.toString(),
        name: member.name || '',
        email: member.email,
      },
    })),
  };
}
