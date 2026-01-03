import { creditService } from '@/lib/services/credit-service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  teamId: z.number(),
  requiredCredits: z.number(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  try {
    const { teamId, requiredCredits } = result.data;
    const balance = await creditService.getCreditBalance(teamId);
    const hasSufficientCredits = balance.balance >= requiredCredits;
    return NextResponse.json({ hasSufficientCredits });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
