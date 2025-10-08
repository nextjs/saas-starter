import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { getUploadById, deleteUpload } from '@/lib/db/queries/uploads';
import { hasSpacePermission } from '@/lib/db/queries/spaceMembers';

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
    
    return NextResponse.json({
      id: upload.id,
      filename: upload.filename,
      s3Key: upload.s3Key,
      fileSize: upload.fileSize,
      contentType: upload.contentType,
      md5Hash: upload.md5Hash,
      description: upload.description,
      changelog: upload.changelog,
      version: upload.version,
      space: {
        id: space.id,
        name: space.name,
        slug: space.slug,
      },
      uploadedBy: upload.uploadedByUser,
      uploadedAt: upload.uploadedAt,
    });
    
  } catch (error: any) {
    console.error('File details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Check delete permission
    const canDelete = await hasSpacePermission(
      space.id,
      session.user.id,
      'delete'
    );
    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete files' },
        { status: 403 }
      );
    }
    
    // Get upload details first
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
    
    // Delete from database
    await deleteUpload(uploadId);
    
    return NextResponse.json({
      message: 'File deleted successfully',
    });
    
  } catch (error: any) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
