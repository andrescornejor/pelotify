'use client';

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
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { useState, useEffect } from 'react';
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
  { href: '/search', icon: Search, label: 'Buscar' },
  { href: '/friends', icon: Users, label: 'Amigos', id: 'friends' },
  { href: '/messages', icon: MessageSquare, label: 'Mensajes' },
  { href: '/teams', icon: Shield, label: 'Equipos' },
];

export function TopHeader() {
  const pathname = usePathname();
  const { toggleSidebar, isNotificationsOpen, setNotificationsOpen } = useSidebar();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifCount, setNotifCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const [friendsCount, setFriendsCount] = useState(0);

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
      setUnreadChatCount(c || 0);
      setNotifCount((f || 0) + (m || 0) + (t || 0) + (ti || 0) + (tc || 0));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;

    updateCount();

    // Clear unread chat count if on messages page
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    if (cleanPath === '/messages') {
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
        <div className="max-w-screen-2xl mx-auto w-full pointer-events-auto">
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.05 }}
            className="overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] relative group"
            style={{
              background: performanceMode
                ? 'var(--surface-elevated)'
                : 'rgba(var(--foreground-rgb), 0.05)',
              backdropFilter: performanceMode ? 'none' : 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: performanceMode ? 'none' : 'blur(20px) saturate(180%)',
              border: '1px solid var(--border)',
              boxShadow: performanceMode
                ? '0 10px 30px rgba(0,0,0,0.2)'
                : '0 20px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Dynamic Glass Highlight */}
            {!performanceMode && (
              <div className="absolute top-0 left-[-20%] w-[50%] h-full bg-gradient-to-r from-primary/10 via-transparent to-transparent -skew-x-[25deg] transition-all duration-1000 group-hover:left-[100%]" />
            )}

            <div className="flex items-center justify-between h-[84px] px-6 lg:px-10 w-full relative z-10">
              {/* Left Side: Brand & Menu */}
              <div className="flex items-center gap-6">
                <motion.button
                  onClick={toggleSidebar}
                  whileTap={{ scale: 0.94 }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-foreground/[0.04] hover:bg-primary hover:text-background border border-border transition-all group/menu"
                >
                  <div className="flex flex-col gap-1.5 w-5">
                    <div className="h-0.5 w-full bg-current rounded-full" />
                    <div className="h-0.5 w-full bg-current rounded-full opacity-60" />
                    <div className="h-0.5 w-full bg-current rounded-full" />
                  </div>
                </motion.button>

                <Link href="/" className="flex items-center gap-4 group/brand">
                    <div className="w-12 h-12 relative flex items-center justify-center">
                       <div className="absolute inset-x-0 inset-y-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover/brand:opacity-100 transition-opacity" />
                       <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)] group-hover/brand:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col">
                       <h1 className="text-2xl font-black font-kanit italic tracking-[-0.04em] leading-none uppercase">
                         PELOTI<span className="text-primary">FY</span>
                       </h1>
                       <div className="flex items-center gap-1.5 mt-1 opacity-40 group-hover/brand:opacity-100 transition-opacity">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-[0.3em]">BETA v2.0</span>
                       </div>
                    </div>
                </Link>
              </div>

              {/* Center: Desktop Navigation - Expert Styling */}
              <nav className="hidden lg:flex items-center gap-1 p-1.5 rounded-2xl bg-foreground/[0.03] border border-border">
                {DESKTOP_NAV.map((item) => {
                  const cleanPath = pathname.replace(/\/$/, '') || '/';
                  const cleanHref = item.href.replace(/\/$/, '') || '/';
                  const isActive = cleanPath === cleanHref || (cleanHref !== '/' && cleanPath.startsWith(cleanHref));
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        className={cn(
                          'relative px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 group/nav shadow-sm',
                          isActive ? 'bg-primary text-background' : 'text-foreground/40 hover:text-foreground/80 hover:bg-foreground/[0.04]'
                        )}
                        whileHover={!isActive ? { y: -2 } : {}}
                      >
                        <item.icon className="w-4 h-4" strokeWidth={isActive ? 3 : 2} />
                        <span className="text-[11px] font-[900] uppercase tracking-widest italic">{item.label}</span>
                        
                        {isActive && !performanceMode && (
                          <motion.div 
                            layoutId="top-nav-shadow"
                            className="absolute inset-0 rounded-xl shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] pointer-events-none"
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              {/* Right Side: Account & Settings */}
              <div className="flex items-center gap-3">
                 <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-border bg-foreground/[0.03] hover:bg-foreground/[0.08] transition-all"
                 >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={theme}
                        initial={{ rotate: -20, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 20, opacity: 0 }}
                      >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </motion.div>
                    </AnimatePresence>
                 </motion.button>

                 <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNotificationsOpen(true)}
                    className="relative w-12 h-12 flex items-center justify-center rounded-2xl border border-border bg-foreground/[0.03] hover:bg-foreground/[0.08] transition-all"
                 >
                    <Bell className="w-4 h-4" />
                    {notifCount > 0 && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-background text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background animate-bounce shadow-lg">
                        {notifCount}
                      </span>
                    )}
                 </motion.button>

                 <Link href="/profile/me">
                    <motion.div
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       className="w-14 h-14 p-1 rounded-[1.25rem] border-2 border-primary/20 hover:border-primary transition-all bg-surface shadow-xl"
                    >
                       <div className="w-full h-full rounded-[0.9rem] overflow-hidden bg-foreground/5 flex items-center justify-center">
                          {user?.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <User2 className="w-5 h-5 opacity-40" />
                          )}
                       </div>
                    </motion.div>
                 </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </header>
    </>
  );
}
