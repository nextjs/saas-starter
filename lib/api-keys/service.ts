import { randomBytes, createHash } from 'crypto';
import { db } from '@/lib/db/drizzle';
import { apiKeys } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export interface ApiKeyData {
  key: string;
  prefix: string;
  hash: string;
}

/**
 * Generate a new API key with format: sk_{prefix}_{secret}
 */
export function generateApiKey(): ApiKeyData {
  const prefix = randomBytes(4).toString('hex');
  const secret = randomBytes(24).toString('hex');
  const key = `sk_${prefix}_${secret}`;
  const hash = hashApiKey(key);

  return { key, prefix, hash };
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Validate an API key and return the associated team and user
 */
export async function validateApiKey(key: string) {
  if (!key || !key.startsWith('sk_')) {
    return null;
  }

  const hash = hashApiKey(key);

  const result = await db
    .select({
      id: apiKeys.id,
      teamId: apiKeys.teamId,
      userId: apiKeys.userId,
      name: apiKeys.name,
      expiresAt: apiKeys.expiresAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const apiKey = result[0];

  // Check if key is expired
  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    return null;
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id));

  return {
    teamId: apiKey.teamId,
    userId: apiKey.userId,
    apiKeyId: apiKey.id,
  };
}

/**
 * Extract API key from Authorization header
 */
export function extractApiKey(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer sk_..." and "sk_..." formats
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  if (authHeader.startsWith('sk_')) {
    return authHeader;
  }

  return null;
}
