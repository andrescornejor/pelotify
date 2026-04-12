'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Home,
  Search,
  Users,
  Shield,
  PlusCircle,
  User2,
  MessageSquare,
  Play,
  Star,
  Globe,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingRequestsCount } from '@/lib/friends';
import { getMatchInvitationsCount } from '@/lib/matches';
import { getPendingJoinRequestsCountForCaptain, getTeamInvitationsCount } from '@/lib/teams';
import { getPendingChallengesCountForCaptain } from '@/lib/teamChallenges';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { getUnreadMessagesCount } from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/contexts/SettingsContext';

const DESKTOP_NAV = [
  { href: '/highlights', icon: Play, label: 'FutTok' },
  { href: '/feed', icon: Globe, label: '3erTiempo' },
  { href: '/search', icon: Search, label: 'Buscar' },
  { href: '/friends', icon: Users, label: 'Amigos', id: 'friends' },
  { href: '/messages', icon: MessageSquare, label: 'Mensajes' },
  { href: '/teams', icon: Shield, label: 'Equipos' },
];

export const TopHeader = memo(function TopHeader() {
  const pathname = usePathname();
  const { toggleSidebar, isNotificationsOpen, setNotificationsOpen } = useSidebar();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifCount, setNotifCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const lastPathname = useRef(pathname);
  const baseCurrent = pathname.split('?')[0];

  const updateCount = async () => {
    if (!user) return;
    try {
      const [f, m, t, ti, c, tc] = await Promise.all([
        getPendingRequestsCount(user.id),
        getMatchInvitationsCount(user.id),
        getPendingJoinRequestsCountForCaptain(user.id),
        getTeamInvitationsCount(user.id),
        getUnreadMessagesCount(user.id),
        getPendingChallengesCountForCaptain(user.id),
      ]);
      setFriendsCount(f || 0);
      
      const chatTotal = baseCurrent === '/messages' ? 0 : (c || 0);
      setUnreadChatCount(chatTotal);
      
      setNotifCount((f || 0) + (m || 0) + (t || 0) + (ti || 0) + (tc || 0));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Only fetch if initial or significant path change (not just query params)
    const baseLast = lastPathname.current.split('?')[0];
    
    if (baseCurrent !== baseLast || notifCount === 0) {
      updateCount();
      lastPathname.current = pathname;
    }

    // Clear unread if on messages
    if (baseCurrent === '/messages') {
      setUnreadChatCount(0);
    }

    const channel = supabase
      .channel('header-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          updateCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, pathname]);

  const { performanceMode } = useSettings();

  if (['/login', '/register'].includes(pathname)) {
    return null;
  }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-[60] pt-[calc(0.75rem+env(safe-area-inset-top,0px))] sm:pt-6 lg:pt-4 px-3 sm:px-5 lg:px-10 xl:px-16 pointer-events-none">
        <div className="max-w-full mx-auto w-full pointer-events-auto">
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.05 }}
            className="overflow-hidden rounded-[1.5rem] lg:rounded-[2rem]"
            style={{
              background: performanceMode
                ? 'var(--surface-elevated)'
                : 'rgba(var(--background-rgb), 0.7)',
              backdropFilter: performanceMode ? 'none' : 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: performanceMode ? 'none' : 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 'var(--shadow-premium)',
            }}
          >
            {/* Background subtle light beam */}
            <div className="absolute top-0 left-[-10%] w-[40%] h-full bg-gradient-to-r from-primary/10 via-transparent to-transparent -skew-x-12 pointer-events-none" />

            <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[76px] sm:h-[84px] lg:h-[80px] px-4 sm:px-6 lg:px-8 w-full relative">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
              {/* Left: Menu + Logo */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-3 xl:gap-6 min-w-0">
                <motion.button
                  onClick={toggleSidebar}
                  whileTap={{ scale: 0.92 }}
                  className="relative w-[64px] h-12 lg:w-11 lg:h-11 flex items-center justify-center rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-foreground/[0.06] transition-all group"
                  aria-label="Menu"
                >
                  <div className="flex flex-col gap-[5px] w-[22px] items-center">
                    <motion.span
                      animate={
                        useSidebar().isOpen
                          ? { rotate: 45, y: 7.5, width: '100%' }
                          : { rotate: 0, y: 0, width: '100%' }
                      }
                      className="h-[2px] bg-foreground/80 rounded-full block origin-center transition-all duration-300"
                    />
                    <motion.span
                      animate={useSidebar().isOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
                      className="h-[2.2px] w-[70%] bg-primary rounded-full block transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    />
                    <motion.span
                      animate={
                        useSidebar().isOpen
                          ? { rotate: -45, y: -7.5, width: '100%' }
                          : { rotate: 0, y: 0, width: '100%' }
                      }
                      className="h-[2px] bg-foreground/80 rounded-full block origin-center transition-all duration-300"
                    />
                  </div>
                </motion.button>

                <Link
                  href="/"
                  className="flex items-center gap-3 select-none hover:opacity-90 transition-all group/logo"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16 flex items-center justify-center relative transition-transform duration-500 group-hover/logo:scale-110 shrink-0">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-primary/20 blur-[15px] rounded-full opacity-60" />
                    <img
                      src="/logo_pelotify.png"
                      alt="Logo"
                      className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center">
                      <span className="hidden min-[450px]:flex text-[22px] sm:text-[28px] lg:text-[24px] 2xl:text-[34px] font-[900] tracking-[-0.03em] font-display uppercase italic leading-none items-center">
                        <span className="text-foreground">PELOTI</span>
                        <span
                          className="bg-clip-text text-transparent italic"
                          style={{
                            backgroundImage:
                              'linear-gradient(135deg, #10ef74 0%, #0dbb5b 100%)',
                            filter: 'drop-shadow(0 0 15px rgba(var(--primary-rgb),0.3))',
                          }}
                        >
                          FY
                        </span>
                      </span>
                    </div>
                    <span className="hidden sm:block lg:hidden 2xl:block text-[8px] lg:text-[10px] font-black uppercase italic tracking-[0.3em] text-primary/40 leading-none mt-0.5 transition-all duration-500 font-display">
                      DOMINÁ <span className="text-foreground/20">EL POTRERO</span>
                    </span>
                  </div>
                </Link>
              </div>

              {/* Middle: Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
                {DESKTOP_NAV.map((item) => {
                  const cleanPath = pathname.replace(/\/$/, '') || '/';
                  const cleanHref = item.href.replace(/\/$/, '') || '/';
                  const isActive =
                    cleanPath === cleanHref ||
                    (cleanHref !== '/' && (cleanPath + '/').startsWith(cleanHref + '/'));
                  const hasBadge =
                    (item.id === 'friends' && friendsCount > 0 && !isActive);

                  return (
                    <Link key={item.href} href={item.href} className="relative">
                      <motion.div
                        whileHover={{ y: -1 }}
                        className={cn(
                          'relative px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 group overflow-hidden',
                          isActive
                            ? 'text-primary'
                            : 'text-foreground/40 hover:text-foreground/70 hover:bg-white/[0.04]'
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="nav-glow"
                            className="absolute inset-0 rounded-xl bg-primary/5"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          >
                             <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(16,239,116,0.6)]" />
                          </motion.div>
                        )}

                        <item.icon
                          className={cn(
                            'w-4 h-4 transition-all duration-300',
                            isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,239,116,0.5)]' : 'group-hover:scale-110'
                          )}
                          strokeWidth={isActive ? 3 : 2}
                        />

                        <span
                          className={cn(
                            'hidden xl:block text-[11px] font-black uppercase tracking-[0.05em] font-display',
                            isActive ? 'opacity-100' : 'opacity-80'
                          )}
                        >
                          {item.label}
                        </span>

                        {hasBadge && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,239,116,0.8)] ml-0.5" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>
              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-4 lg:gap-2.5 xl:gap-4 col-start-3">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  {/* Theme Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.88, rotate: 20 }}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-12 h-12 lg:w-11 lg:h-11 flex items-center justify-center rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-foreground/40 hover:text-foreground/70 transition-all border border-white/5"
                    title="Cambiar Tema"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={theme}
                        initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.5, rotate: 30, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {theme === 'dark' ? (
                          <Sun className="w-4 h-4 sm:w-[1.1rem] sm:h-[1.1rem]" />
                        ) : (
                          <Moon className="w-4 h-4 sm:w-[1.1rem] sm:h-[1.1rem]" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                  {/* Notification Bell */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => {
                      if (!user) {
                        window.location.href = '/login';
                        return;
                      }
                      setNotificationsOpen(true);
                      setNotifCount(0);
                    }}
                    className="relative w-12 h-12 lg:w-11 lg:h-11 flex items-center justify-center rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-foreground/40 hover:text-foreground/70 transition-all border border-white/5"
                  >
                    <Bell className="w-4 h-4 sm:w-[1.1rem] sm:h-[1.1rem]" />
                    <AnimatePresence>
                      {notifCount > 0 && (
                        <motion.span
                          initial={{ scale: 0, y: 4 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] border-2 border-background"
                        >
                          {notifCount > 9 ? '9+' : notifCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
 
                   {/* Profile Avatar or Login Button */}
                  <Link href={user ? "/profile/me" : "/login"}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "w-12 h-12 lg:w-11 lg:h-11 rounded-2xl p-0.5 transition-all flex items-center justify-center overflow-hidden",
                        user 
                          ? "bg-white/[0.04] border border-white/10 hover:border-primary/40 shadow-lg" 
                          : "bg-primary text-black font-black text-[10px] uppercase shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
                      )}
                    >
                      {user ? (
                        <div className="w-full h-full rounded-[0.9rem] overflow-hidden bg-primary/10 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt="Perfil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User2 className="w-5 h-5 text-primary/60" />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center leading-none gap-0.5">
                          <User2 className="w-4 h-4 stroke-[3]" />
                          <span className="text-[7.5px] font-black tracking-tighter">ENTRAR</span>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </header>
    </>
  );
});
