'use client';

import { useEffect, useState } from 'react';
import { useCreditCheck } from './use-credit-check';

interface CreditBalanceProps {
  teamId: number;
}

export function CreditBalance({ teamId }: CreditBalanceProps) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/credits/balance?teamId=${teamId}`)
      .then((res) => res.json())
      .then((data) => {
        setBalance(data.balance);
        setLoading(false);
      });
  }, [teamId]);

  if (loading) {
    return <div>Loading credits...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium">Credit Balance</h3>
      <p className="text-2xl font-bold">{balance}</p>
    </div>
  );
}

interface CreditDashboardProps {
  teamId: number;
}

export function CreditDashboard({ teamId }: CreditDashboardProps) {
  const [usageHistory, setUsageHistory] = useState([]);
  const [grantsHistory, setGrantsHistory] = useState([]);

  useEffect(() => {
    fetch(`/api/credits/usage-history?teamId=${teamId}`)
      .then((res) => res.json())
      .then(setUsageHistory);

    fetch(`/api/credits/grants-history?teamId=${teamId}`)
      .then((res) => res.json())
      .then(setGrantsHistory);
  }, [teamId]);

  return (
    <div>
      <CreditBalance teamId={teamId} />
      <div className="mt-6">
        <h4 className="text-md font-medium">Usage History</h4>
        <ul>
          {usageHistory.map((item: any) => (
            <li key={item.id}>
              {item.createdAt}: {item.description} - {item.creditsUsed} credits
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <h4 className="text-md font-medium">Grants History</h4>
        <ul>
          {grantsHistory.map((item: any) => (
            <li key={item.id}>
              {item.createdAt}: {item.grantReason} - {item.creditsGranted} credits
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export { useCreditCheck };
