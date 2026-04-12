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
      <header className="fixed top-0 left-0 right-0 z-[60] pt-[calc(0.5rem+env(safe-area-inset-top,0px))] sm:pt-3 lg:pt-3 px-2 sm:px-4 lg:px-8 xl:px-14 pointer-events-none">
        <div className="max-w-full mx-auto w-full pointer-events-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28, delay: 0.05 }}
            className="overflow-hidden rounded-2xl lg:rounded-[1.5rem] noise-texture"
            style={{
              background: performanceMode
                ? 'var(--surface-elevated)'
                : 'rgba(var(--foreground-rgb), 0.06)',
              backdropFilter: performanceMode ? 'none' : 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: performanceMode ? 'none' : 'blur(24px) saturate(180%)',
              border: '1px solid rgba(var(--foreground-rgb), 0.08)',
              boxShadow: performanceMode
                ? '0 8px 24px rgba(0,0,0,0.15)'
                : '0 2px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Subtle accent line at top */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none z-10" />

            <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[64px] sm:h-[68px] lg:h-[64px] px-3 sm:px-5 lg:px-6 w-full relative z-20">
              {/* Left: Menu + Logo */}
              <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-3 xl:gap-5 min-w-0">
                <motion.button
                  onClick={toggleSidebar}
                  whileTap={{ scale: 0.92 }}
                  className="relative w-11 h-11 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-foreground/[0.05] transition-all group"
                  aria-label="Menu"
                >
                  <div className="flex flex-col gap-[4px] w-[18px] items-center">
                    <motion.span
                      animate={
                        useSidebar().isOpen
                          ? { rotate: 45, y: 6.5, width: '100%' }
                          : { rotate: 0, y: 0, width: '100%' }
                      }
                      className="h-[1.5px] bg-foreground/70 rounded-full block origin-center transition-all duration-300"
                    />
                    <motion.span
                      animate={useSidebar().isOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
                      className="h-[1.5px] w-[70%] bg-primary rounded-full block transition-all duration-300"
                    />
                    <motion.span
                      animate={
                        useSidebar().isOpen
                          ? { rotate: -45, y: -6.5, width: '100%' }
                          : { rotate: 0, y: 0, width: '100%' }
                      }
                      className="h-[1.5px] bg-foreground/70 rounded-full block origin-center transition-all duration-300"
                    />
                  </div>
                </motion.button>

                <Link
                  href="/"
                  className="flex items-center gap-2 select-none hover:opacity-90 transition-all group/logo"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-11 lg:h-11 xl:w-14 xl:h-14 flex items-center justify-center relative transition-transform duration-500 group-hover/logo:scale-105 shrink-0">
                    {!performanceMode && (
                      <div className="absolute inset-0 bg-primary/10 blur-[14px] rounded-full opacity-40 shrink-0" />
                    )}
                    <img
                      src="/logo_pelotify.png"
                      alt="Logo"
                      className="w-full h-full object-contain relative z-10"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0">
                    <span className="hidden min-[400px]:flex text-[18px] sm:text-[20px] lg:text-[20px] 2xl:text-[26px] font-[900] tracking-[-0.03em] font-kanit uppercase italic leading-tight items-center gap-0 pr-3">
                      <span className="text-foreground">PELOTI</span>
                      <span
                        className="bg-clip-text text-transparent px-1 -mx-1"
                        style={{
                          backgroundImage:
                            'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 40%, #1db95a 100%)',
                        }}
                      >
                        FY
                      </span>
                    </span>
                    <span className="hidden 2xl:block text-[7px] font-black uppercase tracking-[0.3em] text-foreground/25 leading-none font-kanit">
                      DOMINÁ <span className="text-primary/50">EL POTRERO</span>
                    </span>
                  </div>
                </Link>
              </div>

              {/* Middle: Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-0.5 bg-foreground/[0.03] p-1 rounded-xl border border-foreground/[0.04]">
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
                          'relative px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 group',
                          isActive
                            ? 'text-primary'
                            : 'text-foreground/35 hover:text-foreground/60 hover:bg-foreground/[0.04]'
                        )}
                      >
                        {isActive && (
                          <>
                            <motion.div
                              layoutId="nav-glow"
                              className="absolute inset-0 rounded-lg bg-primary/[0.08]"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                            />
                            {/* Active underline indicator */}
                            <motion.div
                              layoutId="nav-underline"
                              className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                              style={{ boxShadow: '0 0 8px rgba(44,252,125,0.4)' }}
                            />
                          </>
                        )}

                        <item.icon
                          className={cn(
                            'w-4 h-4 transition-transform duration-300 relative z-10',
                            isActive ? 'scale-105' : 'group-hover:scale-110'
                          )}
                          strokeWidth={isActive ? 2.5 : 1.8}
                        />

                        <span
                          className={cn(
                            'hidden 2xl:block text-[11px] font-bold uppercase tracking-wider relative z-10',
                            isActive ? 'opacity-100' : 'opacity-70'
                          )}
                        >
                          {item.label}
                        </span>

                        {hasBadge && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(44,252,125,0.6)] ml-0.5 relative z-10" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-1 sm:gap-2 lg:gap-1.5 xl:gap-2 col-start-3">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {/* Theme Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.9, rotate: 15 }}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-10 h-10 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.07] text-foreground/40 hover:text-foreground/60 transition-all border border-foreground/[0.04]"
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
                          <Sun className="w-[15px] h-[15px]" />
                        ) : (
                          <Moon className="w-[15px] h-[15px]" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>

                  {/* Notification Bell */}
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (!user) {
                        window.location.href = '/login';
                        return;
                      }
                      setNotificationsOpen(true);
                      setNotifCount(0);
                    }}
                    className="relative w-10 h-10 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.07] text-foreground/40 hover:text-foreground/60 transition-all border border-foreground/[0.04]"
                  >
                    <Bell className="w-[15px] h-[15px]" />
                    <AnimatePresence>
                      {notifCount > 0 && (
                        <motion.span
                          initial={{ scale: 0, y: 4 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-background text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background"
                          style={{ boxShadow: '0 0 10px rgba(44,252,125,0.4)' }}
                        >
                          {notifCount > 9 ? '9+' : notifCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Profile Avatar or Login Button */}
                  <Link href={user ? "/profile/me" : "/login"}>
                    <motion.div
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.92 }}
                      className={cn(
                        "w-10 h-10 lg:w-9 lg:h-9 rounded-xl p-0.5 transition-all flex items-center justify-center",
                        user 
                          ? "bg-foreground/[0.03] border border-foreground/[0.06] hover:border-primary/25" 
                          : "bg-primary text-background font-black text-[9px] uppercase shadow-[0_0_16px_rgba(44,252,125,0.3)]"
                      )}
                    >
                      {user ? (
                        <div className="w-full h-full rounded-[0.6rem] overflow-hidden bg-primary/5 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt="Perfil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User2 className="w-4 h-4 text-primary/50" />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center leading-none gap-0.5">
                          <User2 className="w-3.5 h-3.5" />
                          <span className="text-[6px] font-black tracking-tighter">ENTRAR</span>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </header>
    </>
  );
});
