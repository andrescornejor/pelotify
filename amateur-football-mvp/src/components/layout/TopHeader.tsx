'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  Users,
  Shield,
  User2,
  MessageSquare,
  Play,
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

export const TopHeader = memo(function TopHeader({ isVisible = true }: { isVisible?: boolean }) {
  const pathname = usePathname();
  const { toggleSidebar, isOpen: isSidebarOpen, setNotificationsOpen } = useSidebar();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifCount, setNotifCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const lastPathname = useRef(pathname);
  const baseCurrent = pathname.split('?')[0];

  const updateCount = useCallback(async () => {
    if (!user) return;
    try {
      const [f, m, t, ti, , tc] = await Promise.all([
        getPendingRequestsCount(user.id),
        getMatchInvitationsCount(user.id),
        getPendingJoinRequestsCountForCaptain(user.id),
        getTeamInvitationsCount(user.id),
        getUnreadMessagesCount(user.id),
        getPendingChallengesCountForCaptain(user.id),
      ]);
      setFriendsCount(f || 0);
      
      setNotifCount((f || 0) + (m || 0) + (t || 0) + (ti || 0) + (tc || 0));
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const baseLast = lastPathname.current.split('?')[0];
    if (baseCurrent !== baseLast || notifCount === 0) {
      queueMicrotask(() => {
        void updateCount();
      });
      lastPathname.current = pathname;
    }

  }, [user, pathname, baseCurrent, updateCount, notifCount]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`header-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        updateCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, updateCount]);

  const { performanceMode } = useSettings();

  if (['/login', '/register'].includes(pathname)) {
    return null;
  }

  return (
    <>
      <header className={cn(
        "z-[60] w-full",
        "pt-[env(safe-area-inset-top,0.4rem)] pb-2 sm:pt-6 lg:pt-4 px-3 sm:px-5 lg:px-10 xl:px-16",
        "sticky top-0 lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:pb-0",
        "bg-background border-b border-foreground/[0.06] shadow-sm lg:bg-transparent lg:border-transparent lg:shadow-none",
        "pointer-events-auto lg:pointer-events-none transition-transform duration-300",
        !isVisible ? "-translate-y-[150%] lg:translate-y-0" : "translate-y-0"
      )}>
        <div className="max-w-full mx-auto w-full flex items-center justify-between lg:block relative z-10">
          
          {/* MOBILE MINIMAL ACTIONS (Inline with flow) */}
          <div className="lg:hidden flex items-center justify-between w-full pointer-events-none pb-0">
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              {/* Hamburger / Menu */}
              <motion.button
                onClick={toggleSidebar}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-xl border border-white/10 shadow-lg"
                aria-label="Menu"
              >
                <div className="flex flex-col gap-[4.5px] w-[20px] items-center">
                  <motion.span
                    animate={isSidebarOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                    className="h-[2px] w-full bg-foreground rounded-full block origin-center transition-all"
                  />
                  <motion.span
                    animate={isSidebarOpen ? { opacity: 0, x: -5 } : { opacity: 1, x: 0 }}
                    className="h-[2px] w-[70%] bg-primary rounded-full block transition-all"
                  />
                  <motion.span
                    animate={isSidebarOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                    className="h-[2px] w-full bg-foreground rounded-full block origin-center transition-all"
                  />
                </div>
              </motion.button>

              {/* Logo (Home Link) */}
              <Link href="/">
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <img src="/logo_pelotify.png" alt="Pelotify" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(44,252,125,0.4)]" />
                </motion.div>
              </Link>
            </div>

            {/* Right: Actions (Theme, Notifications, Profile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.88, rotate: 20 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/45 transition-all border border-foreground/[0.04]"
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
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Notification Bell */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  if (!user) {
                    window.location.href = '/login';
                    return;
                  }
                  setNotificationsOpen(true);
                  setNotifCount(0);
                }}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/45 transition-all border border-foreground/[0.04]"
              >
                <Bell className="w-4 h-4" />
                <AnimatePresence>
                  {notifCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, y: 4 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-primary text-background text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)] border-2 border-background"
                    >
                      {notifCount > 9 ? '9+' : notifCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Profile Avatar */}
              <Link href={user ? "/profile/me" : "/login"}>
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "w-10 h-10 rounded-full overflow-hidden transition-all flex items-center justify-center",
                    user 
                      ? "bg-foreground/[0.04] border border-foreground/[0.08]" 
                      : "bg-primary text-background font-black text-[9px] uppercase"
                  )}
                >
                  {user ? (
                    user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="Perfil"
                        className="w-full h-full object-cover scale-105"
                      />
                    ) : (
                      <User2 className="w-4 h-4 text-primary/60" />
                    )
                  ) : (
                    <div className="flex flex-col items-center leading-none gap-0.5">
                      <User2 className="w-3.5 h-3.5" />
                      <span className="text-[6px] font-black tracking-tighter">ENTRAR</span>
                    </div>
                  )}
                    className="h-[2px] w-full bg-foreground rounded-full block origin-center transition-all"
                  />
                </div>
              </motion.button>

              {/* Logo (Home Link) */}
              <Link href="/">
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <img src="/logo_pelotify.png" alt="Pelotify" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(44,252,125,0.4)]" />
                </motion.div>
              </Link>
            </div>

            {/* Right: Actions (Theme, Notifications, Profile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.88, rotate: 20 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/45 transition-all border border-foreground/[0.04]"
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
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Notification Bell */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  if (!user) {
                    window.location.href = '/login';
                    return;
                  }
                  setNotificationsOpen(true);
                  setNotifCount(0);
                }}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/45 transition-all border border-foreground/[0.04]"
              >
                <Bell className="w-4 h-4" />
                <AnimatePresence>
                  {notifCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, y: 4 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-primary text-background text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)] border-2 border-background"
                    >
                      {notifCount > 9 ? '9+' : notifCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Profile Avatar */}
              <Link href={user ? "/profile/me" : "/login"}>
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "w-10 h-10 rounded-full overflow-hidden transition-all flex items-center justify-center",
                    user 
                      ? "bg-foreground/[0.04] border border-foreground/[0.08]" 
                      : "bg-primary text-background font-black text-[9px] uppercase"
                  )}
                >
                  {user ? (
                    user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="Perfil"
                        className="w-full h-full object-cover scale-105"
                      />
                    ) : (
                      <User2 className="w-4 h-4 text-primary/60" />
                    )
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

          {/* DESKTOP HEADER (Sleek Floating Nav) */}
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.05 }}
            className="hidden lg:block w-full max-w-7xl mx-auto pointer-events-auto"
          >
            <div className={cn(
              "flex items-center justify-between h-[64px] px-6 rounded-full transition-all duration-300",
              performanceMode 
                ? "bg-surface-elevated border border-foreground/[0.05]" 
                : "bg-surface/40 backdrop-blur-xl border border-foreground/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            )}>
              {/* Left: Logo & Menu */}
              <div className="flex items-center gap-6">
                <motion.button
                  onClick={toggleSidebar}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex flex-col justify-center items-center gap-[4px] rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.08] border border-transparent hover:border-foreground/[0.05] transition-all"
                  aria-label="Menu"
                >
                  <motion.span animate={isSidebarOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="h-[2px] w-[18px] bg-foreground/80 rounded-full block origin-center transition-all" />
                  <motion.span animate={isSidebarOpen ? { opacity: 0, width: 0 } : { opacity: 1, width: '12px' }} className="h-[2px] bg-primary rounded-full block transition-all shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <motion.span animate={isSidebarOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="h-[2px] w-[18px] bg-foreground/80 rounded-full block origin-center transition-all" />
                </motion.button>

                <Link href="/" className="flex items-center gap-3 group/logo">
                  <div className="w-10 h-10 relative flex items-center justify-center transition-transform group-hover/logo:scale-110 duration-500">
                    <div className="absolute inset-0 bg-primary/20 blur-[15px] rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                    <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain relative z-10" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[20px] font-[900] tracking-tighter font-kanit uppercase italic leading-none flex items-center">
                      <span className="text-foreground">PELOTI</span>
                      <span className="text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.3)]">FY</span>
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground/40 leading-none mt-0.5">
                      DOMINÁ EL POTRERO
                    </span>
                  </div>
                </Link>
              </div>

              {/* Middle: Minimalist Nav */}
              <nav className="flex items-center gap-2">
                {DESKTOP_NAV.map((item) => {
                  const cleanPath = pathname.replace(/\/$/, '') || '/';
                  const cleanHref = item.href.replace(/\/$/, '') || '/';
                  const isActive = cleanPath === cleanHref || (cleanHref !== '/' && (cleanPath + '/').startsWith(cleanHref + '/'));
                  const hasBadge = (item.id === 'friends' && friendsCount > 0 && !isActive);

                  return (
                    <Link key={item.href} href={item.href} className="relative group">
                      <div className={cn(
                        "px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 text-[11px] font-bold uppercase tracking-widest",
                        isActive ? "text-primary" : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.04]"
                      )}>
                        {isActive && (
                          <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-full bg-primary/[0.08] border border-primary/20" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                        )}
                        <item.icon className={cn("w-3.5 h-3.5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="relative z-10 hidden xl:block">{item.label}</span>
                        {hasBadge && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/60 transition-all border border-transparent hover:border-foreground/[0.05]"
                >
                  <AnimatePresence mode="wait">
                    <motion.div key={theme} initial={{ scale: 0.5, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.5, rotate: 30, opacity: 0 }} transition={{ duration: 0.2 }}>
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!user) { window.location.href = '/login'; return; }
                    setNotificationsOpen(true);
                    setNotifCount(0);
                  }}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/60 transition-all border border-transparent hover:border-foreground/[0.05]"
                >
                  <Bell className="w-4 h-4" />
                  <AnimatePresence>
                    {notifCount > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute 1 top-0 right-0 min-w-[16px] h-[16px] bg-primary text-background text-[9px] font-black rounded-full flex items-center justify-center border-[2px] border-surface shadow-sm">
                        {notifCount > 9 ? '9+' : notifCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <Link href={user ? "/profile/me" : "/login"}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-10 h-10 rounded-full overflow-hidden flex items-center justify-center transition-all",
                      user ? "bg-surface-elevated border border-foreground/10 hover:border-primary/50" : "bg-primary text-background font-black text-[9px] uppercase shadow-lg"
                    )}
                  >
                    {user ? (
                      user.avatar_url ? <img src={user.avatar_url} alt="Perfil" className="w-full h-full object-cover" /> : <User2 className="w-4 h-4 text-primary/60" />
                    ) : (
                      <div className="flex flex-col items-center leading-none gap-0.5">
                        <User2 className="w-3 h-3" />
                        <span className="text-[6px] font-black tracking-tighter">ENTRAR</span>
                      </div>
                    )}
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

    </>
  );
});
