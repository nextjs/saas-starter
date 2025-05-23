'use client';

import { useEffect, useState } from 'react';

export default function ClientHydrationWrapper({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Only run client-side to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same structure to minimize layout shift
    // but hide it until client side hydration is complete
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <>{children}</>;
} 