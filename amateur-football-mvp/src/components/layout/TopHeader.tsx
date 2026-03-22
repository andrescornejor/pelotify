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
  { href: '/', icon: Home, label: 'Inicio' },
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
      <header className="fixed top-0 left-0 right-0 z-[60] pt-4 lg:pt-4 px-3 sm:px-5 lg:px-10 xl:px-16 pointer-events-none">
        <div className="max-w-screen-2xl mx-auto w-full pointer-events-auto">
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.05 }}
            className="overflow-hidden rounded-[1.25rem] lg:rounded-[1.75rem]"
            style={{
              background: performanceMode
                ? 'var(--surface-elevated)'
                : 'rgba(var(--foreground-rgb), 0.04)',
              backdropFilter: performanceMode ? 'none' : 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: performanceMode ? 'none' : 'blur(28px) saturate(180%)',
              border: '1px solid rgba(var(--foreground-rgb), 0.08)',
              boxShadow: performanceMode
                ? '0 10px 30px rgba(0,0,0,0.2)'
                : '0 4px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Background subtle light beam */}
            <div className="absolute top-0 left-[-10%] w-[40%] h-full bg-gradient-to-r from-primary/5 via-transparent to-transparent -skew-x-12 pointer-events-none" />

            <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[80px] sm:h-[80px] lg:h-[76px] px-4 sm:px-6 lg:px-8 w-full">
              {/* Left: Menu + Logo */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-3 xl:gap-6 min-w-0">
                <motion.button
                  onClick={toggleSidebar}
                  whileTap={{ scale: 0.92 }}
                  className="relative w-12 h-12 lg:w-11 lg:h-11 flex items-center justify-center rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-foreground/[0.06] transition-all group"
                  aria-label="Menu"
                >
                  <div className="flex flex-col gap-[5px] w-[19px] items-end">
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
                  className="flex items-center gap-2 select-none hover:opacity-90 transition-all group/logo"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-14 lg:h-14 xl:w-20 xl:h-20 flex items-center justify-center relative transition-transform duration-500 group-hover/logo:scale-110 shrink-0">
                    <div className="absolute inset-0 bg-primary/15 blur-[20px] rounded-full opacity-40 shrink-0" />
                    <img
                      src="/logo_pelotify.png"
                      alt="Logo"
                      className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(44,252,125,0.2)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col lg:gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="hidden min-[400px]:flex text-[20px] sm:text-[24px] lg:text-[24px] 2xl:text-[32px] font-[900] tracking-[-0.02em] font-kanit uppercase italic leading-tight items-center gap-0 pr-4">
                        <span className="text-foreground">PELOTI</span>
                        <span
                          className="bg-clip-text text-transparent px-2 -mx-2"
                          style={{
                            backgroundImage:
                              'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 40%, #1db95a 100%)',
                            filter: 'drop-shadow(0 0 20px rgba(44,252,125,0.45))',
                          }}
                        >
                          FY
                        </span>
                      </span>
                      {/* Subtitle gem - only lg */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="hidden lg:block w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(44,252,125,0.8)]"
                      />
                    </div>
                    <span className="hidden sm:block lg:hidden 2xl:block text-[7px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-foreground/25 leading-none mt-0.5 group-hover/logo:text-primary transition-colors duration-500">
                      Dominá el{' '}
                      <span className="text-primary/50 group-hover/logo:text-primary transition-colors duration-500">
                        Potrero
                      </span>
                    </span>
                  </div>
                </Link>
              </div>

              {/* Middle: Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1.5 bg-foreground/[0.03] p-1.5 rounded-[1.25rem] border border-foreground/[0.05] backdrop-blur-md">
                {DESKTOP_NAV.map((item) => {
                  const cleanPath = pathname.replace(/\/$/, '') || '/';
                  const cleanHref = item.href.replace(/\/$/, '') || '/';
                  const isActive =
                    cleanPath === cleanHref ||
                    (cleanHref !== '/' && cleanPath.startsWith(cleanHref));
                  const hasBadge =
                    (item.id === 'friends' && friendsCount > 0 && !isActive) ||
                    (item.label === 'Mensajes' && unreadChatCount > 0 && !isActive);

                  return (
                    <Link key={item.href} href={item.href} className="relative">
                      <motion.div
                        whileHover={{ y: -1 }}
                        className={cn(
                          'relative px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all duration-300 group',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground/45 hover:text-foreground/70 hover:bg-foreground/[0.04]'
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="nav-glow"
                            className="absolute inset-0 rounded-xl bg-primary/[0.08]"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}

                        <item.icon
                          className={cn(
                            'w-4 h-4 transition-transform duration-300',
                            isActive ? 'scale-110' : 'group-hover:scale-110'
                          )}
                          strokeWidth={isActive ? 2.5 : 2}
                        />

                        <span
                          className={cn(
                            'hidden 2xl:block text-[12px] font-black uppercase tracking-wider',
                            isActive ? 'opacity-100' : 'opacity-80'
                          )}
                        >
                          {item.label}
                        </span>

                        {hasBadge && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)] ml-0.5" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-4 lg:gap-2.5 xl:gap-4 col-start-3">
                {/* Create Match Button - Only Desktop */}

                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  {/* Theme Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.88, rotate: 20 }}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-12 h-12 lg:w-11 lg:h-11 flex items-center justify-center rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/45 hover:text-foreground/70 transition-all border border-foreground/[0.04]"
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
                      setNotificationsOpen(true);
                      setNotifCount(0);
                    }}
                    className="relative w-12 h-12 lg:w-11 lg:h-11 flex items-center justify-center rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/45 hover:text-foreground/70 transition-all border border-foreground/[0.04]"
                  >
                    <Bell className="w-4 h-4 sm:w-[1.1rem] sm:h-[1.1rem]" />
                    <AnimatePresence>
                      {notifCount > 0 && (
                        <motion.span
                          initial={{ scale: 0, y: 4 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 bg-primary text-background text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-background"
                        >
                          {notifCount > 9 ? '9+' : notifCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Profile Avatar */}
                  <Link href="/profile/me">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className="w-12 h-12 lg:w-11 lg:h-11 rounded-2xl p-0.5 bg-foreground/[0.04] border border-foreground/[0.08] hover:border-primary/30 transition-all"
                    >
                      <div className="w-full h-full rounded-[0.85rem] overflow-hidden bg-primary/5 flex items-center justify-center">
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt="Perfil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User2 className="w-5 h-5 text-primary/60" />
                        )}
                      </div>
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
}
