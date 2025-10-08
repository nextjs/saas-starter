import { db } from '../drizzle';
import { teams, teamMembers, uploads, users } from '../schema';
import { eq, and, sql } from 'drizzle-orm';

export type Space = typeof teams.$inferSelect;
export type SpaceWithStats = Space & {
  memberCount: number;
  fileCount: number;
  totalSize: number;
  userRole: string;
};

/**
 * Get all spaces accessible by a user
 * @param userId - The user ID
 * @returns Array of spaces with stats and user role
 */
export async function getUserSpaces(userId: number): Promise<SpaceWithStats[]> {
  const result = await db
    .select({
      id: teams.id,
      name: teams.name,
      slug: teams.slug,
      description: teams.description,
      s3Prefix: teams.s3Prefix,
      isActive: teams.isActive,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
      userRole: teamMembers.role,
      memberCount: sql<number>`count(distinct ${teamMembers.userId})`,
      fileCount: sql<number>`count(distinct ${uploads.id})`,
      totalSize: sql<number>`coalesce(sum(${uploads.fileSize}), 0)`,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .leftJoin(uploads, eq(teams.id, uploads.teamId))
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teams.isActive, true)
      )
    )
    .groupBy(teams.id, teamMembers.role)
    .orderBy(teams.name);

  return result;
}

/**
 * Get space by slug
 * @param slug - The space slug
 * @returns Space or null if not found
 */
export async function getSpaceBySlug(slug: string): Promise<Space | null> {
  const result = await db
    .select()
    .from(teams)
    .where(
      and(
        eq(teams.slug, slug),
        eq(teams.isActive, true)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get space by ID
 * @param id - The space ID
 * @returns Space or null if not found
 */
export async function getSpaceById(id: number): Promise<Space | null> {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Check if user has access to a space
 * @param userId - The user ID
 * @param spaceSlug - The space slug
 * @returns True if user has access, false otherwise
 */
export async function userHasSpaceAccess(
  userId: number, 
  spaceSlug: string
): Promise<boolean> {
  const result = await db
    .select({ id: teams.id })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teams.slug, spaceSlug),
        eq(teams.isActive, true)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get user's role in a space
 * @param userId - The user ID
 * @param spaceSlug - The space slug
 * @returns User's role or null if not a member
 */
export async function getUserSpaceRole(
  userId: number, 
  spaceSlug: string
): Promise<string | null> {
  const result = await db
    .select({ role: teamMembers.role })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teams.slug, spaceSlug)
      )
    )
    .limit(1);

  return result[0]?.role || null;
}

/**
 * Get space statistics
 * @param spaceId - The space ID
 * @returns Object with file count, total size, and member count
 */
export async function getSpaceStats(spaceId: number): Promise<{
  totalFiles: number;
  totalSize: number;
  memberCount: number;
}> {
  const [fileStats] = await db
    .select({
      totalFiles: sql<number>`count(${uploads.id})`,
      totalSize: sql<number>`coalesce(sum(${uploads.fileSize}), 0)`,
    })
    .from(uploads)
    .where(eq(uploads.teamId, spaceId));

  const [memberStats] = await db
    .select({
      memberCount: sql<number>`count(${teamMembers.id})`,
    })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, spaceId));

  return {
    totalFiles: fileStats?.totalFiles || 0,
    totalSize: fileStats?.totalSize || 0,
    memberCount: memberStats?.memberCount || 0,
  };
}

/**
 * Create a new space
 * @param data - Space data
 * @returns Created space
 */
export async function createSpace(data: {
  name: string;
  slug: string;
  description?: string;
  s3Prefix: string;
}): Promise<Space> {
  const [space] = await db
    .insert(teams)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      s3Prefix: data.s3Prefix,
      isActive: true,
    })
    .returning();

  return space;
}

/**
 * Update space
 * @param id - Space ID
 * @param data - Updated space data
 * @returns Updated space
 */
export async function updateSpace(
  id: number, 
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    s3Prefix: string;
    isActive: boolean;
  }>
): Promise<Space> {
  const [space] = await db
    .update(teams)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, id))
    .returning();

  return space;
}
