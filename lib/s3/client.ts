import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client } from './local-config';

const s3Client = createS3Client();

const BUCKET_NAME = process.env.S3_BUCKET || 'test-bucket';

/**
 * Generate pre-signed URL for direct upload to S3
 * @param spaceSlug - The space identifier (e.g., 'blaupunkt')
 * @param filename - Original filename
 * @param contentType - MIME type of the file
 * @returns Object with uploadUrl, s3Key, and expiration
 */
export async function generatePresignedUploadUrl(
  spaceSlug: string,
  filename: string,
  contentType: string
) {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // S3 key includes space prefix
  const s3Key = `uploads/${spaceSlug}/${timestamp}-${sanitizedFilename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
    Metadata: {
      'original-filename': filename,
      'upload-timestamp': timestamp.toString(),
      'space-slug': spaceSlug,
    },
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600 // 1 hour
  });
  
  return { 
    uploadUrl, 
    s3Key, 
    expiresIn: 3600 
  };
}

/**
 * Generate pre-signed download URL for a file
 * @param s3Key - The S3 key of the file
 * @param filename - Original filename for download
 * @returns Pre-signed download URL
 */
export async function generatePresignedDownloadUrl(
  s3Key: string,
  filename: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  
  return await getSignedUrl(s3Client, command, { 
    expiresIn: 3600 // 1 hour
  });
}

/**
 * Check if file exists in S3
 * @param s3Key - The S3 key to check
 * @returns True if file exists, false otherwise
 */
export async function checkFileExists(s3Key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Get file metadata from S3
 * @param s3Key - The S3 key of the file
 * @returns File metadata including size, ETag, etc.
 */
export async function getFileMetadata(s3Key: string) {
  const response = await s3Client.send(new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  }));
  
  return {
    contentLength: response.ContentLength,
    contentType: response.ContentType,
    etag: response.ETag?.replace(/"/g, ''),
    lastModified: response.LastModified,
    metadata: response.Metadata,
  };
}

/**
 * Verify S3 key belongs to the specified space
 * @param s3Key - The S3 key to verify
 * @param spaceSlug - The space slug to check against
 * @returns True if key belongs to space, false otherwise
 */
export function verifyS3KeyBelongsToSpace(
  s3Key: string, 
  spaceSlug: string
): boolean {
  return s3Key.startsWith(`uploads/${spaceSlug}/`);
}

/**
 * Delete file from S3
 * @param s3Key - The S3 key of the file to delete
 */
export async function deleteFile(s3Key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  }));
}

/**
 * Test S3 connection
 * @returns True if connection successful, false otherwise
 */
export async function testS3Connection(): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'test-connection',
    }));
    return true;
  } catch (error: any) {
    // If bucket doesn't exist or no access, that's expected for test
    return error.name === 'NotFound' || error.name === 'NoSuchBucket';
  }
}
