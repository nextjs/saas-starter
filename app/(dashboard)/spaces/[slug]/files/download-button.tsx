'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  fileId: number;
  filename: string;
  spaceSlug: string;
}

export default function DownloadButton({ fileId, filename, spaceSlug }: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceSlug}/files/${fileId}/download`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }
      const { downloadUrl } = await response.json();
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleDownload}
    >
      <Download className="w-4 h-4 mr-1" />
      Download
    </Button>
  );
}
