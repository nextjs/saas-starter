import React from 'react';
import { SharePdfAcceptanceGate } from '@/app/components/SharePdfAcceptanceGate';
import { useSharePdfGate } from '@/app/lib/hooks/use-share-pdf-gate';

/**
 * Example Usage of SharePdfAcceptanceGate Component
 *
 * This demonstrates how to integrate the PDF sharing acceptance gate
 * into your report components.
 */

interface ReportData {
  id: string;
  name: string;
  url: string;
}

export function ReportViewer({ report }: { report: ReportData }) {
  const { isOpen, reportName, openShareDialog, closeShareDialog, handleShare } =
    useSharePdfGate();

  // Handle the actual PDF sharing logic
  const handleSharePdf = async () => {
    // Example 1: Download PDF to local machine
    const link = document.createElement('a');
    link.href = report.url;
    link.download = `${report.name}.pdf`;
    link.click();

    // Example 2: Send via email (requires API endpoint)
    // await fetch('/api/reports/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     reportId: report.id,
    //     recipientEmail: 'user@example.com',
    //   }),
    // });

    // Example 3: Generate shareable link
    // const response = await fetch('/api/reports/share-link', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ reportId: report.id }),
    // });
    // const { shareLink } = await response.json();
    // navigator.clipboard.writeText(shareLink);
  };

  return (
    <div className="space-y-4">
      {/* Report Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">{report.name}</h2>
        {/* Embed PDF viewer or content here */}
        <div className="bg-gray-100 h-96 flex items-center justify-center rounded">
          <p className="text-gray-500">PDF Content Preview</p>
        </div>
      </div>

      {/* Share Button */}
      <div className="flex gap-2">
        <button
          onClick={() => openShareDialog(report.name)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          📤 Share PDF Report
        </button>
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = report.url;
            link.download = `${report.name}.pdf`;
            link.click();
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
        >
          ⬇️ Download PDF
        </button>
      </div>

      {/* Acceptance Gate Modal */}
      <SharePdfAcceptanceGate
        isOpen={isOpen}
        reportName={reportName}
        onClose={closeShareDialog}
        onAcceptAndShare={async () => {
          await handleShare(handleSharePdf);
        }}
      />
    </div>
  );
}

/**
 * Alternative: Inline Implementation
 *
 * If you prefer not to use the hook, you can manage state directly:
 */

export function ReportViewerManual({ report }: { report: ReportData }) {
  const [showAcceptance, setShowAcceptance] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Your share logic here
      const link = document.createElement('a');
      link.href = report.url;
      link.download = `${report.name}.pdf`;
      link.click();
    } finally {
      setIsSharing(false);
      setShowAcceptance(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAcceptance(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Share PDF
      </button>

      <SharePdfAcceptanceGate
        isOpen={showAcceptance}
        reportName={report.name}
        isLoading={isSharing}
        onClose={() => setShowAcceptance(false)}
        onAcceptAndShare={handleShare}
      />
    </div>
  );
}

/**
 * Usage with Branded Reports
 *
 * Integrate with CCP-06 branded reports feature:
 */

export function BrandedReportShare({
  report,
  workspaceId,
}: {
  report: ReportData;
  workspaceId: string;
}) {
  const { isOpen, reportName, openShareDialog, closeShareDialog, handleShare } =
    useSharePdfGate();

  const sendBrandedReport = async () => {
    // Call your branded report API endpoint
    const response = await fetch(
      `/api/workspaces/${workspaceId}/branded-reports/share`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to share report');
    }

    // Copy shareable link to clipboard
    const { shareLink } = await response.json();
    await navigator.clipboard.writeText(shareLink);

    // Show success message
    alert('Shareable link copied to clipboard!');
  };

  return (
    <>
      <button
        onClick={() => openShareDialog(report.name)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Share Branded Report
      </button>

      <SharePdfAcceptanceGate
        isOpen={isOpen}
        reportName={reportName}
        onClose={closeShareDialog}
        onAcceptAndShare={async () => {
          await handleShare(sendBrandedReport);
        }}
      />
    </>
  );
}
