import { X, User2, LogOut, Settings, Trophy, Shield, Home as HomeIcon, Search, Users, Sun, Moon, Bell, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { getPendingRequestsCount } from '@/lib/friends';
import { getMatchInvitationsCount } from '@/lib/matches';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function SidebarContent({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { isNotificationsOpen, setNotificationsOpen } = useSidebar();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchCount = async () => {
            try {
                const [fCount, mCount] = await Promise.all([
                    getPendingRequestsCount(user.id),
                    getMatchInvitationsCount(user.id)
                ]);
                setPendingCount((fCount || 0) + (mCount || 0));
            } catch (err) {
                console.error('Error in Sidebar count:', err);
            }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const navItems = [
        { icon: HomeIcon,  label: 'Inicio',          href: '/' },
        { icon: Search,    label: 'Buscar Partidos',  href: '/search' },
        { icon: User2,     label: 'Mi Perfil',        href: '/profile/me' },
        { icon: Users,     label: 'Amigos',           href: '/friends', badge: (pendingCount > 0 && pathname !== '/friends') ? pendingCount : null },
        { icon: Shield,    label: 'Equipos',          href: '/teams' },
        { icon: Settings,  label: 'Configuración',   href: '/settings' },
    ];

    const metadata = user?.user_metadata || {};
    const elo = metadata?.elo || 0;
    const getRankName = (elo: number) => {
        if (elo < 1000)  return { name: 'ROOKIE',      color: 'var(--color-foreground-muted, rgba(var(--foreground-rgb),0.4))' };
        if (elo < 3000)  return { name: 'AMATEUR',     color: '#60a5fa' };
        if (elo < 6000)  return { name: 'PREMIER',     color: '#10b981' };
        if (elo < 10000) return { name: 'ELITE',       color: '#f59e0b' };
        return              { name: 'WORLD CLASS', color: '#34d399' };
    };
    const rank = getRankName(elo);

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            {/* ── Ambient background ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-30%] right-[-40%] w-[80%] h-[60%] rounded-full opacity-[0.06]"
                    style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', filter: 'blur(60px)' }} />
                <div className="absolute bottom-[5%] left-[-30%] w-[70%] h-[40%] rounded-full opacity-[0.04]"
                    style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)' }} />
            </div>

            {/* ── Top border ── */}
            {!isMobile && (
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent)' }} />
            )}

            {/* ── Logo Header ── */}
            <div className="relative z-10 px-6 pt-7 pb-5 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <Link 
                        href="/" 
                        onClick={() => isMobile && onClose && onClose()}
                        className="flex items-center gap-2.5 group/logo"
                    >
                        {/* Logo Icon */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                            style={{
                                background: 'rgba(16,185,129,0.05)',
                                border: '1px solid rgba(16,185,129,0.15)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                            }}>
                            <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-cover scale-110 group-hover/logo:scale-125 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[22px] font-[900] tracking-[-0.06em] font-outfit uppercase italic leading-none group-hover/logo:text-primary transition-colors"
                                style={{
                                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #d1fae5 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                PELOTIFY
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-[0.25em] leading-none mt-0.5 text-foreground/30">
                                Dominá el Potrero
                            </span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-1.5">
                    {!isMobile && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all bg-foreground/[0.06] border border-foreground/[0.08] hover:bg-foreground/10"
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
                                        {theme === 'dark'
                                            ? <Sun className="w-3.5 h-3.5 text-foreground/40" />
                                            : <Moon className="w-3.5 h-3.5 text-foreground/40" />
                                        }
                                    </motion.div>
                                </AnimatePresence>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setNotificationsOpen(true)}
                                className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all bg-foreground/[0.06] border border-foreground/[0.08] hover:bg-foreground/10"
                            >
                                <Bell className="w-3.5 h-3.5 text-foreground/40" />
                                <AnimatePresence>
                                    {pendingCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-background text-[8px] font-black rounded-full flex items-center justify-center border border-background"
                                            style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
                                        >
                                            {pendingCount > 9 ? '9+' : pendingCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </>
                    )}
                    {isMobile && onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl transition-all active:scale-90 bg-foreground/[0.06] hover:bg-foreground/10"
                        >
                            <X className="w-4 h-4 text-foreground/50" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── User Card ── */}
            {user && (
                <div className="relative z-10 mx-4 mb-5 shrink-0">
                    <Link href="/profile/me" onClick={() => isMobile && onClose && onClose()}>
                        <motion.div
                            whileHover={{ scale: 1.015 }}
                            className="group relative overflow-hidden rounded-[1.25rem] p-4 cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)',
                                border: '1px solid rgba(16,185,129,0.15)',
                            }}
                        >
                            {/* Background shine on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.08) 0%, transparent 80%)' }} />

                            <div className="flex items-center gap-3 relative z-10">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-11 h-11 rounded-[0.875rem] flex items-center justify-center overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))',
                                            border: '1.5px solid rgba(16,185,129,0.3)',
                                            boxShadow: '0 4px 16px rgba(16,185,129,0.15)',
                                        }}>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-lg text-primary">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                        )}
                                    </div>
                                    {/* Online dot */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
                                        style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm text-foreground/90 tracking-tight truncate leading-tight">
                                        {user.name || 'Usuario'}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[9px] font-black uppercase tracking-widest"
                                            style={{ color: rank.color }}>
                                            {rank.name}
                                        </span>
                                        <span className="text-[9px] text-foreground/25 font-black">·</span>
                                        <span className="text-[9px] font-black text-foreground/35 uppercase tracking-widest">
                                            {elo} ELO
                                        </span>
                                    </div>
                                </div>

                                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: 'rgba(16,185,129,0.12)' }}>
                                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>
            )}

            {/* ── Navigation ── */}
            <div className="relative z-10 flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-0.5 no-scrollbar min-h-0">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 mb-1.5 mt-1 text-foreground/30">
                    Navegación
                </span>

                {navItems.map((item, index) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            onClick={() => isMobile && onClose && onClose()}
                            className="relative group"
                        >
                            <motion.div
                                whileHover={{ x: 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className={`relative flex items-center justify-between px-3 py-3 rounded-[0.875rem] transition-all duration-200 overflow-hidden ${
                                    isActive ? '' : 'hover:bg-foreground/[0.04]'
                                }`}
                                style={isActive ? {
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0.06) 100%)',
                                    border: '1px solid rgba(16,185,129,0.18)',
                                } : {
                                    border: '1px solid transparent',
                                }}
                            >
                                {/* Active left bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-bar"
                                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                                        style={{ background: 'linear-gradient(180deg, #34d399, #10b981)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}

                                {/* Hover shimmer */}
                                {!isActive && (
                                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"
                                        style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--foreground-rgb),0.05), transparent)' }} />
                                )}

                                <div className="flex items-center gap-3 relative z-10 pl-1">
                                    <item.icon className={`w-4 h-4 transition-colors duration-200 ${
                                        isActive ? 'text-primary' : 'text-foreground/35 group-hover:text-foreground/65'
                                    }`} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={`text-[12.5px] font-black uppercase tracking-tight transition-colors duration-200 ${
                                        isActive ? 'text-foreground/90' : 'text-foreground/45 group-hover:text-foreground/75'
                                    }`}>
                                        {item.label}
                                    </span>
                                </div>

                                {item.badge && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="relative z-10 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[9px] font-black bg-primary/90 text-background"
                                        style={{ boxShadow: '0 0 10px rgba(16,185,129,0.35)' }}
                                    >
                                        {item.badge}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}

                {/* ── Quick Create CTA ── */}
                <div className="mt-4 px-1">
                    <div className="h-px mb-4"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--foreground-rgb),0.1), transparent)' }} />
                    <Link href="/create" onClick={() => isMobile && onClose && onClose()}>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full h-11 rounded-[0.875rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 text-background relative overflow-hidden group"
                            style={{
                                background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
                                boxShadow: '0 6px 20px rgba(16,185,129,0.3), 0 2px 8px rgba(0,0,0,0.2)',
                            }}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', animation: 'shimmer 1s ease' }} />
                            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500 relative z-10" strokeWidth={2.5} />
                            <span className="relative z-10">Armar Partido</span>
                        </motion.button>
                    </Link>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className={`relative z-10 p-4 shrink-0 ${isMobile ? 'pb-8' : ''}`}>
                <div className="h-px mb-4"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--foreground-rgb),0.1), transparent)' }} />
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-[0.875rem] transition-all font-black text-[10px] uppercase tracking-widest active:scale-[0.97] hover:bg-red-500/10"
                    style={{
                        color: 'rgba(244,63,94,0.6)',
                        border: '1px solid rgba(244,63,94,0.1)',
                    }}
                >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}

export function Sidebar() {
    const { isOpen, closeSidebar: onClose } = useSidebar();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (isOpen) onClose(); }, [pathname]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 backdrop-blur-sm"
                        style={{ background: 'rgba(0,0,0,0.55)' }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="absolute inset-y-0 left-0 w-[290px] flex flex-col shadow-2xl"
                        style={{
                            backgroundColor: 'var(--surface-elevated)',
                            backdropFilter: 'blur(24px)',
                            borderRight: '1px solid rgba(var(--foreground-rgb),0.08)',
                            boxShadow: '20px 0 60px rgba(0,0,0,0.3)',
                        }}
                    >
                        <SidebarContent isMobile onClose={onClose} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
