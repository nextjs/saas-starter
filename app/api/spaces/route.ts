import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserSpaces } from '@/lib/db/queries/spaces';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's spaces
    const spaces = await getUserSpaces(session.user.id);
    
    return NextResponse.json({
      spaces: spaces.map(space => ({
        id: space.id,
        name: space.name,
        slug: space.slug,
        description: space.description,
        role: space.userRole,
        memberCount: space.memberCount,
        fileCount: space.fileCount,
        totalSize: space.totalSize,
      })),
    });
    
  } catch (error: any) {
    console.error('Spaces list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
