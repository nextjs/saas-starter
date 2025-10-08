import { z } from 'zod';

/**
 * Schema for upload presign request
 */
export const uploadPresignSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._\-\s]+$/, 'Filename contains invalid characters'),
  contentType: z.string()
    .min(1, 'Content type is required')
    .refine((type) => {
      const allowedTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/octet-stream',
        'application/x-gzip',
        'application/x-tar',
        'application/gzip',
        'application/x-7z-compressed',
        'application/vnd.android.package-archive',
        'application/x-iso9660-image',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      return allowedTypes.includes(type) || type.startsWith('application/');
    }, 'Unsupported file type'),
  fileSize: z.number()
    .min(1, 'File size must be greater than 0')
    .max(5 * 1024 * 1024 * 1024, 'File size exceeds 5GB limit'),
});

/**
 * Schema for upload complete request
 */
export const uploadCompleteSchema = z.object({
  s3Key: z.string()
    .min(1, 'S3 key is required')
    .max(512, 'S3 key too long'),
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long'),
  fileSize: z.number()
    .min(1, 'File size must be greater than 0'),
  contentType: z.string()
    .min(1, 'Content type is required'),
  md5Hash: z.string()
    .length(32, 'MD5 hash must be 32 characters')
    .regex(/^[a-f0-9]+$/, 'Invalid MD5 hash format')
    .nullable()
    .optional(),
  description: z.string()
    .max(1000, 'Description too long')
    .nullable()
    .optional(),
  changelog: z.string()
    .max(5000, 'Changelog too long')
    .nullable()
    .optional(),
  version: z.string()
    .max(50, 'Version too long')
    .nullable()
    .optional(),
});

/**
 * Schema for file list query parameters
 */
export const fileListQuerySchema = z.object({
  page: z.coerce.number()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  search: z.string()
    .max(100, 'Search query too long')
    .optional(),
  sortBy: z.enum(['uploadedAt', 'filename', 'fileSize'])
    .default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc'),
});

/**
 * Schema for space creation
 */
export const createSpaceSchema = z.object({
  name: z.string()
    .min(1, 'Space name is required')
    .max(100, 'Space name too long'),
  slug: z.string()
    .min(1, 'Space slug is required')
    .max(50, 'Space slug too long')
    .regex(/^[a-z0-9-]+$/, 'Space slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  s3Prefix: z.string()
    .min(1, 'S3 prefix is required')
    .max(100, 'S3 prefix too long')
    .regex(/^uploads\/[a-z0-9-]+$/, 'S3 prefix must start with "uploads/" followed by valid slug'),
});

/**
 * Schema for space update
 */
export const updateSpaceSchema = z.object({
  name: z.string()
    .min(1, 'Space name is required')
    .max(100, 'Space name too long')
    .optional(),
  slug: z.string()
    .min(1, 'Space slug is required')
    .max(50, 'Space slug too long')
    .regex(/^[a-z0-9-]+$/, 'Space slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  s3Prefix: z.string()
    .min(1, 'S3 prefix is required')
    .max(100, 'S3 prefix too long')
    .regex(/^uploads\/[a-z0-9-]+$/, 'S3 prefix must start with "uploads/" followed by valid slug')
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for adding space member
 */
export const addSpaceMemberSchema = z.object({
  userId: z.number()
    .int('User ID must be an integer')
    .positive('User ID must be positive'),
  role: z.enum(['member', 'admin', 'owner'])
    .default('member'),
});

/**
 * Schema for updating space member role
 */
export const updateSpaceMemberRoleSchema = z.object({
  role: z.enum(['member', 'admin', 'owner']),
});

/**
 * Helper function to validate file type
 */
export function validateFileType(filename: string): boolean {
  const allowedExtensions = ['zip', 'img', 'bin', 'tar', 'gz'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Helper function to validate MD5 hash
 */
export function validateMD5Hash(hash: string): boolean {
  return /^[a-f0-9]{32}$/i.test(hash);
}

/**
 * Helper function to validate S3 key format
 */
export function validateS3Key(s3Key: string): boolean {
  return /^uploads\/[a-z0-9-]+\/\d+-[a-zA-Z0-9._-]+$/.test(s3Key);
}
