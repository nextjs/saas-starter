'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export function DownloadTravelerPdfButton({
  jobId,
  jobNumber,
}: {
  jobId: number;
  jobNumber: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}/traveler-pdf`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${jobNumber}-traveler.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert('Could not download the traveler PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Download Traveler PDF
    </Button>
  );
}
