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
  Menu
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
      queueMicrotask(() => { void updateCount(); });
      lastPathname.current = pathname;
    }
  }, [user, pathname, baseCurrent, updateCount, notifCount]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`header-notifications-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${user.id}` }, updateCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, updateCount]);

  if (['/login', '/register'].includes(pathname)) return null;

  return (
    <header className={cn(
      "z-[60] w-full fixed top-0 left-0 right-0 transition-transform duration-500",
      !isVisible ? "-translate-y-full" : "translate-y-0"
    )}>
      {/* Absolute Gradient overlay for header visibility on mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-transparent lg:hidden pointer-events-none h-32" />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top,0.5rem)] lg:pt-6 relative z-10">
        
        {/* MOBILE HEADER - Minimal, Floating elements */}
        <div className="lg:hidden flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <motion.button onClick={toggleSidebar} whileTap={{ scale: 0.9 }} className="w-11 h-11 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-md border border-white/10 shadow-sm">
              <Menu className="w-5 h-5 text-foreground" />
            </motion.button>
            <Link href="/">
              <motion.div whileTap={{ scale: 0.95 }} className="w-9 h-9 flex items-center justify-center">
                <img src="/logo_pelotify.png" alt="Pelotify" className="w-full h-full object-contain" />
              </motion.div>
            </Link>
          </div>

          <div className="flex items-center gap-1 bg-background/50 backdrop-blur-md border border-white/10 p-1 rounded-full shadow-sm">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-9 h-9 flex items-center justify-center rounded-full text-foreground/80">
              {theme === 'dark' ? <Sun className="w-[1.1rem] h-[1.1rem]" /> : <Moon className="w-[1.1rem] h-[1.1rem]" />}
            </motion.button>

            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { if(!user) window.location.href='/login'; else { setNotificationsOpen(true); setNotifCount(0); } }} className="relative w-9 h-9 flex items-center justify-center rounded-full text-foreground/80">
              <Bell className="w-[1.1rem] h-[1.1rem]" />
              {notifCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
            </motion.button>

            <Link href={user ? "/profile/me" : "/login"}>
              <motion.div whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full overflow-hidden bg-foreground/5 border border-foreground/10 flex items-center justify-center ml-1">
                {user ? (
                  user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <User2 className="w-4 h-4 text-primary" />
                ) : (
                  <User2 className="w-4 h-4 text-foreground/60" />
                )}
              </motion.div>
            </Link>
          </div>
        </div>

        {/* DESKTOP HEADER - SLEEK FLOATING PILL */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="hidden lg:flex items-center justify-between h-[60px] px-3 bg-surface/40 backdrop-blur-[24px] border border-white/10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-[1000px] mx-auto transform-gpu"
        >
          {/* Left: Brand */}
          <div className="flex items-center gap-4 pl-3">
            <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-foreground/60 hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
            </motion.button>
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo_pelotify.png" alt="Logo" className="w-7 h-7 object-contain transition-transform group-hover:scale-110" />
              <span className="font-black tracking-[-0.02em] font-kanit uppercase italic text-[18px]">
                PELOTI<span className="text-primary">FY</span>
              </span>
            </Link>
          </div>

          {/* Middle: Navigation */}
          <nav className="flex items-center gap-1">
            {DESKTOP_NAV.map((item) => {
              const cleanPath = pathname.replace(/\/$/, '') || '/';
              const cleanHref = item.href.replace(/\/$/, '') || '/';
              const isActive = cleanPath === cleanHref || (cleanHref !== '/' && (cleanPath + '/').startsWith(cleanHref + '/'));

              return (
                <Link key={item.href} href={item.href} className="relative px-4 py-2 rounded-full group transition-colors">
                  {isActive && (
                    <motion.div layoutId="desktop-nav-pill" className="absolute inset-0 bg-foreground/5 rounded-full border border-foreground/5" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <div className={cn("relative z-10 flex items-center gap-2", isActive ? "text-primary" : "text-foreground/60 group-hover:text-foreground")}>
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 pr-1">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 text-foreground/60 transition-colors">
              {theme === 'dark' ? <Sun className="w-[1rem] h-[1rem]" /> : <Moon className="w-[1rem] h-[1rem]" />}
            </motion.button>
            
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { if(!user) window.location.href='/login'; else { setNotificationsOpen(true); setNotifCount(0); } }} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 text-foreground/60 transition-colors">
              <Bell className="w-[1rem] h-[1rem]" />
              {notifCount > 0 && <span className="absolute top-[8px] right-[8px] w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
            </motion.button>

            <Link href={user ? "/profile/me" : "/login"}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-full overflow-hidden bg-foreground/5 border border-foreground/10 flex items-center justify-center ml-2">
                {user ? (
                  user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <User2 className="w-4 h-4 text-primary" />
                ) : (
                  <User2 className="w-4 h-4 text-foreground/60" />
                )}
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </header>
  );
});
