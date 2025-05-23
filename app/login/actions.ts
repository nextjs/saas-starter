'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations,
  passwordResetTokens,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { setSession, clearSession } from '@/lib/auth/session-server';
import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';
// @ts-ignore: missing type declarations for nodemailer
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { cookies } from 'next/headers';

// Helper function to convert numeric or string IDs to a valid UUID format
function ensureUuid(id: string | number | null | undefined): string | null {
  if (id === null || id === undefined) {
    return null;
  }
  
  // Convert to string if it's a number
  const idStr = typeof id === 'number' ? id.toString() : id;
  
  // Check if the ID is already a valid UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(idStr)) {
    return idStr;
  }

  // If it's a simple number/string, convert it to a valid UUID format
  return `00000000-0000-0000-0000-${idStr.padStart(12, '0')}`;
}

async function logActivity(
  teamId: string | number | null | undefined,
  userId: string | number,
  type: ActivityType,
  ipAddress?: string,
  metadata?: Record<string, any>
) {
  // Convert teamId to valid UUID format if provided
  const validTeamId = ensureUuid(teamId);
  if (!validTeamId) {
    return;
  }
  
  // Convert userId to valid UUID format
  const validUserId = ensureUuid(userId);
  
  const newActivity: NewActivityLog = {
    teamId: validTeamId,
    userId: validUserId,
    action: type,
    ipAddress: ipAddress || '',
  };

  // Add metadata if provided
  if (metadata) {
    newActivity.metadata = JSON.stringify(metadata);
  }
  
  // Log to database
  await db.insert(activityLogs).values(newActivity);
  
  // Also track in PostHog when available
  try {
    if (typeof window !== 'undefined' && 'posthog' in window) {
      // @ts-ignore: PostHog might not be initialized on server
      window.posthog.capture(type, {
        teamId: validTeamId,
        userId: validUserId,
        timestamp: new Date().toISOString(),
        ...(metadata || {})
      });
    }
  } catch (err) {
    console.error('Error sending PostHog event:', err);
  }
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash,
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  // Reset cookies to ensure fresh state after login
  const cookieStore = (await cookies()) as any;
  // @ts-ignore: delete exists at runtime on cookieStore
  cookieStore.delete('openPartId');
  // @ts-ignore: delete exists at runtime on cookieStore
  cookieStore.delete('lastViewedLessonId');

  redirect('/app');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1, 'Name is required').max(50),
  inviteId: z.string().optional(),
  'terms-accept': z.string().optional().refine(val => val === 'on', {
    message: "You must accept the Terms and Conditions, Privacy Policy, and Earnings Disclaimer"
  }),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name, inviteId } = data;
  
  // Check if terms were accepted
  if (!data['terms-accept']) {
    return {
      error: "You must accept the Terms and Conditions, Privacy Policy, and Earnings Disclaimer",
      email,
      password,
      name,
    };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
      name,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    name,
    passwordHash,
    role: 'owner', // Default role, will be overridden if there's an invitation
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
      name,
    };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password, name };
    }
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`,
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password,
        name,
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole,
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  redirect('/app');
});

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  await clearSession();
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'New password must be different from the current password.',
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD),
    ]);

    return { success: 'Password updated successfully.' };
  },
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT,
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId),
          ),
        );
    }

    await clearSession();
    redirect('/login/sign-in');
  },
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT),
    ]);

    return { success: 'Account updated successfully.' };
  },
);

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId),
        ),
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER,
    );

    return { success: 'Team member removed successfully' };
  },
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner']),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(
          eq(users.email, email),
          eq(teamMembers.teamId, userWithTeam.teamId),
        ),
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending',
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER,
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  },
);

// Schema and action for requesting password reset
const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});
export const requestPasswordReset = validatedAction(requestPasswordResetSchema, async (data) => {
  const { email } = data;
  // Find user by email
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // Always respond success to avoid email enumeration
  if (!user) {
    return { success: true };
  }
  // Generate token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  // Store in database
  await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });
  // Send email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login/reset-password/${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in one hour.</p>`,
  });
  return { success: true };
});

// Schema and action for resetting password
const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
export const resetPassword = validatedAction(resetPasswordSchema, async (data) => {
  const { token, password } = data;
   
  // Input validation
  if (!token || typeof token !== 'string' || token.length < 10) {
    console.error('Invalid token format provided:', token);
    return { error: 'This password reset link is invalid or has expired. You can request a new password reset link.' };
  }
 
  // Find valid token
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        sql`${passwordResetTokens.expiresAt} > NOW()`
      )
    )
    .limit(1);
     
  console.log('Token lookup result:', row ? 'Found' : 'Not found', 'for token:', token);
   
  if (!row) {
    return { error: 'This password reset link is invalid or has expired. You can request a new password reset link.' };
  }
  
  // Double check token validity
  if (row.used) {
    console.error('Used token accessed:', token);
    return { error: 'This password reset token has already been used. You can request a new password reset link.' };
  }
  
  const now = new Date();
  if (row.expiresAt < now) {
    console.error('Expired token accessed:', token, 'expired at:', row.expiresAt, 'current time:', now);
    return { error: 'The password reset link has expired. You can request a new password reset link.' };
  }

  try {
    // Update user password
    const passwordHash = await hashPassword(password);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, row.userId));
    
    // Mark token used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, row.id));
       
    console.log('Password reset successful for user ID:', row.userId, 'with token:', token);
    
    // Log activity
    await logActivity(null, row.userId, ActivityType.UPDATE_PASSWORD);
    
  } catch (error) {
    console.error('Error updating password:', error);
    return { error: 'An error occurred while changing your password. Please try again.' };
  }
  
  // Redirect to sign-in page (outside of try/catch)
  redirect('/login/sign-in?resetSuccess=true');
});
