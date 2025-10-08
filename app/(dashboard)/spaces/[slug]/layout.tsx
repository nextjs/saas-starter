import { Suspense } from 'react';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface SpaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

async function Breadcrumbs({ slug }: { slug: string }) {
  const space = await getSpaceBySlug(slug);
  if (!space) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link href="/spaces" className="flex items-center hover:text-foreground">
        <Home className="w-4 h-4 mr-1" />
        Spaces
      </Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-foreground font-medium">{space.name}</span>
    </nav>
  );
}

async function SpaceLayout({ children, params }: SpaceLayoutProps) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { slug } = await params;
  const space = await getSpaceBySlug(slug);
  if (!space) {
    notFound();
  }

  const hasAccess = await userHasSpaceAccess(session.user.id, slug);
  if (!hasAccess) {
    redirect('/spaces');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Suspense fallback={
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          }>
            <Breadcrumbs slug={slug} />
          </Suspense>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

export default SpaceLayout;
