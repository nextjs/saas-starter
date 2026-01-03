import { creditService } from '@/lib/services/credit-service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { InsufficientCreditsError } from '@/lib/errors';

const schema = z.object({
  teamId: z.number(),
  userId: z.number().optional(),
  credits: z.number(),
  actionType: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  try {
    const { teamId, userId, credits, actionType, description, metadata } = result.data;
    const newBalance = await creditService.useCredits(
      teamId,
      userId ?? null,
      credits,
      actionType,
      description,
      metadata
    );
    return NextResponse.json(newBalance);
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
