'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useRef, TouchEvent } from 'react';
import { useHaptic } from '@/hooks/useHaptic';

const SWIPE_THRESHOLD = 50; // Minimum distance to trigger swipe
const ANGLE_THRESHOLD = 30; // Max angle from horizontal to count as horizontal swipe

interface SwipeNavigationProps {
  paths: string[];
}

export function useSwipeNavigation({ paths }: SwipeNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hapticLight } = useHaptic();
  
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    // Only on mobile
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;

    // Don't trigger on inputs, textareas, or elements that should ignore swipes
    const target = e.target as HTMLElement;
    if (
      target.closest('input, textarea, select, [role="slider"], .no-swipe') ||
      target.closest('.overflow-x-auto')
    ) {
      return;
    }

    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    
    // Check if the swipe is primarily horizontal and significant
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.8 && Math.abs(deltaX) > SWIPE_THRESHOLD;

    if (isHorizontal) {
      // Find current index based on which path the current route starts with
      const sortedPaths = [...paths].sort((a, b) => b.length - a.length);
      const matchedPath = sortedPaths.find(p => p !== '/' && pathname.startsWith(p)) || (pathname === '/' ? '/' : null);
      
      const currentIndex = matchedPath ? paths.indexOf(matchedPath) : -1;
      
      if (currentIndex !== -1) {
        if (deltaX > 0) {
          // Swipe Right (Go to Previous)
          if (currentIndex > 0) {
            hapticLight();
            router.push(paths[currentIndex - 1]);
          }
        } else {
          // Swipe Left (Go to Next)
          if (currentIndex < paths.length - 1) {
            hapticLight();
            router.push(paths[currentIndex + 1]);
          }
        }
      }
    }

    touchStart.current = null;
  }, [pathname, paths, router, hapticLight]);

  return { onTouchStart, onTouchEnd };
}
