'use server';

import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
    users,
    teams,
    teamMembers,
    activityLogs,
    type NewTeam,
    type NewTeamMember,
    type NewActivityLog,
    ActivityType,
    invitations, NewUser, User
} from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { createClient } from '@/lib/supabase/server';

import {
    validatedAction,
} from '@/lib/auth/middleware';

async function logActivity(
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

const signInSchema = z.object({
    email: z.string().email().min(3).max(255),
    password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
    const supabase = await createClient();
    const { email, password } = data;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return {
            error: 'Invalid email or password. Please try again.',
            email,
            password,
        };
    }

    const userWithTeam = await db
        .select({
            user: users,
            team: teams
        })
        .from(users)
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .leftJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(users.email, email))
        .limit(1);

    if (userWithTeam.length === 0) {
        return {
            error: 'Invalid email or password. Please try again.',
            email,
            password
        };
    }

    const { user: foundUser, team: foundTeam } = userWithTeam[0];

    await Promise.all([
        logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
    ]);

    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
        const priceId = formData.get('priceId') as string;
        return createCheckoutSession({ team: foundTeam, priceId });
    }

    redirect('/dashboard');
});

const signUpSchema = z
    .object({
        email: z.string().email(),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        repeatPassword: z.string().min(8),
        inviteId: z.string().optional()
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: 'Passwords do not match',
        path: ['repeatPassword']
    });


export const signUp = validatedAction(signUpSchema, async (data, formData) => {
    const supabase = await createClient();
    const { email, password, inviteId } = data;
    // Sign up the user in Supabase Auth
    const { data: { user: createdUser }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.BASE_URL}/auth/confirm`,
        }
    });

    if (error || !createdUser) {
        console.error('Sign up error:', error);
        return {
            error: 'Failed to create user. An account with this email may already exist.',
            email,
            password,
        };
    }

    if (!createdUser) {
        return {
            error: 'Failed to create user. Please try again.',
            email,
            password
        };
    }

    let teamId: number;
    let userRole: string;
    let createdTeam: typeof teams.$inferSelect | null = null;

    if (inviteId) {
        // Check if there's a valid invitation
        const [invitation] = await db
            .select()
            .from(invitations)
            .where(
                and(
                    eq(invitations.id, parseInt(inviteId)),
                    eq(invitations.email, email),
                    eq(invitations.status, 'pending')
                )
            )
            .limit(1);

        if (invitation) {
            teamId = invitation.teamId;
            userRole = invitation.role;

            await db
                .update(invitations)
                .set({ status: 'accepted' })
                .where(eq(invitations.id, invitation.id));

            await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

            [createdTeam] = await db
                .select()
                .from(teams)
                .where(eq(teams.id, teamId))
                .limit(1);
        } else {
            return { error: 'Invalid or expired invitation.', email, password };
        }
    } else {
        // Create a new team if there's no invitation
        const newTeam: NewTeam = {
            name: `${email}'s Team`
        };

        [createdTeam] = await db.insert(teams).values(newTeam).returning();

        if (!createdTeam) {
            return {
                error: 'Failed to create team. Please try again.',
                email,
                password
            };
        }

        teamId = createdTeam.id;
        userRole = 'owner';

        await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
    }

    const newTeamMember: NewTeamMember = {
        userId: createdUser.id,
        teamId: teamId,
        role: userRole
    };

    await db.update(users).set({
        role: userRole,
    }).where(eq(users.id, createdUser.id))

    await Promise.all([
        db.insert(teamMembers).values(newTeamMember),
        logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    ]);

    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
        const priceId = formData.get('priceId') as string;
        return createCheckoutSession({ team: createdTeam, priceId });
    }

    redirect('/auth/sign-up-success');
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const forgotPassword = validatedAction(forgotPasswordSchema, async ({ email }) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.BASE_URL}/auth/update-password`
    });

    const userWithTeam = await db
        .select({
            userId: users.id,
            teamId: teamMembers.teamId
        })
        .from(users)
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .where(eq(users.email, email))
        .limit(1);

    if (userWithTeam.length > 0 && userWithTeam[0].teamId) {
        await logActivity(userWithTeam[0].teamId, userWithTeam[0].userId, ActivityType.PASSWORD_RESET);
    }

    if (error) {
        console.error('Forgot password error:', error);
    }

    // To prevent email enumeration, we return a success message even if the email doesn't exist.
    return { success: 'If an account with this email exists, a password reset link has been sent.' };
});

const updatePasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        repeatPassword: z.string().min(8)
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: 'Passwords do not match',
        path: ['repeatPassword']
    });

export const updatePassword = validatedAction(updatePasswordSchema, async ({ password }) => {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.updateUser({ password });

    if (error) {
        return {
            error: 'Failed to update password. Your token may have expired. Please try again.'
        };
    }

    if (user) {
        const userWithTeam = await db
            .select({
                teamId: teamMembers.teamId
            })
            .from(teamMembers)
            .where(eq(teamMembers.userId, user.id))
            .limit(1);

        if (userWithTeam.length > 0 && userWithTeam[0].teamId) {
            await logActivity(userWithTeam[0].teamId, user.id, ActivityType.UPDATE_PASSWORD);
        }
    }

    redirect('/auth/login');
});