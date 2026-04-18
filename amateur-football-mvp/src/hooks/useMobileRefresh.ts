'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * A hook to handle the global refresh logic on mobile.
 */
export function useMobileRefresh() {
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    // In a real app, this might trigger a query invalidation (React Query)
    // For now, we'll do a simple router refresh which is the standard Next.js way
    router.refresh();
    
    // Simulate some loading time for visual feedback
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, [router]);

  return { handleRefresh };
}
