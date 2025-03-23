'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Encounter, transformEncounterFromApi } from '@/types/encounter';

export function useEncounters() {
  const [patientRecords, setPatientRecords] = useState<Encounter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchEncounters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/encounters');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        throw new Error('No data received from API');
      }
      
      // Transform the API response to match our Encounter type
      const transformedData = Array.isArray(data) 
        ? data.map(item => transformEncounterFromApi(item))
        : [];
      
      setPatientRecords(transformedData);
    } catch (err: any) {
      console.error('Failed to fetch encounters:', err);
      setError(err.message || 'Failed to fetch encounters');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToEncounter = (chartId: string) => {
    router.push(`/encounter/${chartId}`);
  };

  useEffect(() => {
    fetchEncounters();
  }, []);

  return {
    patientRecords,
    isLoading,
    error,
    fetchEncounters,
    navigateToEncounter
  };
}
