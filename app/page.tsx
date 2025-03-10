'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      router.push(session ? '/dashboard' : '/sign-in');
    };
    
    checkSession();
  }, [router, supabase.auth]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded mx-auto" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded mx-auto" />
      </div>
    </div>
  );
} 