import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { uploadFile, initUploadDirectory } from '@/lib/uploads/service';
import { db } from '@/lib/db/drizzle';
import { uploads } from '@/lib/db/schema';

// Initialize upload directory on server start
initUploadDirectory();

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return NextResponse.json(
        { error: 'User is not part of a team' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload file
    const uploadResult = await uploadFile(file, userWithTeam.teamId);

    // Save to database
    const [uploadRecord] = await db
      .insert(uploads)
      .values({
        teamId: userWithTeam.teamId,
        userId: user.id,
        filename: uploadResult.filename,
        originalFilename: uploadResult.originalFilename,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        path: uploadResult.path,
        url: uploadResult.url,
      })
      .returning();

    return NextResponse.json({
      success: true,
      upload: {
        id: uploadRecord.id,
        url: uploadRecord.url,
        filename: uploadRecord.originalFilename,
        mimeType: uploadRecord.mimeType,
        size: uploadRecord.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return NextResponse.json(
        { error: 'User is not part of a team' },
        { status: 403 }
      );
    }

    const teamUploads = await db
      .select({
        id: uploads.id,
        filename: uploads.originalFilename,
        mimeType: uploads.mimeType,
        size: uploads.size,
        url: uploads.url,
        createdAt: uploads.createdAt,
      })
      .from(uploads)
      .where(db.$with('uploads').teamId.eq(userWithTeam.teamId))
      .orderBy(db.$with('uploads').createdAt.desc())
      .limit(50);

    return NextResponse.json({ success: true, uploads: teamUploads });
  } catch (error) {
    console.error('Fetch uploads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}
