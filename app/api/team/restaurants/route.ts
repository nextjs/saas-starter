import { NextResponse } from 'next/server';
import { getTeamForUser, getRestarauntsForTeam } from '@/lib/db/queries';

export async function GET() {
    try {
        const team = await getTeamForUser();
        if (!team) {
            return NextResponse.json(
                { error: 'User is not part of a team' },
                { status: 403 }
            );
        }

        const restaurants = await getRestarauntsForTeam(team.id);
        return NextResponse.json(restaurants);
    } catch (error) {
        console.error('Failed to fetch restaurants:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}