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
  LayoutGrid,
  MessageSquare
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
      label: 'CHATS', 
      href: '/messages', 
      icon: MessageSquare,
      activeColor: '#a855f7',
      isChat: true
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

    // Clear unread if on messages
    if (pathname === '/messages') {
      setUnreadCount(0);
    }

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px] lg:hidden">
      <nav
        className={cn(
          'relative px-1 rounded-[2.5rem] border transition-all duration-700 h-[80px] flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
          performanceMode 
            ? 'bg-surface border-border' 
            : 'glass-premium border-white/10 backdrop-blur-[30px]'
        )}
      >
        {/* Cinematic glow effects */}
        {!performanceMode && (
          <div className="absolute inset-x-12 -top-2 h-4 bg-primary/20 blur-[30px] rounded-full animate-pulse-slow opacity-60 pointer-events-none" />
        )}

        <div className="relative z-10 grid grid-cols-5 w-full h-full items-center">
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
                  className="flex items-center justify-center h-full relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.85, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl relative z-20 group overflow-hidden",
                      "bg-gradient-to-br from-primary via-[#3dfc8d] to-primary-dark"
                    )}
                  >
                    {/* Inner highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
                    
                    <Icon className="w-8 h-8 text-black stroke-[3] relative z-10" />
                    
                    {/* Ring animation */}
                    {!performanceMode && (
                      <div className="absolute inset-0 rounded-2xl border border-white/40 opacity-50" />
                    )}
                  </motion.div>
                  
                  {/* Outer glow for primary */}
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center h-full group"
              >
                <motion.div
                  className="flex flex-col items-center justify-center pt-1"
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <div className="relative flex items-center justify-center mb-1">
                    <motion.div
                      animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                        <Icon 
                          className={cn(
                            "w-5 h-5 transition-all duration-500",
                            isActive 
                              ? "text-primary drop-shadow-[0_0_8px_rgba(44,252,125,0.4)]" 
                              : "text-foreground/40 group-hover:text-foreground/70"
                          )}
                          strokeWidth={isActive ? 2.5 : 2}
                        />

                        {/* Unread badge for Chat */}
                        {item.isChat && unreadCount > 0 && !isActive && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border border-background flex items-center justify-center"
                          >
                            <span className="text-[7px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                          </motion.span>
                        )}
                      </motion.div>
    
                    {/* Active Background Pill (Subtle) */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 -m-2 bg-primary/5 rounded-full blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>

                  <span
                    className={cn(
                      "text-[9px] font-bold tracking-[0.05em] transition-all duration-500 font-outfit uppercase",
                      isActive ? "text-primary/90 opacity-100" : "text-foreground/30 opacity-60 group-hover:opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                </motion.div>

                {/* Active Indicator (Bottom Dot) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-dot"
                      className="absolute bottom-2 w-1 h-1 rounded-full bg-primary"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      style={{ boxShadow: `0 0 10px ${item.activeColor}` }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
