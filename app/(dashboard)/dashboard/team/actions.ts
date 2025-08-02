//<file path="app/(dashboard)/dashboard/team/actions.ts">
'use server';

import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
    users,
    teams,
    teamMembers,
    invitations,
    ActivityType,
    NewTeam,
    NewTeamMember,
} from '@/lib/db/schema';
import { getUser, getUserWithTeam, logActivity } from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

const removeTeamMemberSchema = z.object({
    memberId: z.coerce.number() // Use coerce for FormData values
});

export const removeTeamMember = validatedActionWithUser(
    removeTeamMemberSchema,
    async (data, _, user) => {
        const { memberId } = data;
        const userWithTeam = await getUserWithTeam(user.id);

        if (!userWithTeam?.teamId) {
            return { error: 'User is not part of a team' };
        }

        await db
            .delete(teamMembers)
            .where(
                and(
                    eq(teamMembers.id, memberId),
                    eq(teamMembers.teamId, userWithTeam.teamId)
                )
            );

        await logActivity(
            userWithTeam.teamId,
            user.id,
            ActivityType.REMOVE_TEAM_MEMBER
        );

        return { success: 'Team member removed successfully' };
    }
);

const inviteTeamMemberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['member', 'owner']),
    teamId: z.coerce.number()
});

export const inviteTeamMember = validatedActionWithUser(
    inviteTeamMemberSchema,
    async (data, _, user) => {
        const { email, role, teamId } = data;

        // Verify user is a member of the team they are inviting to
        const userMembership = await db.query.teamMembers.findFirst({
            where: and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, teamId))
        });
        if (!userMembership) {
            return { error: 'You are not a member of this team.' };
        }

        const existingMember = await db
            .select()
            .from(users)
            .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
            .where(
                and(eq(users.email, email), eq(teamMembers.teamId, teamId))
            )
            .limit(1);

        if (existingMember.length > 0) {
            return { error: 'User is already a member of this team' };
        }

        const existingInvitation = await db
            .select()
            .from(invitations)
            .where(
                and(
                    eq(invitations.email, email),
                    eq(invitations.teamId, teamId),
                    eq(invitations.status, 'pending')
                )
            )
            .limit(1);

        if (existingInvitation.length > 0) {
            return { error: 'An invitation has already been sent to this email' };
        }

        await db.insert(invitations).values({
            teamId: teamId,
            email,
            role,
            invitedBy: user.id,
            status: 'pending'
        });

        await logActivity(teamId, user.id, ActivityType.INVITE_TEAM_MEMBER);

        return { success: 'Invitation sent successfully' };
    }
);


const createTeamSchema = z.object({
    name: z.string().min(1, 'Team name is required').max(100)
});

export const createTeam = validatedActionWithUser(
    createTeamSchema,
    async (data, _, user) => {
        const { name } = data;

        const newTeam: NewTeam = { name };
        const [createdTeam] = await db.insert(teams).values(newTeam).returning();

        if (!createdTeam) {
            return { error: 'Failed to create team.' };
        }

        const newTeamMember: NewTeamMember = {
            userId: user.id,
            teamId: createdTeam.id,
            role: 'owner'
        };
        await db.insert(teamMembers).values(newTeamMember);

        await logActivity(createdTeam.id, user.id, ActivityType.CREATE_TEAM);

        revalidatePath('/dashboard/team');

        return { success: 'Team created successfully!', data: createdTeam };
    }
);