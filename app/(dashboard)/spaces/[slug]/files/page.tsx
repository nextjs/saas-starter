import { Suspense } from 'react';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { getSpaceUploads } from '@/lib/db/queries/uploads';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, Search, Download, Trash2, FileText, Calendar, User } from 'lucide-react';
import DownloadButton from './download-button';

interface FilesPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function FilesList({ slug, searchParams }: { slug: string; searchParams: any }) {
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

  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  
  const files = await getSpaceUploads(space.id, { 
    page, 
    limit: 20, 
    search: search || undefined 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/spaces/${slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Space
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Files</h1>
            <p className="text-muted-foreground">
              Manage files in {space.name}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/spaces/${slug}/upload`}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                className="pl-10"
                defaultValue={search}
              />
            </div>
            <Button variant="outline">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Files ({files.total})</CardTitle>
          <CardDescription>
            All files uploaded to this space
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.uploads.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold">No files found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? 'No files match your search.' : 'Get started by uploading your first file.'}
              </p>
              {!search && (
                <div className="mt-6">
                  <Button asChild>
                    <Link href={`/spaces/${slug}/upload`}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {files.uploads.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.filename}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{file.fileSize} bytes</span>
                        {file.contentType && <span>• {file.contentType}</span>}
                        {file.version && <span>• v{file.version}</span>}
                        {file.md5Hash && <span>• MD5: {file.md5Hash.substring(0, 8)}...</span>}
                      </div>
                      {file.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{file.uploadedBy}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <DownloadButton 
                        fileId={file.id}
                        filename={file.filename}
                        spaceSlug={slug}
                      />
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {files.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button 
            variant="outline" 
            disabled={page === 1}
            asChild
          >
            <Link href={`/spaces/${slug}/files?page=${page - 1}${search ? `&search=${search}` : ''}`}>
              Previous
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {files.totalPages}
          </span>
          <Button 
            variant="outline" 
            disabled={page === files.totalPages}
            asChild
          >
            <Link href={`/spaces/${slug}/files?page=${page + 1}${search ? `&search=${search}` : ''}`}>
              Next
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default async function FilesPage({ params, searchParams }: FilesPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <FilesList slug={slug} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
