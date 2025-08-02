import { NextRequest } from 'next/server';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getTeamsForUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
    // Get all teams for the current user.
    const teams = await getTeamsForUser();

    // A more advanced implementation might involve asking the user which team
    // they are purchasing for if they belong to multiple teams.
    const team = teams.length > 0 ? teams[0] : null;

    const formData = await request.formData();
    const priceId = formData.get('priceId') as string;
    const deviceCount = parseInt((formData.get('deviceCount') as string) || '0', 10);
    const interval = (formData.get('interval') as 'month' | 'year') || 'month';

    // The createCheckoutSession function already handles cases for both
    // logged-in and logged-out users, redirecting them appropriately.
    await createCheckoutSession({
        team,
        priceId,
        deviceCount,
        interval,
    });
}