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
      <header className="fixed top-0 left-0 right-0 z-[60] pt-4 lg:pt-6 px-4 lg:px-8 xl:px-12 pointer-events-none">
        <div className="max-w-screen-2xl mx-auto w-full pointer-events-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="group relative overflow-hidden rounded-3xl"
            style={{
              background: performanceMode
                ? 'var(--surface-elevated)'
                : 'rgba(5, 5, 8, 0.7)',
              backdropFilter: performanceMode ? 'none' : 'blur(24px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Master Light Beam Overlay */}
            {!performanceMode && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-40 -skew-x-12 translate-x-[-50%] group-hover:translate-x-[150%] transition-transform duration-[3s] pointer-events-none" />
            )}

            <div className="grid grid-cols-[1fr_auto_1fr] items-center h-20 sm:h-20 lg:h-18 px-5 sm:px-6 lg:px-8 w-full relative z-10">
              {/* Left: Menu Handle + Minimal Logo */}
              <div className="flex items-center gap-6">
                <motion.button
                  onClick={toggleSidebar}
                  whileTap={{ scale: 0.94 }}
                  className="w-12 h-12 lg:w-11 lg:h-11 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all group/menu"
                >
                  <div className="flex flex-col gap-1.5 w-5 items-center">
                    <span className="h-[2px] w-full bg-foreground/90 rounded-full group-hover/menu:bg-primary transition-colors" />
                    <span className="h-[2px] w-[60%] bg-primary rounded-full shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
                    <span className="h-[2px] w-full bg-foreground/90 rounded-full group-hover/menu:bg-primary transition-colors" />
                  </div>
                </motion.button>

                <Link href="/" className="flex items-center gap-4 group/logo">
                   <div className="relative w-11 h-11 lg:w-10 lg:h-10">
                      <img src="/logo_pelotify.png" className="w-full h-full object-contain filter group-hover/logo:brightness-125 transition-all" alt="L" />
                   </div>
                   <div className="hidden min-[1100px]:flex flex-col">
                      <span className="text-lg font-black italic uppercase tracking-tighter leading-none font-kanit">
                        PELOTI<span className="text-primary">FY</span>
                      </span>
                      <span className="text-[7px] font-black uppercase tracking-[0.4em] text-foreground/20 leading-none mt-1">
                        ELITE FOOTBALL
                      </span>
                   </div>
                </Link>
              </div>

              {/* Middle: Desktop Nav Redesign */}
              <nav className="hidden lg:flex items-center gap-1 bg-white/[0.02] p-1.5 rounded-2xl border border-white/[0.05]">
                {DESKTOP_NAV.map((item) => {
                  const cleanPath = pathname.replace(/\/$/, '') || '/';
                  const cleanHref = item.href.replace(/\/$/, '') || '/';
                  const isActive = cleanPath === cleanHref || (cleanHref !== '/' && cleanPath.startsWith(cleanHref));
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        className={cn(
                          'relative px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-400 group',
                          isActive ? 'text-primary' : 'text-foreground/40 hover:text-foreground/80'
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="top-nav-active"
                            className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(44,252,125,0.1)]"
                          />
                        )}
                        <item.icon className="w-4 h-4 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[11px] font-black uppercase tracking-widest relative z-10">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-3 lg:gap-4">
                 <div className="h-6 w-px bg-white/5 hidden lg:block" />
                 
                 <div className="flex items-center gap-2 lg:gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-white/[0.05] transition-all text-foreground/40 hover:text-foreground/80"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={theme}
                          initial={{ opacity: 0, rotate: -45 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 45 }}
                        >
                          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </motion.div>
                      </AnimatePresence>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setNotificationsOpen(true)}
                      className="relative w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-white/[0.05] transition-all text-foreground/40 hover:text-foreground/80"
                    >
                      <Bell className="w-5 h-5" />
                      {notifCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(44,252,125,1)] border border-[#050508]" />
                      )}
                    </motion.button>

                    <Link href="/profile/me">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-br from-white/20 to-transparent border border-white/10"
                      >
                         <div className="w-full h-full rounded-[0.85rem] overflow-hidden bg-surface-elevated flex items-center justify-center">
                            {user?.avatar_url ? (
                              <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <User2 className="w-5 h-5 text-foreground/20" />
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
