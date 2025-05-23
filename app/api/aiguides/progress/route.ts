import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { aiguidesProgress } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const guideId = req.nextUrl.searchParams.get('guideId');
  if (!guideId) {
    return NextResponse.json({ error: 'Missing guideId' }, { status: 400 });
  }
  try {
    const records = await db.query.aiguidesProgress.findMany({
      where: and(
        eq(aiguidesProgress.userId, user.id),
        eq(aiguidesProgress.guideId, guideId)
      ),
      columns: {
        documentId: true
      }
    });
    const docs = records.map(r => r.documentId);
    return NextResponse.json({ docs });
  } catch (error) {
    console.error('Error fetching guide progress:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 