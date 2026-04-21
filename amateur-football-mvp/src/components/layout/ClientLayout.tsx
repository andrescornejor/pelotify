'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback, UIEvent, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationToast, NotificationPromptBanner } from '@/components/notifications/NotificationUI';
import { FloatingChat } from '@/components/FloatingChat';
import { initializePushNotifications } from '@/lib/notifications';
import { MobileStatusBar } from '@/components/MobileStatusBar';
import { MobilePullToRefresh } from '@/components/MobilePullToRefresh';
import { MobileOfflineBanner } from '@/components/MobileOfflineBanner';
import { useMobileRefresh } from '@/hooks/useMobileRefresh';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isNotificationsOpen, setNotificationsOpen } = useSidebar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fcmInitRef = useRef(false);
  const { handleRefresh } = useMobileRefresh();
  const swipeState = useSwipeNavigation();

  // Scroll to show/hide header state
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 76) {
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Initialize FCM push notifications when user is logged in
  useEffect(() => {
    if (!user?.id || fcmInitRef.current) return;

    // Only auto-initialize if permission was previously granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      fcmInitRef.current = true;
      initializePushNotifications(user.id).then((token) => {
        if (token) {
          console.log('🔔 FCM Push Notifications initialized');
        }
      });
    }
  }, [user?.id]);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/onboarding' ||
    pathname === '/team-builder' ||
    pathname.startsWith('/canchas');

  const isHighlightsPage = pathname === '/highlights';
  const isProfilePage = pathname.startsWith('/feed/profile');
  const showNav = !isAuthPage && !!user && !isHighlightsPage;
  const showTopHeader = showNav && !isProfilePage;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[100dvh] w-full relative bg-background">
      {/* Global Push Notification Toast (foreground messages) */}
      {showNav && <NotificationToast />}

      <div
        ref={scrollContainerRef}
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out min-h-screen'
        )}
      >
        {showTopHeader && <TopHeader isVisible={headerVisible} />}

        <main
          className={cn(
            'flex-1 flex flex-col w-full relative min-h-0',
            showNav
                ? pathname === '/'
                    ? 'pb-[calc(58px+env(safe-area-inset-bottom,0px))] lg:pt-28 lg:pb-0'
                    : 'pb-[calc(58px+env(safe-area-inset-bottom,0px))] lg:pt-24 lg:pb-0'
              : ''
          )}
        >
          {/* Push Notification Permission Banner */}
          {showNav && <NotificationPromptBanner />}
          
          <div
            className="flex-1 w-full relative"
            style={{
              transform: swipeState.isSwiping ? `translateX(${swipeState.offset}px)` : 'translateX(0)',
              transition: swipeState.isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: swipeState.isSwiping ? 'transform' : 'auto',
            }}
          >
            {children}
          </div>

          {/* Swipe edge indicators */}
          {swipeState.isSwiping && swipeState.direction && (
            <div
              className={cn(
                'fixed top-1/2 -translate-y-1/2 z-[200] pointer-events-none transition-opacity duration-150 lg:hidden',
                swipeState.direction === 'right' ? 'left-3' : 'right-3',
                Math.abs(swipeState.offset) > 60 ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className="bg-background/90 backdrop-blur-md border border-primary/30 rounded-2xl px-4 py-2.5 shadow-[0_0_20px_rgba(44,252,125,0.15)]">
                <SwipeLabel direction={swipeState.direction} pathname={pathname} />
              </div>
            </div>
          )}
        </main>

        {/* Mobile Navigation */}
        {showNav && (
          <div className="lg:hidden mobile-bottom-nav z-[100] fixed bottom-0 left-0 right-0">
            <BottomNav />
          </div>
        )}
      </div>

      {/* Mobile Sidebar drawer */}
      {showNav && <Sidebar />}

      {/* Global Notification Center */}
      {showNav && (
        <NotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />
      )}

      {/* Persistent Floating Chat (Desktop only) */}
      {showNav && <FloatingChat />}
      
      {/* Mobile-only tools */}
      <MobileStatusBar />
      <MobileOfflineBanner />
    </div>
  );
}

/** Small helper that shows the name of the section being swiped toward */
const NAV_ROUTES_META = [
  { path: '/', label: 'Home' },
  { path: '/search', label: 'Buscar' },
  { path: '/feed', label: 'Muro' },
  { path: '/messages', label: 'Chats' },
];

function SwipeLabel({ direction, pathname }: { direction: 'left' | 'right'; pathname: string }) {
  const currentIdx = pathname === '/'
    ? 0
    : NAV_ROUTES_META.findIndex((r, i) => i > 0 && pathname.startsWith(r.path));
  
  const targetIdx = direction === 'left' ? currentIdx + 1 : currentIdx - 1;
  const target = NAV_ROUTES_META[targetIdx];
  if (!target) return null;

  return (
    <span className="text-[11px] font-black uppercase italic tracking-wider text-primary font-kanit">
      {direction === 'right' ? '‹ ' : ''}{target.label}{direction === 'left' ? ' ›' : ''}
    </span>
  );
}
