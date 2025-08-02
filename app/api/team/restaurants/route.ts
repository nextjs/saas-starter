import { NextResponse } from 'next/server';
import {getTeamForUser, getRestarauntsForTeam, getTeamsForUser, getRestarauntsForUser} from '@/lib/db/queries';

export async function GET() {
    try {
        const teams = await getTeamsForUser();
        if (!teams) {
            return NextResponse.json(
                { error: 'User is not part of any team' },
                { status: 403 }
            );
        }
        const restaurants = await getRestarauntsForUser();
        return NextResponse.json(restaurants);
    } catch (error) {
        console.error('Failed to fetch restaurants:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}