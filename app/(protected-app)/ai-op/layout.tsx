import { ReactNode } from 'react';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function AiOpLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect('/login/sign-in');
  }
  const team = await getTeamForUser(user.id);
  if (!team || !(team.subscriptionStatus === 'active' || team.subscriptionStatus === 'trialing')) {
    redirect('/pricing?access=premium');
  }
  return <>{children}</>;
} 