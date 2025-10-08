import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { getUploadById } from '@/lib/db/queries/uploads';
import { generatePresignedDownloadUrl } from '@/lib/s3/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { slug, id } = await params;
    const spaceSlug = slug;
    const uploadId = parseInt(id);
    
    if (isNaN(uploadId)) {
      return NextResponse.json({ error: 'Invalid upload ID' }, { status: 400 });
    }
    
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
    
    // Get upload details
    const upload = await getUploadById(uploadId);
    if (!upload) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Verify upload belongs to this space
    if (upload.teamId !== space.id) {
      return NextResponse.json(
        { error: 'File not found in this space' },
        { status: 404 }
      );
    }
    
    // Generate download URL
    const downloadUrl = await generatePresignedDownloadUrl(
      upload.s3Key,
      upload.filename
    );
    
    return NextResponse.json({
      downloadUrl,
      expiresIn: 3600,
      filename: upload.filename,
    });
    
  } catch (error: any) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
