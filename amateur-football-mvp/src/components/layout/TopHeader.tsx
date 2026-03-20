'use client';

import { Bell, Sun, Moon, Home, Search, Users, Shield, PlusCircle, User2, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingRequestsCount } from '@/lib/friends';
import { getMatchInvitationsCount } from '@/lib/matches';
import { getPendingJoinRequestsCountForCaptain, getTeamInvitationsCount } from '@/lib/teams';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { getUnreadMessagesCount } from '@/lib/chat';
import { supabase } from '@/lib/supabase';

const DESKTOP_NAV = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/search', icon: Search, label: 'Buscar' },
    { href: '/friends', icon: Users, label: 'Amigos', id: 'friends' },
    { href: '/messages', icon: MessageSquare, label: 'Mensajes' },
    { href: '/teams', icon: Shield, label: 'Equipos' },
];

export function TopHeader() {
    const pathname = usePathname();
    const { toggleSidebar, isNotificationsOpen, setNotificationsOpen, isOpen: isSidebarOpen } = useSidebar();
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const { performanceMode } = useSettings();
    const [notifCount, setNotifCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [friendsCount, setFriendsCount] = useState(0);

    const updateCount = useCallback(async () => {
        if (!user) return;
        try {
            const [f, m, t, ti, c] = await Promise.all([
                getPendingRequestsCount(user.id),
                getMatchInvitationsCount(user.id),
                getPendingJoinRequestsCountForCaptain(user.id),
                getTeamInvitationsCount(user.id),
                getUnreadMessagesCount(user.id)
            ]);
            setFriendsCount(f || 0);
            setUnreadChatCount(c || 0);
            setNotifCount((f || 0) + (m || 0) + (t || 0) + (ti || 0));
        } catch (err) {
            console.error(err);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        
        updateCount();

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
                    table: 'direct_messages'
                },
                () => {
                    updateCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, pathname, updateCount]);

    if (['/login', '/register'].includes(pathname)) {
        return null;
    }

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[60] pt-3 sm:pt-4 px-3 sm:px-5 lg:px-10 xl:px-16 pointer-events-none" style={{ contain: 'layout style' }}>
                <div className="max-w-screen-2xl mx-auto w-full pointer-events-auto">
                    <motion.div
                        initial={{ y: -24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={performanceMode ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 26, delay: 0.05 }}
                        className="overflow-hidden rounded-[1.25rem] lg:rounded-[1.75rem]"
                        style={{
                            background: 'rgba(var(--foreground-rgb), 0.05)',
                            backdropFilter: performanceMode ? 'none' : 'blur(16px) saturate(160%)',
                            WebkitBackdropFilter: performanceMode ? 'none' : 'blur(16px) saturate(160%)',
                            border: '1px solid rgba(var(--foreground-rgb), 0.08)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transform: 'translateZ(0)',
                        }}
                    >
                        {!performanceMode && (
                            <div className="absolute top-0 left-[-10%] w-[40%] h-full bg-gradient-to-r from-primary/5 via-transparent to-transparent -skew-x-12 pointer-events-none" />
                        )}

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[58px] sm:h-[68px] lg:h-[76px] px-4 sm:px-6 lg:px-8 w-full">
                            {/* Left: Menu + Logo */}
                            <div className="flex items-center gap-3 sm:gap-4 lg:gap-3 xl:gap-6 min-w-0">
                                <button
                                    onClick={toggleSidebar}
                                    className="relative w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-foreground/[0.06] transition-all group active:scale-90"
                                    aria-label="Menu"
                                >
                                    <div className="flex flex-col gap-[5px] w-[19px] items-end">
                                        <div
                                            className={cn(
                                                "h-[2px] bg-foreground/80 rounded-full block transition-all duration-300",
                                                isSidebarOpen ? "w-full rotate-45 translate-y-[7.5px]" : "w-full"
                                            )}
                                        />
                                        <div
                                            className={cn(
                                                "h-[2.2px] bg-primary rounded-full block transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
                                                isSidebarOpen ? "opacity-0 -translate-x-2" : "w-[70%]"
                                            )}
                                        />
                                        <div
                                            className={cn(
                                                "h-[2px] bg-foreground/80 rounded-full block transition-all duration-300",
                                                isSidebarOpen ? "w-full -rotate-45 -translate-y-[7.5px]" : "w-full"
                                            )}
                                        />
                                    </div>
                                </button>

                                <Link href="/" className="flex items-center gap-2 select-none group/logo">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-14 lg:h-14 xl:w-20 xl:h-20 flex items-center justify-center relative shrink-0">
                                        {!performanceMode && (
                                            <div className="absolute inset-0 bg-primary/15 blur-[20px] rounded-full opacity-30 shrink-0" />
                                        )}
                                        <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(44,252,125,0.2)]" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[18px] sm:text-[22px] lg:text-[22px] xl:text-[30px] font-[900] tracking-[-0.02em] font-kanit uppercase italic leading-tight flex items-center gap-0 pr-4">
                                                <span className="text-foreground">PELOTI</span>
                                                <span className="bg-clip-text text-transparent px-2 -mx-2" style={{ backgroundImage: 'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 100%)' }}>FY</span>
                                            </span>
                                        </div>
                                        <span className="hidden sm:block lg:hidden xl:block text-[7px] sm:text-[9px] xl:text-[10px] font-black uppercase tracking-[0.3em] text-foreground/25 leading-none mt-0.5 group-hover/logo:text-primary transition-colors duration-500">
                                            Dominá el <span className="text-primary/50 group-hover/logo:text-primary">Potrero</span>
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            {/* Middle: Desktop Nav */}
                            <nav className="hidden lg:flex items-center gap-1.5 bg-foreground/[0.03] p-1.5 rounded-[1.25rem] border border-foreground/[0.05]">
                                {DESKTOP_NAV.map((item) => {
                                    const cleanPath = pathname.replace(/\/$/, '') || '/';
                                    const cleanHref = item.href.replace(/\/$/, '') || '/';
                                    const isActive = cleanPath === cleanHref || (cleanHref !== '/' && cleanPath.startsWith(cleanHref));
                                    const hasBadge = (item.id === 'friends' && friendsCount > 0 && !isActive) || 
                                                     (item.label === 'Mensajes' && unreadChatCount > 0 && !isActive);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="relative"
                                        >
                                            <div
                                                className={cn(
                                                    "relative px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all duration-300 group",
                                                    isActive 
                                                        ? "bg-primary/10 text-primary shadow-sm" 
                                                        : "text-foreground/45 hover:text-foreground/70 hover:bg-foreground/[0.04]"
                                                )}
                                                style={{ transform: 'translateZ(0)' }}
                                            >
                                                {isActive && !performanceMode && (
                                                    <motion.div
                                                        layoutId="nav-glow"
                                                        className="absolute inset-0 rounded-xl bg-primary/[0.05]"
                                                        initial={false}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                    />
                                                )}
                                                
                                                <item.icon className={cn(
                                                    "w-4 h-4 transition-transform duration-300",
                                                    isActive ? "scale-110" : "group-hover:scale-110"
                                                )} strokeWidth={isActive ? 2.5 : 2} />
                                                
                                                <span className={cn(
                                                    "hidden xl:block text-[11px] font-black uppercase tracking-wider",
                                                    isActive ? "opacity-100" : "opacity-80"
                                                )}>
                                                    {item.label}
                                                </span>

                                                {hasBadge && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)] ml-0.5" />
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Right: Actions */}
                            <div className="flex items-center justify-end gap-1.5 sm:gap-4 lg:gap-2.5 xl:gap-4 col-start-3">
                                <div className="flex items-center gap-1.5 sm:gap-2.5">
                                    {/* Theme Toggle */}
                                    <button
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/45 hover:text-foreground/70 transition-all border border-foreground/[0.04] active:scale-90"
                                        title="Cambiar Tema"
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={theme}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </motion.div>
                                        </AnimatePresence>
                                    </button>

                                    {/* Notification Bell */}
                                    <button
                                        onClick={() => {
                                            setNotificationsOpen(true);
                                            setNotifCount(0);
                                        }}
                                        className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/45 hover:text-foreground/70 transition-all border border-foreground/[0.04] active:scale-90"
                                    >
                                        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                                        {notifCount > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-background text-[9px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                                                {notifCount > 9 ? '9+' : notifCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Profile Avatar */}
                                    <Link href="/profile/me">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl p-0.5 bg-foreground/[0.04] border border-foreground/[0.08] hover:border-primary/30 transition-all active:scale-95">
                                            <div className="w-full h-full rounded-[0.85rem] overflow-hidden bg-primary/5 flex items-center justify-center">
                                                {user?.avatar_url ? (
                                                    <img src={user.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User2 className="w-5 h-5 text-primary/60" />
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <NotificationCenter
                isOpen={isNotificationsOpen}
                onClose={() => setNotificationsOpen(false)}
            />
        </>
    );
}
