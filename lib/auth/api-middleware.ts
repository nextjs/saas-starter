import { NextRequest } from 'next/server';
import { extractApiKey, validateApiKey } from '@/lib/api-keys/service';

export interface ApiContext {
  teamId: number;
  userId: number;
  apiKeyId: number;
}

/**
 * Middleware to validate API key authentication
 */
export async function withApiKey(
  request: NextRequest
): Promise<{ success: true; context: ApiContext } | { success: false; error: string }> {
  const authHeader = request.headers.get('authorization');
  const apiKey = extractApiKey(authHeader);

  if (!apiKey) {
    return {
      success: false,
      error: 'Missing or invalid API key. Include your API key in the Authorization header.',
    };
  }

  const validated = await validateApiKey(apiKey);

  if (!validated) {
    return {
      success: false,
      error: 'Invalid or expired API key.',
    };
  }

  return {
    success: true,
    context: {
      teamId: validated.teamId,
      userId: validated.userId,
      apiKeyId: validated.apiKeyId,
    },
  };
}
