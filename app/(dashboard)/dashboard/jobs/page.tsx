import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJobsForTeam } from '@/lib/db/queries';
import { Briefcase, PlusCircle } from 'lucide-react';

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString();
}

export default async function JobsPage() {
  const jobsList = await getJobsForTeam();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900">Jobs</h1>
        <Button
          asChild
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Link href="/dashboard/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Job
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobsList.length > 0 ? (
            <ul className="space-y-4">
              {jobsList.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="font-medium text-gray-900 hover:text-orange-600"
                    >
                      {job.jobNumber}
                    </Link>
                    {job.customerName && (
                      <p className="text-sm text-muted-foreground">
                        {job.customerName}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="capitalize text-gray-900">{job.status}</p>
                    <p className="text-muted-foreground">
                      Due {formatDate(job.dueDate)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Briefcase className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No jobs yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mb-4">
                Create your first job to start tracking work for your team.
              </p>
              <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Link href="/dashboard/jobs/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Job
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
