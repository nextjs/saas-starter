import { desc, and, eq } from 'drizzle-orm';
import { db } from './drizzle';
import {
    activityLogs,
    ActivityType,
    NewActivityLog,
    teamMembers,
    teams,
    users,
    teamRestaraunts,
} from './schema';
import { restaraunts } from './external';
import { createClient } from '@/lib/supabase/server';

export async function getUser() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return null;
    }
    const profile = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.id))
        .limit(1);

    if (profile.length === 0) {
        return null;
    }

    return profile[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
    const result = await db
        .select()
        .from(teams)
        .where(eq(teams.stripeCustomerId, customerId))
        .limit(1);

    return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
    teamId: number,
    subscriptionData: {
        stripeSubscriptionId: string | null;
        stripeProductId: string | null;
        planName: string | null;
        subscriptionStatus: string;
    }
) {
    await db
        .update(teams)
        .set({
            ...subscriptionData,
            updatedAt: new Date()
        })
        .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: string) {
    const result = await db
        .select({
            user: users,
            teamId: teamMembers.teamId
        })
        .from(users)
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .where(eq(users.id, userId))
        .limit(1);

    return result[0];
}

export async function getActivityLogs() {
    const user = await getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    return await db
        .select({
            id: activityLogs.id,
            action: activityLogs.action,
            timestamp: activityLogs.timestamp,
            ipAddress: activityLogs.ipAddress,
            userName: users.name
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.userId, users.id))
        .where(eq(activityLogs.userId, user.id))
        .orderBy(desc(activityLogs.timestamp))
        .limit(10);
}

export async function getTeamsForUser() {
    const user = await getUser();
    if (!user) {
        return [];
    }

    const teamMemberships = await db.query.teamMembers.findMany({
        where: eq(teamMembers.userId, user.id),
        with: {
            team: {
                with: {
                    teamMembers: {
                        with: {
                            user: {
                                columns: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    return teamMemberships.map((tm) => tm.team);
}


export async function logActivity(
    teamId: number | null | undefined,
    userId: string,
    type: ActivityType,
    ipAddress?: string
) {
    if (teamId === null || teamId === undefined) {
        return;
    }
    const newActivity: NewActivityLog = {
        teamId,
        userId,
        action: type,
        ipAddress: ipAddress || ''
    };
    await db.insert(activityLogs).values(newActivity);
}

export async function getRestarauntsForTeam(teamId: number) {
    const teamRestaurants = await db.query.teamRestaraunts.findMany({
        where: eq(teamRestaraunts.teamId, teamId),
        with: {
            restaraunt: true
        }
    });

    return teamRestaurants.map((tr) => tr.restaraunt);
}

export async function getRestarauntsForUser() {
    const user = await getUser();
    if (!user) {
        return [];
    }

    const teams = await getTeamsForUser();
    if (teams.length === 0) {
        return [];
    }

    const restaurantPromises = teams.map(team => getRestarauntsForTeam(team.id));
    const restaurantsByTeam = await Promise.all(restaurantPromises);

    const allRestaurants = restaurantsByTeam.flat();

    // Return a unique list of restaurants by ID
    return Array.from(new Map(allRestaurants.map(r => [r.id, r])).values());
}

export async function getRestarauntDetails(restarauntId: string) {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const hasAccess = await verifyUserRestaurantAccess(user.id, restarauntId);
    if (!hasAccess) throw new Error('Unauthorized access to restaurant details');

    return await db.query.restaraunts.findFirst({
        where: eq(restaraunts.id, restarauntId),
        with: {
            agentPrompts: true,
            menus: true,
            publicConfigurations: true
        }
    });
}

export async function verifyUserRestaurantAccess(
    userId: string,
    restaurantId: string
): Promise<boolean> {
    const userWithTeam = await getUserWithTeam(userId);
    if (!userWithTeam?.teamId) return false;

    const link = await db.query.teamRestaraunts.findFirst({
        where: and(
            eq(teamRestaraunts.teamId, userWithTeam.teamId),
            eq(teamRestaraunts.restarauntId, restaurantId)
        )
    });

    return !!link;
}