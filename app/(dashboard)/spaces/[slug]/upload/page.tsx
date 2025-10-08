import { Suspense } from 'react';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UploadForm from './upload-form';

interface UploadPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function UploadPageContent({ slug }: { slug: string }) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/spaces/${slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Space
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload Files</h1>
          <p className="text-muted-foreground">
            Upload OTA images and related files to {space.name}
          </p>
        </div>
      </div>

      <UploadForm spaceSlug={slug} spaceName={space.name} />
    </div>
  );
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <UploadPageContent slug={slug} />
    </Suspense>
  );
}
