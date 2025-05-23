import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { aiopProgress } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const aiopId = req.nextUrl.searchParams.get('aiopId');
  if (!aiopId) {
    return NextResponse.json({ error: 'Missing aiopId' }, { status: 400 });
  }
  try {
    const records = await db.query.aiopProgress.findMany({
      where: and(
        eq(aiopProgress.userId, user.id),
        eq(aiopProgress.aiopId, aiopId)
      ),
      columns: { documentId: true }
    });
    const docs = records.map(r => r.documentId);
    return NextResponse.json({ docs });
  } catch (error) {
    console.error('Error fetching AI-Op progress:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 