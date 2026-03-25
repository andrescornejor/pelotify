'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Sidebar, SidebarContent } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isNotificationsOpen, setNotificationsOpen } = useSidebar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on route change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/onboarding' ||
    pathname === '/team-builder';
  
  const isHighlightsPage = pathname === '/highlights';
  const showNav = !isAuthPage && !!user && !isHighlightsPage;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[100dvh] w-full relative bg-background overflow-hidden">
      {/* Premium Aurora Background - Dynamic Expert Vibe */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[140px] animate-pulse opacity-40 dark:opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[140px] animate-pulse opacity-30 dark:opacity-10" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[20%] right-[-15%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse opacity-20 dark:opacity-10" style={{ animationDelay: '5s' }} />
        
        {/* Subtle Noise Texture for Premium Feel */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <div
        ref={scrollContainerRef}
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out max-h-[100dvh]',
          isHighlightsPage ? 'overflow-hidden' : 'overflow-y-auto'
        )}
      >
        {showNav && <TopHeader />}

        <main
          className={cn(
            'flex-1 w-full relative',
            showNav
              ? pathname.startsWith('/match')
                ? 'pb-24 lg:pb-0'
                : 'pt-32 lg:pt-24 pb-24 lg:pb-0'
              : ''
          )}
        >
          {children}
        </main>

        {/* Mobile Navigation */}
        {showNav && (
          <div className="lg:hidden">
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
    </div>
  );
}
