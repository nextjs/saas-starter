'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, activityLogs, ActivityType } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { exchangeCodeForToken, getMicrosoftUser, validateDomain } from '@/lib/auth/microsoft';
import { redirect } from 'next/navigation';
import { validatedAction } from '@/lib/auth/middleware';

const microsoftAuthSchema = z.object({
  code: z.string().min(1),
  state: z.string().optional(),
});

export const microsoftAuth = validatedAction(microsoftAuthSchema, async (data) => {
  const { code } = data;

  try {
    // Exchange authorization code for access token
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/microsoft/callback`;
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);

    // Get user information from Microsoft Graph
    const microsoftUser = await getMicrosoftUser(tokenResponse.access_token);

    // Validate domain restriction
    if (!validateDomain(microsoftUser.mail)) {
      return {
        error: 'Access denied. Only users with @sunlighten.com email addresses are allowed.',
      };
    }

    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, microsoftUser.mail))
      .limit(1);

    if (existingUser.length === 0) {
      return {
        error: 'User not found. Please contact your administrator to add your account.',
      };
    }

    const user = existingUser[0];

    // Update user with Microsoft information if not already set
    if (!user.externalId || user.authProvider !== 'microsoft') {
      await db
        .update(users)
        .set({
          externalId: microsoftUser.id,
          authProvider: 'microsoft',
          name: microsoftUser.displayName || user.name,
        })
        .where(eq(users.id, user.id));
    }

    // Get user's team information
    const userWithTeam = await db
      .select({
        user: users,
        team: teams
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(users.id, user.id))
      .limit(1);

    const { team: foundTeam } = userWithTeam[0] || {};

    // Log the sign-in activity
    if (foundTeam) {
      await db.insert(activityLogs).values({
        teamId: foundTeam.id,
        userId: user.id,
        action: ActivityType.SIGN_IN,
        ipAddress: '', // Could be extracted from request headers if needed
      });
    }

    // Set session
    await setSession(user);

    // Redirect to dashboard
    redirect('/dashboard');
  } catch (error) {
    console.error('Microsoft authentication error:', error);
    return {
      error: 'Authentication failed. Please try again.',
    };
  }
});

/**
 * Generate Microsoft OAuth2 authorization URL
 */
export async function getMicrosoftAuthUrl(): Promise<string> {
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/microsoft/callback`;
  
  const { getMicrosoftAuthUrl: getAuthUrl } = await import('@/lib/auth/microsoft');
  return await getAuthUrl(redirectUri);
}
