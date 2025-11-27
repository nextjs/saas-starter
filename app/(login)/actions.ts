'use server';

import { z } from 'zod';
import { connectToDatabase, mongoose } from '@/lib/db/mongodb';
import {
  User,
  Team,
  ActivityLog,
  Invitation,
  ActivityType,
  type IUser,
  type ITeam,
} from '@/lib/db/models';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';
import { Types } from 'mongoose';

async function logActivity(
  teamId: string | null | undefined,
  userId: string | Types.ObjectId,
  type: ActivityType,
  ipAddress?: string
) {
  if (!teamId) {
    return;
  }

  await connectToDatabase();

  // Get user name for denormalization
  const user = await User.findById(userId).select('name').lean();

  await ActivityLog.create({
    teamId: new Types.ObjectId(teamId),
    userId: new Types.ObjectId(userId),
    userName: user?.name,
    action: type,
    ipAddress: ipAddress || '',
    timestamp: new Date(),
  });
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  await connectToDatabase();

  // Find user by email
  const foundUser = await User.findOne({
    email: email.toLowerCase(),
  }).lean();

  if (!foundUser) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  // Get user's team
  const teamMembership = foundUser.teamMemberships?.[0];
  let foundTeam: ITeam | null = null;

  if (teamMembership) {
    foundTeam = await Team.findById(teamMembership.teamId).lean();
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(
      foundTeam?._id.toString(),
      foundUser._id,
      ActivityType.SIGN_IN
    ),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  await connectToDatabase();

  // Check if user already exists
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  }).lean();

  if (existingUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  let teamId: Types.ObjectId;
  let userRole: string;
  let createdTeam: ITeam | null = null;

  // Use MongoDB transaction for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (inviteId) {
      // Check if there's a valid invitation
      const invitation = await Invitation.findOne({
        _id: new Types.ObjectId(inviteId),
        email: email.toLowerCase(),
        status: 'pending',
      }).session(session);

      if (invitation) {
        teamId = invitation.teamId;
        userRole = invitation.role;

        // Update invitation status
        await Invitation.updateOne(
          { _id: invitation._id },
          { $set: { status: 'accepted' } }
        ).session(session);

        // Get the team
        createdTeam = await Team.findById(teamId).session(session);

        if (!createdTeam) {
          await session.abortTransaction();
          return { error: 'Team not found.', email, password };
        }
      } else {
        await session.abortTransaction();
        return { error: 'Invalid or expired invitation.', email, password };
      }
    } else {
      // Create a new team if there's no invitation
      const newTeamData = {
        name: `${email}'s Team`,
        members: [],
      };

      const [newTeam] = await Team.create([newTeamData], { session });

      if (!newTeam) {
        await session.abortTransaction();
        return {
          error: 'Failed to create team. Please try again.',
          email,
          password,
        };
      }

      createdTeam = newTeam;
      teamId = newTeam._id;
      userRole = 'owner';
    }

    // Create user with team membership
    const [createdUser] = await User.create(
      [
        {
          email: email.toLowerCase(),
          passwordHash,
          role: userRole === 'owner' ? 'owner' : 'member',
          teamMemberships: [
            {
              teamId,
              role: userRole,
              joinedAt: new Date(),
            },
          ],
        },
      ],
      { session }
    );

    if (!createdUser) {
      await session.abortTransaction();
      return {
        error: 'Failed to create user. Please try again.',
        email,
        password,
      };
    }

    // Update team with new member (denormalized)
    await Team.updateOne(
      { _id: teamId },
      {
        $push: {
          members: {
            userId: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: userRole,
            joinedAt: new Date(),
          },
        },
      }
    ).session(session);

    // Log activities
    if (!inviteId) {
      await ActivityLog.create(
        [
          {
            teamId,
            userId: createdUser._id,
            userName: createdUser.name,
            action: ActivityType.CREATE_TEAM,
            timestamp: new Date(),
          },
        ],
        { session }
      );
    } else {
      await ActivityLog.create(
        [
          {
            teamId,
            userId: createdUser._id,
            userName: createdUser.name,
            action: ActivityType.ACCEPT_INVITATION,
            timestamp: new Date(),
          },
        ],
        { session }
      );
    }

    await ActivityLog.create(
      [
        {
          teamId,
          userId: createdUser._id,
          userName: createdUser.name,
          action: ActivityType.SIGN_UP,
          timestamp: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Set session after transaction completes
    await setSession(createdUser);

    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
      const priceId = formData.get('priceId') as string;
      return createCheckoutSession({ team: createdTeam, priceId });
    }

    redirect('/dashboard');
  } catch (error) {
    await session.abortTransaction();
    console.error('Sign up error:', error);
    return {
      error: 'Failed to create account. Please try again.',
      email,
      password,
    };
  } finally {
    session.endSession();
  }
});

