import { Suspense } from 'react';
import { Login } from '../login';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function SignInPage() {
  const userSession = await getSession();
  if (userSession) {
    redirect('/dashboard');
  }
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
