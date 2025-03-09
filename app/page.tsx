'use client';

// @ts-ignore
import { useEffect } from 'react';
// @ts-ignore
import { useRouter } from 'next/navigation';

export default function HomePage() {
  // @ts-ignore
  const router = useRouter();
  
  // @ts-ignore
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  
  // Return a valid React component while the redirect happens
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to dashboard...</h1>
        <p className="mt-2">Please wait while we redirect you.</p>
      </div>
    </div>
  );
} 