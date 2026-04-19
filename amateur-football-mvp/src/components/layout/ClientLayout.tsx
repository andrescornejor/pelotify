'use client';

import { usePathname, useRouter } from 'next/navigation';
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
import { MobileStatusBar } from '@/components/MobileStatusBar';
import { MobilePullToRefresh } from '@/components/MobilePullToRefresh';
import { MobileOfflineBanner } from '@/components/MobileOfflineBanner';
import { useMobileRefresh } from '@/hooks/useMobileRefresh';
import { useHaptic } from '@/hooks/useHaptic';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { motion, AnimatePresence } from 'framer-motion';


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isNotificationsOpen, setNotificationsOpen } = useSidebar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fcmInitRef = useRef(false);
  const { handleRefresh } = useMobileRefresh();
  const { hapticLight } = useHaptic();

  // Scroll to show/hide header state
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Swipe navigation for mobile
  const [direction, setDirection] = useState(0);
  const [prevPath, setPrevPath] = useState(pathname);
  const navPaths = ['/', '/search', '/feed', '/messages'];
  
  // Update direction synchronously when pathname changes
  if (pathname !== prevPath) {
    const prevIdx = navPaths.indexOf(prevPath);
    const curIdx = navPaths.indexOf(pathname);
    
    if (prevIdx !== -1 && curIdx !== -1) {
      const newDir = curIdx > prevIdx ? 1 : -1;
      if (newDir !== direction) setDirection(newDir);
    } else {
      if (direction !== 0) setDirection(0);
    }
    setPrevPath(pathname);
  }

  const { onTouchStart, onTouchEnd } = useSwipeNavigation({ 
    paths: navPaths,
    onNavigate: (dir) => setDirection(dir)
  });

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
  const isMessagesPage = pathname.startsWith('/messages');
  const isProfilePage = pathname.startsWith('/feed/profile');
  const isFeedOrPostPage = pathname.startsWith('/feed') || pathname.startsWith('/post');
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
        onScroll={handleScroll}
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out max-h-[100dvh]',
          isHighlightsPage || pathname.startsWith('/messages') ? 'overflow-hidden' : 'overflow-y-auto'
        )}
        onTouchStart={showNav ? onTouchStart : undefined}
        onTouchEnd={showNav ? onTouchEnd : undefined}
      >
        {showTopHeader && <TopHeader isVisible={headerVisible} />}

        <main
          className={cn(
            'flex-1 flex flex-col w-full relative min-h-0',
            showNav
              ? pathname === '/'
                  ? 'pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pt-28 lg:pb-0'
                  : 'pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pt-24 lg:pb-0'
              : ''
          )}
        >
          {/* Push Notification Permission Banner */}
          {showNav && <NotificationPromptBanner />}
          
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={pathname}
                custom={direction}
                initial={direction !== 0 ? { x: direction * 100 + '%', opacity: 0 } : false}
                animate={{ x: 0, opacity: 1 }}
                exit={direction !== 0 ? { x: direction * -100 + '%', opacity: 0 } : { opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden"
              >
                {/* Mobile-only Pull-to-Refresh for key pages */}
                {showNav && (pathname === '/' || pathname === '/feed') ? (
                  <div className="flex-1 lg:hidden">
                    <MobilePullToRefresh onRefresh={handleRefresh}>
                      {children}
                    </MobilePullToRefresh>
                  </div>
                ) : null}
                
                {/* Desktop & Non-refreshable mobile pages */}
                <div className={cn(
                  "flex-1",
                  (showNav && (pathname === '/' || pathname === '/feed')) ? "hidden lg:block" : "block"
                )}>
                  {children}
                </div>
              </motion.div>
            </AnimatePresence>
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
