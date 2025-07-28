'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser, getUserWithTeam, logActivity } from '@/lib/db/queries';
import { ActivityType } from '@/lib/db/schema';

export async function signOut() {
    const supabase = await createClient();
    const user = await getUser();

    if (user) {
        const userWithTeam = await getUserWithTeam(user.id);
        await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
    }

    await supabase.auth.signOut();
    redirect('/');
}