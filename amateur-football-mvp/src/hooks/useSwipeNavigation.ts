'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Ordered routes matching the BottomNav items (excluding the center "create" button).
 * Swipe left → next route, Swipe right → previous route.
 */
const NAV_ROUTES = ['/', '/search', '/feed', '/messages'];

interface SwipeState {
  /** Current swipe offset in px (negative = swiping left, positive = swiping right) */
  offset: number;
  /** Whether a swipe gesture is actively happening */
  isSwiping: boolean;
  /** Direction the navigation will go when released ('left' | 'right' | null) */
  direction: 'left' | 'right' | null;
}

/**
 * Hook that detects horizontal swipe gestures and navigates between BottomNav sections.
 * 
 * Design decisions:
 * - Uses a 30px horizontal threshold before "locking" into a swipe to avoid stealing vertical scroll.
 * - Once locked, prevents vertical scroll for the duration of that touch.
 * - Only fires navigation on touch end if horizontal distance > 80px.
 * - Returns swipe state for visual feedback (offset, direction).
 */
export function useSwipeNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isLockedRef = useRef<'horizontal' | 'vertical' | null>(null);
  const currentOffsetRef = useRef(0);

  const [swipeState, setSwipeState] = useState<SwipeState>({
    offset: 0,
    isSwiping: false,
    direction: null,
  });

  // Find the current route index (match prefix for sub-routes like /feed/profile)
  const getCurrentIndex = useCallback(() => {
    if (pathname === '/') return 0;
    const idx = NAV_ROUTES.findIndex((r, i) => i > 0 && pathname.startsWith(r));
    return idx >= 0 ? idx : -1;
  }, [pathname]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Don't swipe if touching within interactive elements that handle their own swipe
    const target = e.target as HTMLElement;
    if (
      target.closest('.swipe-ignore') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[data-radix-scroll-area-viewport]') ||
      target.closest('.map-container') ||
      target.closest('video') ||
      target.closest('.bottom-sheet')
    ) {
      return;
    }

    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    isLockedRef.current = null;
    currentOffsetRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Decision phase: determine if this is a horizontal or vertical gesture
    if (!isLockedRef.current) {
      // Need at least some movement to decide
      if (absDx < 10 && absDy < 10) return;

      if (absDx > absDy * 1.5 && absDx > 20) {
        // Horizontal swipe detected
        const currentIdx = getCurrentIndex();
        if (currentIdx < 0) return; // Not on a nav route

        // Check if there's a valid target in this direction
        const canSwipeLeft = currentIdx < NAV_ROUTES.length - 1;
        const canSwipeRight = currentIdx > 0;
        if ((dx < 0 && !canSwipeLeft) || (dx > 0 && !canSwipeRight)) {
          isLockedRef.current = 'vertical'; // Can't swipe further, allow normal scroll
          return;
        }

        isLockedRef.current = 'horizontal';
      } else {
        isLockedRef.current = 'vertical';
        return;
      }
    }

    if (isLockedRef.current !== 'horizontal') return;

    // Prevent vertical scrolling while swiping horizontally
    e.preventDefault();

    // Apply resistance at the edges
    const currentIdx = getCurrentIndex();
    const canSwipeLeft = currentIdx < NAV_ROUTES.length - 1;
    const canSwipeRight = currentIdx > 0;

    let clampedDx = dx;
    if ((dx < 0 && !canSwipeLeft) || (dx > 0 && !canSwipeRight)) {
      clampedDx = dx * 0.2; // Rubber-band effect
    }

    // Cap the offset for visual feedback
    const maxOffset = window.innerWidth * 0.45;
    clampedDx = Math.max(-maxOffset, Math.min(maxOffset, clampedDx));

    currentOffsetRef.current = clampedDx;

    setSwipeState({
      offset: clampedDx,
      isSwiping: true,
      direction: clampedDx < -30 ? 'left' : clampedDx > 30 ? 'right' : null,
    });
  }, [getCurrentIndex]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || isLockedRef.current !== 'horizontal') {
      touchStartRef.current = null;
      isLockedRef.current = null;
      return;
    }

    const offset = currentOffsetRef.current;
    const threshold = 80; // Minimum distance to trigger navigation
    const currentIdx = getCurrentIndex();

    // Reset visual state with animation
    setSwipeState({ offset: 0, isSwiping: false, direction: null });

    if (currentIdx >= 0 && Math.abs(offset) > threshold) {
      if (offset < -threshold && currentIdx < NAV_ROUTES.length - 1) {
        // Swiped left → go to next section
        router.push(NAV_ROUTES[currentIdx + 1]);
      } else if (offset > threshold && currentIdx > 0) {
        // Swiped right → go to previous section
        router.push(NAV_ROUTES[currentIdx - 1]);
      }
    }

    touchStartRef.current = null;
    isLockedRef.current = null;
    currentOffsetRef.current = 0;
  }, [getCurrentIndex, router]);

  useEffect(() => {
    // Only enable on mobile (pointer: coarse or narrow viewport)
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return swipeState;
}
