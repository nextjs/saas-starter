import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { generatePresignedUploadUrl } from '@/lib/s3/client';
import { uploadPresignSchema } from '@/lib/validations/upload';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';

export async function POST(
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
    
    // Verify user has access to space
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
    
    // Parse and validate request
    const body = await request.json();
    const validatedData = uploadPresignSchema.parse(body);
    
    // Generate pre-signed URL
    const result = await generatePresignedUploadUrl(
      spaceSlug,
      validatedData.filename,
      validatedData.contentType
    );
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Presign error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
