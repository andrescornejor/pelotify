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

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const showNav = !isAuthPage && !!user;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[100dvh] w-full relative bg-background">


      {/* ── Main content area (offset by sidebar on lg+) ── */}
      <div 
        ref={scrollContainerRef}
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-500 overflow-y-auto max-h-[100dvh]',
        )}
      >
        {showNav && <TopHeader />}

        <main className={cn(
          'flex-1 w-full relative',
          showNav
            ? pathname.startsWith('/match/')
              ? 'pb-24 lg:pb-12'
              : 'pt-24 lg:pt-24 pb-24 lg:pb-12'
            : ''
        )}>
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
