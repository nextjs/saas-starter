'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { ActivityType } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { getUserWithTeam, logActivity } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { validatedActionWithUser } from '@/lib/auth/middleware';

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
    updatePasswordSchema,
    async (data, _, user) => {
        const { currentPassword, newPassword, confirmPassword } = data;
        const supabase = await createClient();

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return {
                currentPassword, newPassword, confirmPassword,
                error: 'Current password is incorrect.',
            };
        }
        if (currentPassword === newPassword) {
            return {
                currentPassword, newPassword, confirmPassword,
                error: 'New password must be different from the current password.',
            };
        }
        if (confirmPassword !== newPassword) {
            return {
                currentPassword, newPassword, confirmPassword,
                error: 'New password and confirmation password do not match.',
            };
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            console.error('Supabase password update error:', updateError);
            return {
                currentPassword, newPassword, confirmPassword,
                error: 'Failed to update password. Please try again.',
            };
        }

        const userWithTeam = await getUserWithTeam(user.id);
        await logActivity(
            userWithTeam?.teamId,
            user.id,
            ActivityType.UPDATE_PASSWORD
        );

        return { success: 'Password updated successfully.' };
    }
);

const deleteAccountSchema = z.object({
    password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
    deleteAccountSchema,
    async (data, _, user) => {
        const { password } = data;
        const supabase = await createClient();

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password,
        });

        if (signInError) {
            return {
                password,
                error: 'Incorrect password. Account deletion failed.',
            };
        }

        const userWithTeam = await getUserWithTeam(user.id);
        await logActivity(
            userWithTeam?.teamId,
            user.id,
            ActivityType.DELETE_ACCOUNT
        );

        const supabaseAdmin = await createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error('Supabase admin delete error:', deleteError);
            return {
                password,
                error: 'There was a problem deleting your account. Please try again.',
            };
        }

        await supabase.auth.signOut();
        redirect('/auth/login');
    }
);