export async function signOut() {
  const user = await getUser();
  if (!user) return;

  const userWithTeam = await getUserWithTeam(user._id.toString());
  await logActivity(userWithTeam?.teamId, user._id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.',
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.',
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.',
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user._id.toString());

    await connectToDatabase();

    await Promise.all([
      User.updateOne(
        { _id: user._id },
        { $set: { passwordHash: newPasswordHash } }
      ),
      logActivity(
        userWithTeam?.teamId,
        user._id,
        ActivityType.UPDATE_PASSWORD
      ),
    ]);

    return {
      success: 'Password updated successfully.',
    };
  }
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
      return {
        password,
        error: 'Incorrect password. Account deletion failed.',
      };
    }

    const userWithTeam = await getUserWithTeam(user._id.toString());

    await logActivity(
      userWithTeam?.teamId,
      user._id,
      ActivityType.DELETE_ACCOUNT
    );

    await connectToDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Soft delete user
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            deletedAt: new Date(),
            email: `${user.email}-${user._id}-deleted`, // Ensure email uniqueness
          },
        }
      ).session(session);

      // Remove user from team members (denormalized)
      if (userWithTeam?.teamId) {
        await Team.updateOne(
          { _id: new Types.ObjectId(userWithTeam.teamId) },
          {
            $pull: {
              members: { userId: user._id },
            },
          }
        ).session(session);

        // Remove team membership from user
        await User.updateOne(
          { _id: user._id },
          {
            $pull: {
              teamMemberships: { teamId: new Types.ObjectId(userWithTeam.teamId) },
            },
          }
        ).session(session);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Delete account error:', error);
      return {
        password,
        error: 'Failed to delete account. Please try again.',
      };
    } finally {
      session.endSession();
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user._id.toString());

    await connectToDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update user
      await User.updateOne(
        { _id: user._id },
        { $set: { name, email: email.toLowerCase() } }
      ).session(session);

      // Update denormalized member info in team
      if (userWithTeam?.teamId) {
        await Team.updateOne(
          {
            _id: new Types.ObjectId(userWithTeam.teamId),
            'members.userId': user._id,
          },
          {
            $set: {
              'members.$.name': name,
              'members.$.email': email.toLowerCase(),
            },
          }
        ).session(session);
      }

      await session.commitTransaction();

      await logActivity(
        userWithTeam?.teamId,
        user._id,
        ActivityType.UPDATE_ACCOUNT
      );

      return { name, success: 'Account updated successfully.' };
    } catch (error) {
      await session.abortTransaction();
      console.error('Update account error:', error);
      return { error: 'Failed to update account. Please try again.' };
    } finally {
      session.endSession();
    }
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.string(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user._id.toString());

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await connectToDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Remove member from team
      await Team.updateOne(
        { _id: new Types.ObjectId(userWithTeam.teamId) },
        {
          $pull: {
            members: { userId: new Types.ObjectId(memberId) },
          },
        }
      ).session(session);

      // Remove team membership from user
      await User.updateOne(
        { _id: new Types.ObjectId(memberId) },
        {
          $pull: {
            teamMemberships: { teamId: new Types.ObjectId(userWithTeam.teamId) },
          },
        }
      ).session(session);

      await session.commitTransaction();

      await logActivity(
        userWithTeam.teamId,
        user._id,
        ActivityType.REMOVE_TEAM_MEMBER
      );

      return { success: 'Team member removed successfully' };
    } catch (error) {
      await session.abortTransaction();
      console.error('Remove team member error:', error);
      return { error: 'Failed to remove team member. Please try again.' };
    } finally {
      session.endSession();
    }
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner']),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user._id.toString());

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await connectToDatabase();

    // Check if user is already a member
    const team = await Team.findById(userWithTeam.teamId).lean();
    const existingMember = team?.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );

    if (existingMember) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      teamId: new Types.ObjectId(userWithTeam.teamId),
      status: 'pending',
    }).lean();

    if (existingInvitation) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await Invitation.create({
      teamId: new Types.ObjectId(userWithTeam.teamId),
      teamName: team?.name,
      email: email.toLowerCase(),
      role,
      invitedBy: user._id,
      invitedByName: user.name,
      status: 'pending',
      invitedAt: new Date(),
    });

    await logActivity(
      userWithTeam.teamId,
      user._id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);
