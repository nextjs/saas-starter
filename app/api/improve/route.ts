import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTodayUsage, incrementUsage, getUserDailyLimit, saveImprovement } from '@/lib/db/queries';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

// Helper to get or create session ID for anonymous users
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('anonymous_session')?.value;

  if (!sessionId) {
    sessionId = randomBytes(32).toString('hex');
  }

  return sessionId;
}

// Function to improve text using Claude API
async function improveText(text: string, type: 'prompt' | 'email'): Promise<string> {
  const systemPrompt = type === 'prompt'
    ? `Du er en ekspert på å forbedre AI-prompts. Din oppgave er å ta en prompt og gjøre den tydeligere, mer spesifikk og mer effektiv.

    Fokuser på:
    - Klarhet og presisjon
    - Spesifikke instruksjoner
    - Kontekst og eksempler der det er nyttig
    - Strukturert formatering
    - Tydelige forventninger til output

    Returner kun den forbedrede prompten, ingen forklaringer.`
    : `Du er en ekspert på profesjonell e-postkommunikasjon. Din oppgave er å forbedre e-poster for å gjøre dem mer profesjonelle, klare og effektive.

    Fokuser på:
    - Høflig og profesjonell tone
    - Klar struktur
    - Konsis og presis kommunikasjon
    - Riktig formatering
    - Actionable call-to-action der relevant

    Returner kun den forbedrede e-posten, ingen forklaringer.`;

  // Check if ANTHROPIC_API_KEY is available
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback: Return a mock improved version
    return `[DEMO MODE - Legg til ANTHROPIC_API_KEY i .env for ekte AI-forbedring]\n\n${type === 'prompt' ? 'Forbedret Prompt' : 'Forbedret E-post'}:\n\n${text}\n\n[Dette er en demo-versjon. Teksten ville blitt forbedret av Claude AI med en ekte API-nøkkel]`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: text,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Kunne ikke forbedre teksten. Prøv igjen senere.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, type } = body;

    if (!text || !type) {
      return NextResponse.json(
        { error: 'Tekst og type er påkrevd' },
        { status: 400 }
      );
    }

    if (type !== 'prompt' && type !== 'email') {
      return NextResponse.json(
        { error: 'Type må være "prompt" eller "email"' },
        { status: 400 }
      );
    }

    // Get user or session
    const user = await getUser();
    const sessionId = user ? null : await getSessionId();
    const userId = user?.id || null;

    // Check usage limits
    const dailyLimit = await getUserDailyLimit(userId);
    const todayUsage = await getTodayUsage(userId, sessionId);
    const currentCount = todayUsage?.count || 0;

    if (currentCount >= dailyLimit) {
      return NextResponse.json(
        {
          error: 'Daglig grense nådd',
          message: userId
            ? 'Du har nådd din daglige grense. Oppgrader for flere forbedringer!'
            : 'Du har brukt opp dine gratis forbedringer. Registrer deg for flere!'
        },
        { status: 429 }
      );
    }

    // Improve the text
    const improvedText = await improveText(text, type);

    // Track usage
    const newCount = await incrementUsage(userId, sessionId);

    // Save improvement
    await saveImprovement(userId, sessionId, type, text, improvedText);

    // Set session cookie for anonymous users
    if (!user && sessionId) {
      const response = NextResponse.json({
        improvedText,
        usageCount: newCount,
        usageLimit: dailyLimit,
      });

      response.cookies.set('anonymous_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json({
      improvedText,
      usageCount: newCount,
      usageLimit: dailyLimit,
    });
  } catch (error) {
    console.error('Error in improve API:', error);
    return NextResponse.json(
      { error: 'En feil oppstod. Vennligst prøv igjen.' },
      { status: 500 }
    );
  }
}
