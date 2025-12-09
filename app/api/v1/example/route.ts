import { NextRequest, NextResponse } from 'next/server';
import { withApiKey } from '@/lib/auth/api-middleware';

/**
 * Example API endpoint protected by API key authentication
 *
 * Usage:
 * curl -H "Authorization: Bearer sk_xxxx_yyyy" https://your-domain.com/api/v1/example
 */
export async function GET(request: NextRequest) {
  const auth = await withApiKey(request);

  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // Access authenticated context
  const { teamId, userId, apiKeyId } = auth.context;

  // Your API logic here
  return NextResponse.json({
    message: 'API key authentication successful!',
    teamId,
    userId,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const auth = await withApiKey(request);

  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json();

  return NextResponse.json({
    message: 'Data received',
    teamId: auth.context.teamId,
    data: body,
  });
}
