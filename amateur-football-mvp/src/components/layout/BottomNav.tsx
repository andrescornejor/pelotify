'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  User2, 
  Flame, 
  MapPin, 
  Search,
  Trophy,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadMessagesCount } from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * REDESIGNED BOTTOM NAV
 * Aesthetics: Floating Island Dock with Glassmorphism and Cinematic Glow
 * Layout: 5 Core Utilities
 */

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { performanceMode } = useSettings();
  const [unreadCount, setUnreadCount] = useState(0);

  // Define the core navigation architecture
  const navItems = useMemo(() => [
    { 
      label: 'INICIO', 
      href: '/', 
      icon: Home,
      activeColor: '#2cfc7d'
    },
    { 
      label: 'EXPLORAR', 
      href: '/search', 
      icon: Search,
      activeColor: '#60a5fa' 
    },
    { 
      label: 'ARMAR', 
      href: '/create', 
      icon: Plus, 
      isPrimary: true,
      activeColor: '#2cfc7d'
    },
    { 
      label: 'FUTTOK', 
      href: '/highlights', 
      icon: Flame,
      activeColor: '#f59e0b'
    },
    { 
      label: 'PERFIL', 
      href: '/profile/me', 
      icon: User2,
      activeColor: '#a855f7'
    }
  ], []);

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
      .channel('unread-nav-messages')
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
          'relative px-2 py-2 rounded-[2.5rem] border transition-all duration-700 h-[88px] flex items-center',
          performanceMode 
            ? 'bg-surface border-border shadow-xl' 
            : 'glass-premium shadow-[0_35px_80px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.05)] border-white/10 backdrop-blur-[45px]'
        )}
      >
        {/* Cinematic glow effects */}
        {!performanceMode && (
          <div className="absolute inset-x-12 -top-4 h-8 bg-primary/20 blur-[40px] rounded-full animate-pulse-slow opacity-40 pointer-events-none" />
        )}

        <div className="relative z-10 flex items-center justify-between w-full h-full px-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href) || (item.href === '/profile/me' && pathname.startsWith('/profile'));
            
            const Icon = item.icon;

            if (item.isPrimary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center justify-center px-1"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.9, y: 3 }}
                    className={cn(
                      "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative z-20 group",
                      "bg-gradient-to-br from-primary to-primary-dark"
                    )}
                    style={{
                      boxShadow: !performanceMode 
                        ? `0 15px 35px rgba(44, 252, 125, 0.4), inset 0 2px 4px rgba(255,255,255,0.5)`
                        : 'none'
                    }}
                  >
                    <Icon className="w-8 h-8 text-black stroke-[3.5]" />
                    
                    {/* Ring animation */}
                    {!performanceMode && (
                      <div className="absolute inset-[-4px] rounded-[2.2rem] border-2 border-primary/30 animate-ping opacity-20 pointer-events-none" />
                    )}
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex-1 flex flex-col items-center justify-center h-full group py-1"
              >
                {/* Active Indicator Bar (Top) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-line"
                      className="absolute -top-1 w-6 h-1 rounded-full bg-primary"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      style={{ boxShadow: `0 0 15px ${item.activeColor}` }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative">
                  <motion.div
                    animate={isActive ? { y: -3, scale: 1.15 } : { y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <Icon 
                      className={cn(
                        "w-5 h-5 transition-all duration-500",
                        isActive 
                          ? "text-primary drop-shadow-[0_0_12px_rgba(44,252,125,0.6)]" 
                          : "text-foreground/30 group-hover:text-foreground/70"
                      )}
                      strokeWidth={isActive ? 2.8 : 2}
                    />
                  </motion.div>

                  {/* Messages Badge */}
                  {item.label === 'PERFIL' && unreadCount > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-background shadow-lg animate-bounce" />
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.1em] mt-2 transition-all duration-500 font-kanit italic leading-none",
                    isActive ? "text-primary opacity-100" : "text-foreground/20 opacity-0 group-hover:opacity-100 group-hover:text-foreground/40"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
