import { db } from '@/lib/db/drizzle';
import { creditUsageLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  teamId: z.coerce.number(),
  limit: z.coerce.number().optional().default(10),
  offset: z.coerce.number().optional().default(0),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = schema.safeParse(Object.fromEntries(searchParams.entries()));

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  try {
    const { teamId, limit, offset } = result.data;
    const history = await db
      .select()
      .from(creditUsageLogs)
      .where(eq(creditUsageLogs.teamId, teamId))
      .orderBy(creditUsageLogs.createdAt)
      .limit(limit)
      .offset(offset);
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
