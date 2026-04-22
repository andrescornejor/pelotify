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
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { 
    isNotificationsOpen, setNotificationsOpen, 
    isNavMenuOpen, setNavMenuOpen,
    expandedImageUrl, setExpandedImageUrl 
  } = useSidebar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fcmInitRef = useRef(false);
  const { handleRefresh } = useMobileRefresh();
  const swipeState = useSwipeNavigation();
  const { hapticLight } = useHaptic();

  // Scroll to show/hide header and bottom nav state
  const [headerVisible, setHeaderVisible] = useState(true);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setHeaderVisible(true);
        setBottomNavVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 76) {
        setHeaderVisible(false);
        setBottomNavVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
        setBottomNavVisible(true);
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
        {/* Global Nav Menu Backdrop (Entire Screen) */}
        <AnimatePresence>
          {isNavMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                hapticLight();
                setNavMenuOpen(false);
              }}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xl lg:hidden cursor-pointer"
            />
          )}
        </AnimatePresence>

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
              className={cn(
                "relative z-10 flex-1 min-h-0 transition-[border-radius,box-shadow] duration-200",
                (swipeState.isSwiping || swipeState.isExiting) ? "bg-background shadow-xl rounded-3xl" : ""
              )}
              style={{
                transform: (swipeState.isSwiping || swipeState.isExiting)
                  ? `translate3d(${swipeState.offset}px, 0, 0)`
                  : 'none',
                transition: swipeState.isSwiping
                  ? 'none'
                  : swipeState.isExiting
                    ? 'transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    : 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <MobilePullToRefresh onRefresh={handleRefresh}>
                {children}
              </MobilePullToRefresh>
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        {showNav && (
          <div 
            className={cn(
              "lg:hidden mobile-bottom-nav z-[100] fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out",
              bottomNavVisible ? "translate-y-0" : "translate-y-[120%]"
            )}
          >
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

      {/* GLOBAL FULLSCREEN IMAGE MODAL (Centering fix) */}
      <AnimatePresence>
        {expandedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImageUrl(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md cursor-zoom-out h-[100dvh] w-full"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="relative max-w-fit max-h-fit"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpandedImageUrl(null);
                }}
                className="absolute top-4 right-4 sm:-top-4 sm:-right-14 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md z-[10000] border border-white/10 mobile-touch-feedback"
                aria-label="Cerrar imagen"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={expandedImageUrl}
                alt="Expanded view"
                className="max-w-[95vw] max-h-[85vh] sm:max-h-[90vh] w-auto h-auto object-contain rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] cursor-default border border-white/5 select-none"
                onContextMenu={(e) => e.preventDefault()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Floating Chat (Desktop only) */}
      {showNav && <FloatingChat />}

      {/* Mobile-only tools */}
      <MobileStatusBar />
      <MobileOfflineBanner />
    </div>
  );
}
