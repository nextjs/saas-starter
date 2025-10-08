/**
 * Sanitize filename for S3 storage
 * @param filename - Original filename
 * @returns Sanitized filename safe for S3
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

/**
 * Generate S3 key with space prefix and timestamp
 * @param spaceSlug - The space identifier
 * @param filename - Original filename
 * @returns S3 key in format: uploads/{spaceSlug}/{timestamp}-{filename}
 */
export function generateS3Key(spaceSlug: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = sanitizeFilename(filename);
  return `uploads/${spaceSlug}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Parse S3 key to extract components
 * @param s3Key - The S3 key to parse
 * @returns Object with spaceSlug, timestamp, and filename
 */
export function parseS3Key(s3Key: string): {
  spaceSlug: string;
  timestamp: number;
  filename: string;
} | null {
  // Expected format: uploads/{spaceSlug}/{timestamp}-{filename}
  const match = s3Key.match(/^uploads\/([^\/]+)\/(\d+)-(.+)$/);
  
  if (!match) {
    return null;
  }
  
  return {
    spaceSlug: match[1],
    timestamp: parseInt(match[2], 10),
    filename: match[3],
  };
}

/**
 * Validate S3 key format
 * @param s3Key - The S3 key to validate
 * @returns True if valid format, false otherwise
 */
export function isValidS3Key(s3Key: string): boolean {
  return parseS3Key(s3Key) !== null;
}

/**
 * Extract space slug from S3 key
 * @param s3Key - The S3 key
 * @returns Space slug or null if invalid format
 */
export function extractSpaceSlugFromS3Key(s3Key: string): string | null {
  const parsed = parseS3Key(s3Key);
  return parsed?.spaceSlug || null;
}

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns File extension (without dot) or empty string
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
}

/**
 * Check if file type is allowed for upload
 * @param filename - The filename to check
 * @returns True if allowed, false otherwise
 */
export function isAllowedFileType(filename: string): boolean {
  const allowedExtensions = ['zip', 'img', 'bin', 'tar', 'gz'];
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Validate MD5 hash format
 * @param md5Hash - The MD5 hash to validate
 * @returns True if valid format, false otherwise
 */
export function isValidMD5Hash(md5Hash: string): boolean {
  return /^[a-f0-9]{32}$/i.test(md5Hash);
}
