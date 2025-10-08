import { db } from '../drizzle';
import { uploads, users, teams } from '../schema';
import { eq, and, desc, ilike, sql, count } from 'drizzle-orm';

export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
export type UploadWithUser = Upload & {
  uploadedByUser: Pick<typeof users.$inferSelect, 'id' | 'name' | 'email'>;
};

export type UploadListResult = {
  uploads: UploadWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Create a new upload record
 * @param data - Upload data
 * @returns Created upload
 */
export async function createUpload(data: NewUpload): Promise<Upload> {
  const [upload] = await db
    .insert(uploads)
    .values(data)
    .returning();

  return upload;
}

/**
 * Get uploads for a specific space with pagination and search
 * @param spaceId - The space ID
 * @param params - Query parameters
 * @returns Paginated uploads with metadata
 */
export async function getSpaceUploads(
  spaceId: number,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'uploadedAt' | 'filename' | 'fileSize';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<UploadListResult> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;
  const sortBy = params.sortBy || 'uploadedAt';
  const sortOrder = params.sortOrder || 'desc';

  // Build search conditions
  const searchConditions = params.search
    ? [
        ilike(uploads.filename, `%${params.search}%`),
        ilike(uploads.description, `%${params.search}%`),
        ilike(uploads.version, `%${params.search}%`),
      ]
    : [];

  // Get uploads with user info
  const uploadsQuery = db
    .select({
      id: uploads.id,
      teamId: uploads.teamId,
      filename: uploads.filename,
      s3Key: uploads.s3Key,
      fileSize: uploads.fileSize,
      contentType: uploads.contentType,
      md5Hash: uploads.md5Hash,
      description: uploads.description,
      changelog: uploads.changelog,
      version: uploads.version,
      uploadedBy: uploads.uploadedBy,
      uploadedAt: uploads.uploadedAt,
      createdAt: uploads.createdAt,
      updatedAt: uploads.updatedAt,
      uploadedByUser: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(uploads)
    .innerJoin(users, eq(uploads.uploadedBy, users.id))
    .where(
      and(
        eq(uploads.teamId, spaceId),
        ...searchConditions
      )
    )
    .orderBy(
      sortOrder === 'asc' 
        ? uploads[sortBy] 
        : desc(uploads[sortBy])
    )
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  const totalQuery = db
    .select({ count: count() })
    .from(uploads)
    .where(
      and(
        eq(uploads.teamId, spaceId),
        ...searchConditions
      )
    );

  const [uploadsResult, totalResult] = await Promise.all([
    uploadsQuery,
    totalQuery,
  ]);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    uploads: uploadsResult,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get upload by ID
 * @param id - Upload ID
 * @returns Upload with user info or null
 */
export async function getUploadById(id: number): Promise<UploadWithUser | null> {
  const result = await db
    .select({
      id: uploads.id,
      teamId: uploads.teamId,
      filename: uploads.filename,
      s3Key: uploads.s3Key,
      fileSize: uploads.fileSize,
      contentType: uploads.contentType,
      md5Hash: uploads.md5Hash,
      description: uploads.description,
      changelog: uploads.changelog,
      version: uploads.version,
      uploadedBy: uploads.uploadedBy,
      uploadedAt: uploads.uploadedAt,
      createdAt: uploads.createdAt,
      updatedAt: uploads.updatedAt,
      uploadedByUser: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(uploads)
    .innerJoin(users, eq(uploads.uploadedBy, users.id))
    .where(eq(uploads.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Get upload by S3 key
 * @param s3Key - The S3 key
 * @returns Upload or null if not found
 */
export async function getUploadByS3Key(s3Key: string): Promise<Upload | null> {
  const result = await db
    .select()
    .from(uploads)
    .where(eq(uploads.s3Key, s3Key))
    .limit(1);

  return result[0] || null;
}

/**
 * Delete upload record
 * @param id - Upload ID
 */
export async function deleteUpload(id: number): Promise<void> {
  await db
    .delete(uploads)
    .where(eq(uploads.id, id));
}

/**
 * Search uploads in a space
 * @param spaceId - The space ID
 * @param query - Search query
 * @returns Array of matching uploads
 */
export async function searchUploads(
  spaceId: number, 
  query: string
): Promise<UploadWithUser[]> {
  const result = await db
    .select({
      id: uploads.id,
      teamId: uploads.teamId,
      filename: uploads.filename,
      s3Key: uploads.s3Key,
      fileSize: uploads.fileSize,
      contentType: uploads.contentType,
      md5Hash: uploads.md5Hash,
      description: uploads.description,
      changelog: uploads.changelog,
      version: uploads.version,
      uploadedBy: uploads.uploadedBy,
      uploadedAt: uploads.uploadedAt,
      createdAt: uploads.createdAt,
      updatedAt: uploads.updatedAt,
      uploadedByUser: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(uploads)
    .innerJoin(users, eq(uploads.uploadedBy, users.id))
    .where(
      and(
        eq(uploads.teamId, spaceId),
        sql`(
          ${uploads.filename} ILIKE ${`%${query}%`} OR
          ${uploads.description} ILIKE ${`%${query}%`} OR
          ${uploads.version} ILIKE ${`%${query}%`}
        )`
      )
    )
    .orderBy(desc(uploads.uploadedAt))
    .limit(50);

  return result;
}

/**
 * Get recent uploads for a space
 * @param spaceId - The space ID
 * @param limit - Number of recent uploads to return
 * @returns Array of recent uploads
 */
export async function getRecentUploads(
  spaceId: number,
  limit: number = 5
): Promise<UploadWithUser[]> {
  const result = await db
    .select({
      id: uploads.id,
      teamId: uploads.teamId,
      filename: uploads.filename,
      s3Key: uploads.s3Key,
      fileSize: uploads.fileSize,
      contentType: uploads.contentType,
      md5Hash: uploads.md5Hash,
      description: uploads.description,
      changelog: uploads.changelog,
      version: uploads.version,
      uploadedBy: uploads.uploadedBy,
      uploadedAt: uploads.uploadedAt,
      createdAt: uploads.createdAt,
      updatedAt: uploads.updatedAt,
      uploadedByUser: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(uploads)
    .innerJoin(users, eq(uploads.uploadedBy, users.id))
    .where(eq(uploads.teamId, spaceId))
    .orderBy(desc(uploads.uploadedAt))
    .limit(limit);

  return result;
}
