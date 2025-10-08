import { S3Client } from '@aws-sdk/client-s3';
import { getS3Config } from '@/lib/amplify-runtime-env';

// Local S3 configuration for testing
export const createLocalS3Client = () => {
  return new S3Client({
    region: 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true, // Required for LocalStack
  });
};

// Production S3 configuration
export const createProductionS3Client = () => {
  const s3Config = getS3Config();
  
  if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
    throw new Error('S3 credentials not found. Please set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY environment variables.');
  }
  
  return new S3Client({
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  });
};

// Choose client based on environment
export const createS3Client = () => {
  const s3Config = getS3Config();
  
  // Only use local S3 if explicitly set to 'true' AND we're in test mode
  // In production, always use real AWS S3
  if (process.env.NODE_ENV === 'test' && s3Config.useLocalS3) {
    return createLocalS3Client();
  }
  return createProductionS3Client();
};
