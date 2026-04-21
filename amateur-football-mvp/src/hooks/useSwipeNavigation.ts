'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSwipeDirection } from '@/contexts/SwipeNavigationContext';
import { useSidebar } from '@/contexts/SidebarContext';

/**
 * Ordered routes matching the BottomNav items (excluding the center "create" button).
 * Swipe left → next route, Swipe right → previous route.
 */
const NAV_ROUTES = ['/', '/search', '/feed', '/messages'];

const NAV_LABELS: Record<string, string> = {
  '/': 'Home',
  '/search': 'Buscar',
  '/feed': 'Muro',
  '/messages': 'Chats',
};

export interface SwipeState {
  /** Current swipe offset in px (negative = swiping left, positive = swiping right) */
  offset: number;
  /** Whether a swipe gesture is actively happening */
  isSwiping: boolean;
  /** Whether the exit animation is playing (content sliding off-screen) */
  isExiting: boolean;
  /** Direction the navigation will go when released ('left' | 'right' | null) */
  direction: 'left' | 'right' | null;
  /** Label of the section being swiped toward */
  targetLabel: string | null;
}

/**
 * Instagram-style swipe navigation between BottomNav sections.
 *
 * Key behaviors:
 * - Horizontal lock with 1.5x ratio vs vertical movement
 * - 30px edge exclusion for OS back gestures
 * - On release past threshold: animates content fully off-screen, THEN navigates
 * - Sets swipe direction in context so template.tsx can do directional entry animation
 */
