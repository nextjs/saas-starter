import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session-server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';
import { lessonRatings, activityLogs, ActivityType } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import posthog from 'posthog-js';

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

export async function POST(request: NextRequest) {
  try {
    // Authenticate and get session data
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch full user record to get username
    const dbUser = await getUser();
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Use name if available, otherwise fallback to email
    const userName = dbUser.name || dbUser.email;
    // Extract client IP address
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.ip ||
      request.headers.get('host') ||
      '';

    const data = await request.json();
    const lessonId = data.lessonId;
    const rating = data.rating;
    const comment = data.comment;
    
    if (!lessonId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
    }

    // Convert lessonId to UUID format
    const validLessonId = ensureUuid(lessonId.toString());

    // Add column if doesn't exist using raw SQL
    try {
      await db.execute(sql`
        ALTER TABLE public.lesson_ratings 
        ADD COLUMN IF NOT EXISTS lesson_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
      `);
    } catch (err) {
      console.warn("Could not add lesson_id column, might already exist:", err);
    }

    // Use raw SQL to insert directly to avoid schema issues
    let result;
    try {
      // First check if record exists
      const existingRecords = await db.execute(sql`
        SELECT id FROM public.lesson_ratings 
        WHERE user_id = ${session.user.id} AND lesson_id = ${validLessonId}
      `);
      
      // Bezpieczne sprawdzenie wyników
      const hasExistingRecord = existingRecords && 
                               existingRecords.rows && 
                               existingRecords.rows.length > 0;
      
      if (hasExistingRecord) {
        // Update existing
        result = await db.execute(sql`
          UPDATE public.lesson_ratings 
          SET rating = ${rating}, comment = ${comment}, user_name = ${userName}, ip_address = ${ip}, updated_at = NOW()
          WHERE user_id = ${session.user.id} AND lesson_id = ${validLessonId}
          RETURNING *
        `);
      } else {
        // Insert new
        result = await db.execute(sql`
          INSERT INTO public.lesson_ratings 
          (id, user_id, lesson_id, user_name, ip_address, rating, comment, created_at, updated_at)
          VALUES 
          (gen_random_uuid(), ${session.user.id}, ${validLessonId}, ${userName}, ${ip}, ${rating}, ${comment}, NOW(), NOW())
          RETURNING *
        `);
      }
    } catch (sqlError) {
      console.error("SQL Error in lesson rating:", sqlError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Log to activity_logs table using raw SQL to avoid schema issues
    try {
      // Sprawdź, czy teamId istnieje
      if (dbUser.teamId) {
        await db.execute(sql`
          INSERT INTO public.activity_logs 
          (id, team_id, user_id, action, timestamp, ip_address)
          VALUES 
          (gen_random_uuid(), ${dbUser.teamId}, ${session.user.id}, ${ActivityType.LESSON_RATED}, NOW(), ${ip})
        `);
      } else {
        console.log("Skipping activity log - user has no team");
        // Możemy też spróbować znaleźć domyślny zespół
        const defaultTeam = await db.execute(sql`SELECT id FROM public.teams LIMIT 1`);
        if (defaultTeam && defaultTeam.rows && defaultTeam.rows.length > 0) {
          const teamId = defaultTeam.rows[0].id;
          await db.execute(sql`
            INSERT INTO public.activity_logs 
            (id, team_id, user_id, action, timestamp, ip_address)
            VALUES 
            (gen_random_uuid(), ${teamId}, ${session.user.id}, ${ActivityType.LESSON_RATED}, NOW(), ${ip})
          `);
        }
      }
    } catch (logError) {
      console.error("Error logging activity:", logError);
    }

    // Track in PostHog
    try {
      // Try to initialize PostHog if not already initialized (server-side)
      if (!posthog.__loaded && process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'
        });
      }
      
      // Send the event to PostHog
      posthog.capture('lesson_rated', {
        userId: session.user.id,
        lessonId: validLessonId,
        rating,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error sending PostHog event for lesson rating:', err);
    }

    // Bezpieczne wydobycie danych z wyniku
    const resultData = result && result.rows && result.rows.length > 0 
      ? result.rows[0] 
      : { id: 'unknown', rating };

    return NextResponse.json({ success: true, data: resultData });
  } catch (error) {
    console.error('Error rating lesson:', error);
    return NextResponse.json({ error: 'Failed to rate lesson' }, { status: 500 });
  }
} 