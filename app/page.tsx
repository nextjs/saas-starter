import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function RootPage() {
  const session = await getSession();
  
  if (session?.user?.id) {
    // User is authenticated, redirect to dashboard
    redirect('/dashboard');
  } else {
    // User is not authenticated, redirect to login
    redirect('/sign-in');
  }
}
