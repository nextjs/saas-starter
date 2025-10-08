import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { createUpload } from '@/lib/db/queries/uploads';
import { checkFileExists, getFileMetadata, verifyS3KeyBelongsToSpace } from '@/lib/s3/client';
import { uploadCompleteSchema } from '@/lib/validations/upload';

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
    
    // Parse and validate request
    const body = await request.json();
    const validatedData = uploadCompleteSchema.parse(body);
    
    // Verify S3 key belongs to this space
    if (!verifyS3KeyBelongsToSpace(validatedData.s3Key, spaceSlug)) {
      return NextResponse.json(
        { error: 'Invalid S3 key for this space' },
        { status: 400 }
      );
    }
    
    // Verify file exists in S3
    const fileExists = await checkFileExists(validatedData.s3Key);
    if (!fileExists) {
      return NextResponse.json(
        { error: 'File not found in S3. Upload may have failed.' },
        { status: 404 }
      );
    }
    
    // Get S3 metadata
    const s3Metadata = await getFileMetadata(validatedData.s3Key);
    
    // Save to database
    const upload = await createUpload({
      teamId: space.id,
      filename: validatedData.filename,
      s3Key: validatedData.s3Key,
      fileSize: validatedData.fileSize,
      contentType: validatedData.contentType,
      md5Hash: validatedData.md5Hash || null,
      description: validatedData.description || null,
      changelog: validatedData.changelog || null,
      version: validatedData.version || null,
      uploadedBy: session.user.id,
    });
    
    return NextResponse.json(
      {
        message: 'Upload recorded successfully',
        upload: {
          id: upload.id,
          filename: upload.filename,
          version: upload.version,
          uploadedAt: upload.uploadedAt,
        },
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Complete upload error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}
