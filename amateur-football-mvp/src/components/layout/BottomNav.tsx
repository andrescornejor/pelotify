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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[440px] lg:hidden">
      <nav
        className={cn(
          'relative overflow-hidden rounded-[2.5rem] transition-all duration-500',
          performanceMode
            ? 'bg-surface border border-border shadow-lg'
            : 'glass-premium bg-background/40 backdrop-blur-3xl border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]'
        )}
      >
        {/* Interior glow layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="flex justify-around items-center h-[76px] px-3 relative z-10">
          {NAV_ITEMS.map(({ href, icon: Icon, label, isPrimary }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href) ||
                  (href === '/profile/me' && pathname.startsWith('/profile'));

            const hasUnread = label === 'Mensajes' && unreadCount > 0;

            if (isPrimary) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex flex-col items-center justify-center p-1"
                >
                  {/* Outer Pulsing Aura */}
                  {!performanceMode && (
                    <div
                      className="absolute inset-0 rounded-[1.8rem] border-2 border-primary/20"
                      style={{ animation: 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                    />
                  )}
                  <motion.div
                    whileTap={performanceMode ? {} : { scale: 0.9, y: -4 }}
                    whileHover={performanceMode ? {} : { scale: 1.05 }}
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10 border border-white/20 shadow-2xl',
                      isActive ? 'bg-primary text-background' : 'bg-primary text-background'
                    )}
                    style={{
                      boxShadow: isActive
                        ? '0 0 30px rgba(44, 252, 125, 0.5), inset 0 2px 2px rgba(255,255,255,0.5)'
                        : '0 8px 16px rgba(44, 252, 125, 0.2)',
                    }}
                  >
                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-2 group"
              >
                {/* Active Soft Light BG */}
                {isActive && !performanceMode && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-x-2 inset-y-2 rounded-2xl bg-primary/10 border border-primary/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}

                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-500',
                      isActive ? 'scale-110 text-primary drop-shadow-[0_0_8px_rgba(44,252,125,0.5)]' : 'text-foreground/30 group-hover:text-foreground/60'
                    )}
                    strokeWidth={isActive ? 2.8 : 2}
                  />

                  {/* Unread indicator with glow */}
                  {hasUnread && !isActive && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-background shadow-lg bg-primary animate-bounce shadow-[0_0_10px_rgba(44,252,125,0.6)]"
                    />
                  )}

                  {/* Active indicator bar */}
                  {isActive && !performanceMode && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>

                <span
                  className={cn(
                    'text-[9px] font-black uppercase tracking-[0.2em] mt-2 transition-all duration-500',
                    isActive ? 'text-primary italic scale-105' : 'text-foreground/25 group-hover:text-foreground/45'
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
