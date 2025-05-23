import { UserProvider } from '@/lib/auth';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { Header } from './components';
import { Suspense } from 'react';
import PosthogProvider from '@/components/PosthogProvider';

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const team = user ? await getTeamForUser(user.id) : null;
  const userPromise = Promise.resolve(user);

  return (
    <UserProvider userPromise={userPromise}>
      <PosthogProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
          <Suspense fallback={<div className="h-12 bg-white border-b border-gray-100" />}>
            <Header user={user} team={team} />
          </Suspense>
          <main className="flex-grow flex flex-col overflow-hidden">
            <div className="w-full h-full overflow-auto max-w-full">
              {children}
            </div>
          </main>
        </div>
      </PosthogProvider>
    </UserProvider>
  );
} 