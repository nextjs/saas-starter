import { Suspense } from 'react';
import { getSession } from '@/lib/auth/session';
import { getUserSpaces } from '@/lib/db/queries/spaces';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Users, FileText } from 'lucide-react';

async function SpacesList() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const spaces = await getUserSpaces(session.user.id);

  if (spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">No spaces found</h3>
          <p className="text-muted-foreground">
            You don't have access to any spaces yet. Contact an administrator to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Spaces</h1>
          <p className="text-muted-foreground">
            Manage your OTA image uploads and team collaboration
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Space
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space) => (
          <Card key={space.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{space.name}</CardTitle>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {space.userRole}
                </span>
              </div>
              <CardDescription>{space.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>{space.fileCount} files</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{space.memberCount} members</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button asChild className="flex-1">
                  <Link href={`/spaces/${space.slug}`}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/spaces/${space.slug}/files`}>
                    View Files
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SpacesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }>
        <SpacesList />
      </Suspense>
    </div>
  );
}
