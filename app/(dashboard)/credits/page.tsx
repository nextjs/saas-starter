'use client';

import { CreditDashboard } from '@/components/credits/credit-components';
import { TeamDataWithMembers } from '@/lib/db/schema';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CreditsPage() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Credit Management</h1>
      {teamData && <CreditDashboard teamId={teamData.id} />}
    </div>
  );
}
