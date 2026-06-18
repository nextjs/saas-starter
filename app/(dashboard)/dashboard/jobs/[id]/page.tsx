import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJobForTeam, getInspectionRecordsForTeam, getJobOperationsForTeam } from '@/lib/db/queries';
import { ArrowLeft } from 'lucide-react';
import { JobOperations } from './job-operations';
import { JobInspectionRecords } from './job-inspection-records';
import { DownloadTravelerPdfButton } from './download-traveler-pdf';

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString();
}

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = parseInt(id, 10);

  if (isNaN(jobId)) {
    notFound();
  }

  const job = await getJobForTeam(jobId);

  if (!job) {
    notFound();
  }

  const operations = (await getJobOperationsForTeam(jobId)) ?? [];
  const inspectionRecords = (await getInspectionRecordsForTeam(jobId)) ?? [];

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-3">
          <Link href="/dashboard/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg lg:text-2xl font-medium text-gray-900">
            {job.jobNumber}
          </h1>
          <DownloadTravelerPdfButton jobId={jobId} jobNumber={job.jobNumber} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Job Number</dt>
              <dd className="font-medium">{job.jobNumber}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">{job.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Customer Name</dt>
              <dd className="font-medium">{job.customerName || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Part Number</dt>
              <dd className="font-medium">{job.partNumber || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Part Revision</dt>
              <dd className="font-medium">{job.partRevision || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Quantity</dt>
              <dd className="font-medium">{job.quantity ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Due Date</dt>
              <dd className="font-medium">{formatDate(job.dueDate)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Created</dt>
              <dd className="font-medium">{formatDate(job.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <JobOperations jobId={jobId} operations={operations} />

      <JobInspectionRecords
        jobId={jobId}
        operations={operations}
        records={inspectionRecords}
      />
    </section>
  );
}
