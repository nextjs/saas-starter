import { Suspense } from 'react';
import { Login } from '../login';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function SignUpPage() {
  const userSession = await getSession();
  if (userSession) {
    redirect('/dashboard');
  }
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
