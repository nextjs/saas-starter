'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, ActivityType } from '@/lib/db/schema';
import { getUserWithTeam, logActivity } from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';

const updateAccountSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
    updateAccountSchema,
    async (data, _, user) => {
        const { name, email } = data;
        const userWithTeam = await getUserWithTeam(user.id);

        await Promise.all([
            db.update(users).set({ name, email }).where(eq(users.id, user.id)),
            logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
        ]);

        return { name, success: 'Account updated successfully.' };
    }
);