import { creditService } from '@/lib/services/credit-service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  teamId: z.coerce.number(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = schema.safeParse(Object.fromEntries(searchParams.entries()));

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  try {
    const balance = await creditService.getCreditBalance(result.data.teamId);
    return NextResponse.json(balance);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
