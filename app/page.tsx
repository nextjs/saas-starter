'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded mx-auto" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded mx-auto" />
      </div>
    </div>
  );
} 