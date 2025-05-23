import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { aiguidesProgress } from '@/lib/db/schema';
import { db } from '@/lib/db/drizzle';

// Helper function to convert numeric or string IDs to a valid UUID format
function ensureUuid(id: string): string {
  // Check if the ID is already a valid UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(id)) {
    return id;
  }

  // If it's a simple number/string, convert it to a valid UUID format
  return `00000000-0000-0000-0000-${id.padStart(12, '0')}`;
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const guideId = formData.get('guideId') as string;
  const documentId = formData.get('documentId') as string;
  if (!guideId || !documentId) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  try {
    // Convert both IDs to valid UUIDs
    const validGuideId = ensureUuid(guideId);
    const validDocumentId = ensureUuid(documentId);
    
    await db.insert(aiguidesProgress).values({
      userId: user.id,
      guideId: validGuideId,
      documentId: validDocumentId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving guide progress:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 