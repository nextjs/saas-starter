import { creditService } from '@/lib/services/credit-service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { InsufficientCreditsError } from '@/lib/errors';

const schema = z.object({
  teamId: z.number(),
  prompt: z.string(),
});

async function generateAIContent(prompt: string) {
  // In a real application, this would call an AI service
  return `Generated content for prompt: ${prompt}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { teamId, prompt } = result.data;
  const requiredCredits = 10; // Define based on your pricing

  try {
    // Use credits first
    await creditService.useCredits(
      teamId,
      null, // userId if available
      requiredCredits,
      'ai_generation',
      `Generated content for prompt: ${prompt.substring(0, 50)}...`
    );

    // Then perform the actual operation
    const result = await generateAIContent(prompt);

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }
    // It's good practice to re-throw the error if it's not the one you're handling.
    throw error;
  }
}
