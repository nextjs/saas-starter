'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { apiKeys, ActivityType } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getUserWithTeam } from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { generateApiKey } from './service';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const { activityLogs } = await import('@/lib/db/schema');
  await db.insert(activityLogs).values({
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || '',
  });
}

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresInDays: z.number().min(0).max(365).optional(),
});

export const createApiKey = validatedActionWithUser(
  createApiKeySchema,
  async (data, _, user) => {
    const { name, expiresInDays } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const { key, prefix, hash } = generateApiKey();

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    await db.insert(apiKeys).values({
      teamId: userWithTeam.teamId,
      userId: user.id,
      name,
      keyHash: hash,
      keyPrefix: prefix,
      expiresAt,
    });

    await logActivity(userWithTeam.teamId, user.id, ActivityType.CREATE_API_KEY);

    // Return the full key only once (it won't be shown again)
    return { success: true, key, prefix };
  }
);

export const getApiKeys = validatedActionWithUser(
  z.object({}),
  async (_, __, user) => {
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .where(
        and(eq(apiKeys.teamId, userWithTeam.teamId), isNull(apiKeys.revokedAt))
      )
      .orderBy(apiKeys.createdAt);

    return { success: true, keys };
  }
);

const revokeApiKeySchema = z.object({
  keyId: z.number(),
});

export const revokeApiKey = validatedActionWithUser(
  revokeApiKeySchema,
  async (data, _, user) => {
    const { keyId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(apiKeys.id, keyId),
          eq(apiKeys.teamId, userWithTeam.teamId),
          isNull(apiKeys.revokedAt)
        )
      );

    await logActivity(userWithTeam.teamId, user.id, ActivityType.REVOKE_API_KEY);

    return { success: true };
  }
);
