'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
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

          {/* Swipeable content wrapper */}
          <div className="flex-1 w-full relative overflow-hidden lg:overflow-visible">
            {/* Peek panel — shows next/previous section label behind the content */}
            {(swipeState.isSwiping || swipeState.isExiting) && swipeState.direction && (
              <div
                className={cn(
                  'absolute inset-0 z-0 flex items-center pointer-events-none lg:hidden',
                  swipeState.direction === 'left' ? 'justify-end pr-8' : 'justify-start pl-8'
                )}
              >
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <span className="text-[13px] font-black uppercase italic tracking-widest text-primary/80 font-kanit">
                    {swipeState.targetLabel}
                  </span>
                  <div className="w-8 h-[2px] rounded-full bg-primary/30" />
                </div>
              </div>



            )}

            {/* Main content — slides during swipe */}
            <div
              className="relative z-10 flex-1 min-h-0"
              style={{
                transform: (swipeState.isSwiping || swipeState.isExiting)
                  ? `translateX(${swipeState.offset}px)`
                  : 'translateX(0)',
                transition: swipeState.isSwiping
                  ? 'none'
                  : swipeState.isExiting
                    ? 'transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: (swipeState.isSwiping || swipeState.isExiting) ? 'transform' : 'auto',
              }}
            >
              {children}
            </div>
          </div>
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
