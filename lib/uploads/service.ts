import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import sharp from 'sharp';

export interface UploadResult {
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types
const ALLOWED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/json': ['.json'],
};

export async function initUploadDirectory() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
}

export async function uploadFile(
  file: File,
  teamId: number
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Validate file type
  if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
    throw new Error('File type not allowed');
  }

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'bin';
  const filename = `${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`;
  const teamDir = join(UPLOAD_DIR, teamId.toString());

  // Ensure team directory exists
  await mkdir(teamDir, { recursive: true });

  const filePath = join(teamDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  // Process images with sharp for optimization
  if (file.type.startsWith('image/')) {
    await sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .png({ quality: 85 })
      .webp({ quality: 85 })
      .toFile(filePath);
  } else {
    await writeFile(filePath, buffer);
  }

  const url = `/uploads/${teamId}/${filename}`;

  return {
    filename,
    originalFilename: file.name,
    mimeType: file.type,
    size: file.size,
    path: filePath,
    url,
  };
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: images, PDF, text, JSON`,
    };
  }

  return { valid: true };
}
