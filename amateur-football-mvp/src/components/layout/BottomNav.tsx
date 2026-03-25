'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, User, MessageSquare, Flame, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/highlights', icon: Flame, label: 'FutTok' },
  { href: '/create', icon: PlusCircle, label: 'Crear', isPrimary: true },
  { href: '/scouting', icon: Target, label: 'Mercado' },
  { href: '/profile/me', icon: User, label: 'Perfil' },
];

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadMessagesCount } from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/contexts/SettingsContext';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { performanceMode } = useSettings();
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await getUnreadMessagesCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    updateUnreadCount();

    const channel = supabase
      .channel('unread-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, () =>
        updateUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, pathname]);

  if (['/login', '/register', '/update-password'].includes(pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[460px] lg:hidden pointer-events-none">
      <nav
        className={cn(
          'relative overflow-hidden rounded-[2.8rem] border transition-all duration-700 will-change-transform shadow-[0_30px_100px_rgba(0,0,0,0.5)] pointer-events-auto group/nav',
          performanceMode
            ? 'bg-surface border-border'
            : 'glass-premium bg-background/40 backdrop-blur-3xl border-white/5 active:scale-[0.98]'
        )}
      >
        {/* Cinematic Scan Line */}
        {!performanceMode && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-[-30deg] pointer-events-none"
          />
        )}

        <div className="flex justify-around items-center h-[82px] px-4 relative z-10">
          {NAV_ITEMS.map(({ href, icon: Icon, label, isPrimary }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href) ||
                  (href === '/profile/me' && pathname.startsWith('/profile'));

            if (isPrimary) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex flex-col items-center justify-center -translate-y-1.5 px-2"
                >
                  <motion.div
                    whileTap={{ scale: 0.9, y: 2 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className={cn(
                      'w-16 h-16 rounded-[2.2rem] flex items-center justify-center transition-all duration-700 relative z-10 shadow-2xl overflow-hidden group/primary',
                      isActive 
                        ? 'bg-primary text-black' 
                        : 'bg-foreground/[0.03] text-primary border border-primary/40'
                    )}
                    style={{
                      boxShadow: isActive 
                        ? '0 20px 40px rgba(var(--primary-rgb), 0.4), inset 0 2px 6px rgba(255,255,255,0.4)' 
                        : '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)'
                    }}
                  >
                    {!performanceMode && isActive && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent animate-shimmer opacity-40" />
                    )}
                    <Icon className={cn("w-8 h-8 transition-transform duration-700", isActive && "group-hover/primary:scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                  
                  <span className={cn(
                    "text-[9px] font-[1000] uppercase tracking-[0.3em] mt-2.5 transition-all duration-500 font-kanit italic",
                    isActive ? "text-primary scale-110" : "text-foreground/20 opacity-40 group-hover/nav:opacity-60"
                  )}>
                    {label}
                  </span>
                  
                  {isActive && !performanceMode && (
                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-4 group/item"
              >
                <div className="relative">
                  <motion.div
                    animate={isActive ? { scale: 1.25, y: -4 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                    className={cn(
                      'transition-all duration-500 relative z-10',
                      isActive ? 'text-primary' : 'text-foreground/20 group-hover/item:text-foreground/60'
                    )}
                  >
                    <Icon className="w-5.5 h-5.5" strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  {/* Active Indicator Glow */}
                  <AnimatePresence>
                    {isActive && !performanceMode && (
                      <motion.div
                        layoutId="nav-indicator-glow"
                        className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0 }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <span
                  className={cn(
                    'text-[9px] font-[1000] uppercase tracking-[0.3em] mt-3 transition-all duration-500 font-kanit italic',
                    isActive ? 'text-primary opacity-100' : 'text-foreground/20 group-hover/item:text-foreground/40'
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
