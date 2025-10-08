import { Suspense } from 'react';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { getSpaceUploads } from '@/lib/db/queries/uploads';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Users, Calendar, Download } from 'lucide-react';

interface SpacePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function SpaceDashboard({ slug }: { slug: string }) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const space = await getSpaceBySlug(slug);
  if (!space) {
    notFound();
  }

  const hasAccess = await userHasSpaceAccess(session.user.id, slug);
  if (!hasAccess) {
    redirect('/spaces');
  }

  const recentUploads = await getSpaceUploads(space.id, { page: 1, limit: 5 });

  return (
    <div className="space-y-6">
      {/* Space Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{space.name}</h1>
          <p className="text-muted-foreground">{space.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={`/spaces/${slug}/upload`}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/spaces/${slug}/files`}>
              <FileText className="w-4 h-4 mr-2" />
              View All Files
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentUploads.total}</div>
            <p className="text-xs text-muted-foreground">
              OTA images and related files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentUploads.total > 0 ? 'N/A' : '0 GB'}
            </div>
            <p className="text-xs text-muted-foreground">
              Storage used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Active collaborators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {space.updatedAt ? new Date(space.updatedAt).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>
            Latest files uploaded to this space
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentUploads.uploads.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No files yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by uploading your first OTA image.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href={`/spaces/${slug}/upload`}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentUploads.uploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{upload.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {upload.fileSize} bytes • {upload.contentType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(upload.uploadedAt).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { slug } = await params;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }>
        <SpaceDashboard slug={slug} />
      </Suspense>
    </div>
  );
}
