//<file path="app/api/team/restaurants/[id]/route.ts">
import { NextResponse } from 'next/server';
import { getRestarauntDetails } from '@/lib/db/queries';

export async function GET(
    request: Request,
    { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
    try {
        // Await the promise to get the actual params object
        const params = await paramsPromise;
        const restaurantId = params.id;

        if (!restaurantId) {
            return NextResponse.json(
                { error: 'Restaurant ID is required' },
                { status: 400 }
            );
        }
        const details = await getRestarauntDetails(restaurantId);
        if (!details) {
            return NextResponse.json(
                { error: 'Restaurant not found or access denied' },
                { status: 404 }
            );
        }
        return NextResponse.json(details);
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Failed to fetch restaurant details:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}