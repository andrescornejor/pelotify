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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[440px] lg:hidden">
      <nav
        className={cn(
          'relative overflow-hidden rounded-[2.5rem] border-t border-x border-white/10 transition-all duration-500 will-change-transform',
          performanceMode
            ? 'bg-surface shadow-2xl'
            : 'bg-[#050508]/80 backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.8)]'
        )}
      >
        {/* Glow ambient inside nav */}
        {!performanceMode && (
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[60px] rounded-full" />
          </div>
        )}

        <div className="flex justify-between items-center h-[82px] px-4 relative z-10">
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
                  className="relative flex flex-col items-center justify-center -mt-8"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      'w-15 h-15 rounded-3xl flex items-center justify-center transition-all duration-500 relative z-20 overflow-hidden border-2 border-primary/30',
                      isActive ? 'bg-primary text-background' : 'bg-[#08080a] text-primary'
                    )}
                    style={{
                      boxShadow: isActive 
                        ? '0 12px 32px rgba(85, 250, 134, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.4)' 
                        : '0 8px 24px rgba(0, 0, 0, 0.6)'
                    }}
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-30" />
                     <Icon className="w-7 h-7 relative z-10" strokeWidth={isActive ? 3 : 2.5} />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className="relative flex-1 flex flex-col items-center justify-center h-full group py-0.5"
              >
                <div className="relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300">
                  <div className={cn(
                    "relative transition-all duration-500",
                    isActive ? "scale-110 -translate-y-0.5" : "text-foreground/30 group-hover:text-foreground/60"
                  )}>
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-primary' : 'inherit'
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    {isActive && !performanceMode && (
                      <motion.div 
                        layoutId="nav-active-glow"
                        className="absolute inset-0 bg-primary/20 blur-lg rounded-full -z-10"
                      />
                    )}
                  </div>
                  
                  <span
                    className={cn(
                      'text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-400',
                      isActive ? 'text-primary' : 'text-foreground/25 font-bold'
                    )}
                  >
                    {label}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-line"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(85,250,134,1)]"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