export function useSwipeNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { setDirection } = useSwipeDirection();
  const { openSidebar } = useSidebar();

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; time: number } | null>(null);
  const velocityRef = useRef(0);
  const isLockedRef = useRef<'horizontal' | 'vertical' | null>(null);
  const currentOffsetRef = useRef(0);
  const isNavigatingRef = useRef(false);

  const [swipeState, setSwipeState] = useState<SwipeState>({
    offset: 0,
    isSwiping: false,
    isExiting: false,
    direction: null,
    targetLabel: null,
  });

  // Find the current route index (match prefix for sub-routes)
  const getCurrentIndex = useCallback(() => {
    if (pathname === '/') return 0;
    const idx = NAV_ROUTES.findIndex((r, i) => i > 0 && pathname.startsWith(r));
    return idx >= 0 ? idx : -1;
  }, [pathname]);

  // Reset state when pathname changes (navigation completed)
  useEffect(() => {
    isNavigatingRef.current = false;
    setSwipeState({
      offset: 0,
      isSwiping: false,
      isExiting: false,
      direction: null,
      targetLabel: null,
    });
  }, [pathname]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isNavigatingRef.current) return;

    const target = e.target as HTMLElement;
    if (
      target.closest('.swipe-ignore') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[data-radix-scroll-area-viewport]') ||
      target.closest('.map-container') ||
      target.closest('video') ||
      target.closest('.bottom-sheet') ||
      target.closest('.mobile-bottom-nav') ||
      target.closest('[role="dialog"]')
    ) {
      return;
    }

    const touch = e.touches[0];

    // Edge exclusion zone for OS-level back gestures
    const EDGE_ZONE = 30;
    if (touch.clientX < EDGE_ZONE || touch.clientX > window.innerWidth - EDGE_ZONE) {
      return;
    }

    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    lastTouchRef.current = { x: touch.clientX, time: Date.now() };
    velocityRef.current = 0;
    isLockedRef.current = null;
    currentOffsetRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || isNavigatingRef.current) return;

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Calculate velocity
    if (lastTouchRef.current) {
      const now = Date.now();
      const dt = now - lastTouchRef.current.time;
      if (dt > 0) {
        velocityRef.current = (touch.clientX - lastTouchRef.current.x) / dt;
      }
      lastTouchRef.current = { x: touch.clientX, time: now };
    }

    // Decision phase
    if (!isLockedRef.current) {
      if (absDx < 8 && absDy < 8) return;

      if (absDx > absDy * 1.2 && absDx > 12) {
        const currentIdx = getCurrentIndex();
        if (currentIdx < 0) return;

        const canSwipeLeft = currentIdx < NAV_ROUTES.length - 1;
        const canSwipeRight = currentIdx > 0 || currentIdx === 0; // Allow swipe right at Home for Sidebar
        if ((dx < 0 && !canSwipeLeft) || (dx > 0 && !canSwipeRight)) {
          isLockedRef.current = 'vertical';
          return;
        }

        isLockedRef.current = 'horizontal';
      } else if (absDy > 12 || absDy > absDx) {
        isLockedRef.current = 'vertical';
        return;
      }
    }

    if (isLockedRef.current !== 'horizontal') return;

    e.preventDefault();

    const currentIdx = getCurrentIndex();
    const canSwipeLeft = currentIdx < NAV_ROUTES.length - 1;
    const canSwipeRight = currentIdx > 0 || currentIdx === 0;

    let clampedDx = dx;
    if ((dx < 0 && !canSwipeLeft) || (dx > 0 && !canSwipeRight)) {
      clampedDx = dx * 0.15; // Rubber-band resistance
    }

    // Cap offset to full screen width instead of 0.5
    const maxOffset = window.innerWidth * 0.95;
    clampedDx = Math.max(-maxOffset, Math.min(maxOffset, clampedDx));
    currentOffsetRef.current = clampedDx;

    const dir = clampedDx < -20 ? 'left' : clampedDx > 20 ? 'right' : null;
    const targetIdx = dir === 'left' ? currentIdx + 1 : dir === 'right' ? currentIdx - 1 : -1;
    const targetRoute = targetIdx >= 0 && targetIdx < NAV_ROUTES.length ? NAV_ROUTES[targetIdx] : null;

    let targetLabel = targetRoute ? NAV_LABELS[targetRoute] || null : null;
    if (dir === 'right' && currentIdx === 0) {
      targetLabel = 'Menú';
    }

    setSwipeState({
      offset: clampedDx,
      isSwiping: true,
      isExiting: false,
      direction: dir,
      targetLabel,
    });
  }, [getCurrentIndex]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || isLockedRef.current !== 'horizontal' || isNavigatingRef.current) {
      touchStartRef.current = null;
      isLockedRef.current = null;
      return;
    }

    const offset = currentOffsetRef.current;
    const distanceThreshold = window.innerWidth * 0.3; // 30% of screen width
    const velocityThreshold = 0.4; // px per ms
    const currentIdx = getCurrentIndex();

    const isFastSwipeLeft = offset < 0 && velocityRef.current < -velocityThreshold;
    const isFastSwipeRight = offset > 0 && velocityRef.current > velocityThreshold;
    const isPastDistance = Math.abs(offset) > distanceThreshold;

    if (currentIdx >= 0 && (isPastDistance || isFastSwipeLeft || isFastSwipeRight)) {
      const dir = offset < 0 ? 'left' : 'right';

      // Special case: opening Sidebar from Home
      if (dir === 'right' && currentIdx === 0) {
        touchStartRef.current = null;
        isLockedRef.current = null;
        currentOffsetRef.current = 0;
        
        // Reset state immediately and open sidebar
        setSwipeState({
          offset: 0,
          isSwiping: false,
          isExiting: false,
          direction: null,
          targetLabel: null,
        });
        openSidebar();
        return;
      }

      const targetIdx = dir === 'left' ? currentIdx + 1 : currentIdx - 1;

      if (targetIdx >= 0 && targetIdx < NAV_ROUTES.length) {
        isNavigatingRef.current = true;

        // Set the direction in context for template.tsx entry animation
        setDirection(dir);

        // Animate content off-screen (full exit), THEN navigate
        const exitOffset = dir === 'left' ? -window.innerWidth : window.innerWidth;
        setSwipeState({
          offset: exitOffset,
          isSwiping: false,
          isExiting: true,
          direction: dir,
          targetLabel: NAV_LABELS[NAV_ROUTES[targetIdx]] || null,
        });

        // Navigate after the exit animation completes
        setTimeout(() => {
          router.push(NAV_ROUTES[targetIdx]);
        }, 250);

        touchStartRef.current = null;
        isLockedRef.current = null;
        currentOffsetRef.current = 0;
        return;
      }
    }

    // Snap back — didn't meet threshold
    setSwipeState({
      offset: 0,
      isSwiping: false,
      isExiting: false,
      direction: null,
      targetLabel: null,
    });

    touchStartRef.current = null;
    isLockedRef.current = null;
    currentOffsetRef.current = 0;
  }, [getCurrentIndex, router, setDirection]);

  useEffect(() => {
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
