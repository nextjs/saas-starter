import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { getSpaceUploads } from '@/lib/db/queries/uploads';
import { fileListQuerySchema } from '@/lib/validations/upload';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { slug: spaceSlug } = await params;
    
    // Verify space exists
    const space = await getSpaceBySlug(spaceSlug);
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    // Verify user has access
    const hasAccess = await userHasSpaceAccess(
      session.user.id, 
      spaceSlug
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this space" },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedParams = fileListQuerySchema.parse(queryParams);
    
    // Get files
    const result = await getSpaceUploads(space.id, validatedParams);
    
    return NextResponse.json({
      space: {
        id: space.id,
        name: space.name,
        slug: space.slug,
      },
      files: result.uploads,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
    
  } catch (error: any) {
    console.error('Files list error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
