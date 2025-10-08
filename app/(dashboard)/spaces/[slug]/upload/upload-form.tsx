'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadFormProps {
  spaceSlug: string;
  spaceName: string;
}

interface FileWithMetadata {
  file: File;
  version?: string;
  md5Hash?: string;
  description?: string;
  changelog?: string;
}

export default function UploadForm({ spaceSlug, spaceName }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({});
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles: FileWithMetadata[] = selectedFiles.map(file => ({
      file,
      version: '',
      md5Hash: '',
      description: '',
      changelog: ''
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (index: number, field: keyof Omit<FileWithMetadata, 'file'>, value: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ));
  };

  const calculateMD5 = async (file: File): Promise<string | null> => {
    // MD5 calculation is not supported by crypto.subtle
    // For now, we'll skip MD5 calculation and return null
    // In production, you could use a proper MD5 library like 'crypto-js'
    console.log('MD5 calculation skipped - not supported by browser crypto API');
    return null;
  };

  const uploadFile = async (fileWithMetadata: FileWithMetadata, index: number) => {
    const { file, version, md5Hash, description, changelog } = fileWithMetadata;
    
    try {
      setUploadStatus(prev => ({ ...prev, [index]: 'uploading' }));
      
      // Calculate MD5 if not provided (optional)
      const calculatedMD5 = md5Hash || await calculateMD5(file);
      
      // Step 1: Get presigned URL
      const presignResponse = await fetch(`/api/spaces/${spaceSlug}/upload/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          fileSize: file.size
        })
      });

      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, s3Key } = await presignResponse.json();

      // Step 2: Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // Step 3: Complete upload in database
      const completeResponse = await fetch(`/api/spaces/${spaceSlug}/upload/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          s3Key,
          fileSize: file.size,
          contentType: file.type || 'application/octet-stream',
          md5Hash: calculatedMD5 || null,
          version: version || null,
          description: description || null,
          changelog: changelog || null
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      setUploadStatus(prev => ({ ...prev, [index]: 'success' }));
      setUploadProgress(prev => ({ ...prev, [index]: 100 }));
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(prev => ({ ...prev, [index]: 'error' }));
      setError(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress({});
    setUploadStatus({});

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i], i);
      }
      
      // Redirect to files page after successful upload
      setTimeout(() => {
        router.push(`/spaces/${spaceSlug}/files`);
      }, 2000);
      
    } catch (error) {
      console.error('Upload process error:', error);
      setError('Upload process failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            File Upload
          </CardTitle>
          <CardDescription>
            Select files to upload to {spaceName}. Supported formats: ZIP, APK, IMG, and other OTA-related files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Selection */}
            <div className="space-y-2">
              <Label htmlFor="files">Select Files</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>
                  <span className="text-sm text-gray-500"> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ZIP, APK, IMG, TAR, GZ, 7Z files up to 5GB each
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".zip,.apk,.img,.tar,.gz,.7z"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
                {files.map((fileWithMetadata, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      {/* File Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{fileWithMetadata.file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(fileWithMetadata.file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {uploadStatus[index] === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {uploadStatus[index] === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                          {uploadStatus[index] === 'uploading' && (
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {uploadStatus[index] === 'uploading' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[index] || 0}%` }}
                          />
                        </div>
                      )}

                      {/* File Metadata */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`version-${index}`}>Version (Optional)</Label>
                          <Input
                            id={`version-${index}`}
                            placeholder="e.g., 1.0.0"
                            value={fileWithMetadata.version || ''}
                            onChange={(e) => updateFileMetadata(index, 'version', e.target.value)}
                            disabled={isUploading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`md5-${index}`}>MD5 Hash (Optional)</Label>
                          <Input
                            id={`md5-${index}`}
                            placeholder="32-character MD5 hash"
                            value={fileWithMetadata.md5Hash || ''}
                            onChange={(e) => updateFileMetadata(index, 'md5Hash', e.target.value)}
                            disabled={isUploading}
                            pattern="[a-fA-F0-9]{32}"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${index}`}>Description (Optional)</Label>
                        <textarea
                          id={`description-${index}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Brief description of the file..."
                          value={fileWithMetadata.description || ''}
                          onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                          disabled={isUploading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`changelog-${index}`}>Changelog (Optional)</Label>
                        <textarea
                          id={`changelog-${index}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="What's new in this version..."
                          value={fileWithMetadata.changelog || ''}
                          onChange={(e) => updateFileMetadata(index, 'changelog', e.target.value)}
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild disabled={isUploading}>
                <Link href={`/spaces/${spaceSlug}`}>
                  Cancel
                </Link>
              </Button>
              <Button 
                type="submit" 
                disabled={files.length === 0 || isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Maximum file size: 5GB per file</li>
            <li>Supported formats: ZIP, APK, IMG, TAR, GZ, 7Z</li>
            <li>Files are automatically organized by space</li>
            <li>MD5 hashes are optional but recommended for verification</li>
            <li>Version numbers help track different releases</li>
            <li>Descriptions and changelogs help team members understand changes</li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
