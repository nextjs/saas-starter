import { db } from '../drizzle';
import { teamMembers, users, teams } from '../schema';
import { eq, and } from 'drizzle-orm';

export type SpaceMember = typeof teamMembers.$inferSelect;
export type SpaceMemberWithUser = SpaceMember & {
  user: Pick<typeof users.$inferSelect, 'id' | 'name' | 'email'>;
};

/**
 * Get all members of a space
 * @param spaceId - The space ID
 * @returns Array of members with user info
 */
export async function getSpaceMembers(spaceId: number): Promise<SpaceMemberWithUser[]> {
  const result = await db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, spaceId))
    .orderBy(teamMembers.joinedAt);

  return result;
}

/**
 * Add a member to a space
 * @param spaceId - The space ID
 * @param userId - The user ID
 * @param role - The member role
 * @returns Created space member
 */
export async function addSpaceMember(
  spaceId: number,
  userId: number,
  role: string = 'member'
): Promise<SpaceMember> {
  const [member] = await db
    .insert(teamMembers)
    .values({
      teamId: spaceId,
      userId: userId,
      role: role,
    })
    .returning();

  return member;
}

/**
 * Remove a member from a space
 * @param spaceId - The space ID
 * @param userId - The user ID
 */
export async function removeSpaceMember(
  spaceId: number,
  userId: number
): Promise<void> {
  await db
    .delete(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, spaceId),
        eq(teamMembers.userId, userId)
      )
    );
}

/**
 * Update a member's role in a space
 * @param spaceId - The space ID
 * @param userId - The user ID
 * @param role - The new role
 * @returns Updated space member
 */
export async function updateSpaceMemberRole(
  spaceId: number,
  userId: number,
  role: string
): Promise<SpaceMember> {
  const [member] = await db
    .update(teamMembers)
    .set({ role })
    .where(
      and(
        eq(teamMembers.teamId, spaceId),
        eq(teamMembers.userId, userId)
      )
    )
    .returning();

  return member;
}

/**
 * Check if user is a member of a space
 * @param spaceId - The space ID
 * @param userId - The user ID
 * @returns True if member, false otherwise
 */
export async function isSpaceMember(
  spaceId: number,
  userId: number
): Promise<boolean> {
  const result = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, spaceId),
        eq(teamMembers.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get user's role in a space
 * @param spaceId - The space ID
 * @param userId - The user ID
 * @returns User's role or null if not a member
 */
export async function getUserRoleInSpace(
  spaceId: number,
  userId: number
): Promise<string | null> {
  const result = await db
    .select({ role: teamMembers.role })
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, spaceId),
        eq(teamMembers.userId, userId)
      )
    )
    .limit(1);

  return result[0]?.role || null;
}

/**
 * Check if user has permission to perform an action
 * @param spaceId - The space ID
 * @param userId - The user ID
 * @param action - The action to check
 * @returns True if user has permission, false otherwise
 */
export async function hasSpacePermission(
  spaceId: number,
  userId: number,
  action: 'upload' | 'delete' | 'manage_members' | 'manage_space'
): Promise<boolean> {
  const role = await getUserRoleInSpace(spaceId, userId);
  
  if (!role) return false;

  switch (action) {
    case 'upload':
      return ['member', 'admin', 'owner'].includes(role);
    case 'delete':
      return ['admin', 'owner'].includes(role);
    case 'manage_members':
      return ['admin', 'owner'].includes(role);
    case 'manage_space':
      return role === 'owner';
    default:
      return false;
  }
}
