'use client';

import { useEffect, useState } from 'react';

export function useCreditCheck(teamId: number, requiredCredits: number) {
  const [hasSufficientCredits, setHasSufficientCredits] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    setLoading(true);
    fetch('/api/credits/check-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, requiredCredits }),
    })
      .then((res) => res.json())
      .then((data) => {
        setHasSufficientCredits(data.hasSufficientCredits);
        setLoading(false);
      })
      .catch(() => {
        setHasSufficientCredits(false);
        setLoading(false);
      });
  }, [teamId, requiredCredits]);

  return { hasSufficientCredits, loading };
}
