'use client';

import { useRef } from 'react';
import { createUploadClient } from 'pushduck/client';
import type { AppRouter } from '@/app/api/upload/route';
import { Button } from '@/components/ui/button';

const upload = createUploadClient<AppRouter>({ endpoint: '/api/upload' });

interface FileUploadProps {
  route: 'profileImage' | 'document';
  onSuccess?: (url: string) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({
  route,
  onSuccess,
  accept,
  label = 'Upload file',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, files, isUploading } = upload[route]();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const results = await uploadFiles(selected);
    const first = results?.[0];
    if (first?.url && onSuccess) {
      onSuccess(first.url);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? 'Uploading…' : label}
      </Button>

      {files.length > 0 && (
        <ul className="text-sm text-muted-foreground space-y-1">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between">
              <span className="truncate max-w-[240px]">{file.name}</span>
              <span className="ml-2 shrink-0">
                {file.status === 'success' ? (
                  <span className="text-green-600">Done</span>
                ) : file.status === 'error' ? (
                  <span className="text-destructive">Failed</span>
                ) : (
                  <span>{file.progress ?? 0}%</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
