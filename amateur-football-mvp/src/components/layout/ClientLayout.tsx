'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback, UIEvent } from 'react';
import { Sidebar, SidebarContent } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationToast, NotificationPromptBanner } from '@/components/notifications/NotificationUI';
import { FloatingChat } from '@/components/FloatingChat';
import { initializePushNotifications } from '@/lib/notifications';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isNotificationsOpen, setNotificationsOpen } = useSidebar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fcmInitRef = useRef(false);

  // Scroll to show/hide header state
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // threshold before hiding to avoid jitter at very top
    if (currentScrollY > 60) {
      if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling down significantly
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling up significantly
        setHeaderVisible(true);
      }
    } else {
      setHeaderVisible(true);
    }
    
    lastScrollY.current = currentScrollY;
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
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
  const isFeedOrPostPage = pathname.startsWith('/feed') || pathname.startsWith('/post');
  const showNav = !isAuthPage && !!user && !isHighlightsPage;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[100dvh] w-full relative bg-background">
      {/* Global Push Notification Toast (foreground messages) */}
      {showNav && <NotificationToast />}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out max-h-[100dvh]',
          isHighlightsPage || pathname.startsWith('/messages') ? 'overflow-hidden' : 'overflow-y-auto'
        )}
      >
        {showNav && <TopHeader isVisible={headerVisible} />}

        <main
          className={cn(
            'flex-1 flex flex-col w-full relative min-h-0',
            showNav
              ? pathname.startsWith('/match') ||
                pathname === '/profile' ||
                pathname.startsWith('/profile/')
                ? 'pb-24 lg:pt-24 lg:pb-0'
                : pathname.startsWith('/messages')
                  ? 'pb-0 lg:pt-24 lg:pb-0'
                  : isFeedOrPostPage
                    ? 'pb-0 lg:pt-24 lg:pb-0'
                    : pathname === '/'
                      ? 'pb-24 lg:pt-28 lg:pb-0' // Only 32 for home page
                      : 'pb-24 lg:pt-24 lg:pb-0' // Reset others to 24
              : ''
          )}
        >
          {/* Push Notification Permission Banner */}
          {showNav && <NotificationPromptBanner />}
          {children}
        </main>

        {/* Mobile Navigation */}
        {showNav && !isFeedOrPostPage && (
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
    </div>
  );
}
