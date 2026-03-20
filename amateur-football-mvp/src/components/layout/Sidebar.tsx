import { X, User2, LogOut, Settings, Trophy, Shield, Home as HomeIcon, Search, Users, Sun, Moon, Bell, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { getPendingRequestsCount } from '@/lib/friends';
import { getMatchInvitationsCount } from '@/lib/matches';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { cn } from '@/lib/utils';

// Memoized Nav Item for performance
const NavItem = memo(({ item, isActive, isMobile, onClose }: { 
    item: any, 
    isActive: boolean, 
    isMobile: boolean, 
    onClose?: () => void 
}) => {
    return (
        <Link
            href={item.href}
            onClick={() => isMobile && onClose && onClose()}
            className="relative group block"
        >
            <motion.div
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                    "relative flex items-center justify-between px-3.5 py-3 rounded-[0.875rem] transition-all duration-200 overflow-hidden",
                    isActive ? "bg-primary/10 border-primary/20 shadow-sm" : "hover:bg-foreground/[0.04] border-transparent"
                )}
                style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(44,252,125,0.12) 0%, rgba(44,252,125,0.04) 100%)',
                    border: '1px solid rgba(44,252,125,0.15)',
                    transform: 'translateZ(0)', // Force GPU
                } : {
                    border: '1px solid transparent',
                }}
            >
                {/* Active indicator */}
                {isActive && (
                    <motion.div
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                        style={{ background: 'linear-gradient(180deg, #5dfd9d, #2cfc7d)', boxShadow: '0 0 8px rgba(44,252,125,0.4)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                )}

                <div className="flex items-center gap-3 relative z-10 pl-1">
                    <item.icon className={cn(
                        "w-4 h-4 transition-colors duration-200",
                        isActive ? 'text-primary' : 'text-foreground/35 group-hover:text-foreground/65'
                    )} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={cn(
                        "text-[10px] font-black tracking-widest transition-colors uppercase italic",
                        isActive ? "text-foreground" : "text-foreground/75 group-hover:text-foreground"
                    )}>
                        {item.label}
                    </span>
                </div>

                {item.badge && (
                    <span
                        className="relative z-10 min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center text-[8px] font-black bg-primary text-background"
                        style={{ boxShadow: '0 0 10px rgba(44,252,125,0.3)' }}
                    >
                        {item.badge}
                    </span>
                )}
            </motion.div>
        </Link>
    );
});

NavItem.displayName = 'NavItem';

export function SidebarContent({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { performanceMode } = useSettings();
    const { setNotificationsOpen } = useSidebar();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        let isSubscribed = true;
        const fetchCount = async () => {
            try {
                const [fCount, mCount] = await Promise.all([
                    getPendingRequestsCount(user.id),
                    getMatchInvitationsCount(user.id)
                ]);
                if (isSubscribed) {
                    setPendingCount((fCount || 0) + (mCount || 0));
                }
            } catch (err) {
                console.error('Error in Sidebar count:', err);
            }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 60000); // 1 minute instead of 30s to reduce load
        return () => {
            isSubscribed = false;
            clearInterval(interval);
        };
    }, [user]);

    const navItems = useMemo(() => [
        { icon: HomeIcon,  label: 'Inicio',          href: '/' },
        { icon: Search,    label: 'Buscar Partidos',  href: '/search' },
        { icon: User2,     label: 'Mi Perfil',        href: '/profile/me' },
        { icon: Users,     label: 'Amigos',           href: '/friends', badge: (pendingCount > 0 && pathname !== '/friends') ? pendingCount : null },
        { icon: Shield,    label: 'Equipos',          href: '/teams' },
        { icon: Settings,  label: 'Configuración',   href: '/settings' },
    ], [pendingCount, pathname]);

    const metadata = user?.user_metadata || {};
    const elo = metadata?.elo || 0;
    
    const rank = useMemo(() => {
        if (elo < 1000)  return { name: 'ROOKIE',      color: 'var(--color-foreground-muted, rgba(var(--foreground-rgb),0.4))' };
        if (elo < 3000)  return { name: 'AMATEUR',     color: '#60a5fa' };
        if (elo < 6000)  return { name: 'PREMIER',     color: '#10b981' };
        if (elo < 10000) return { name: 'ELITE',       color: '#f59e0b' };
        return              { name: 'WORLD CLASS', color: '#34d399' };
    }, [elo]);

    return (
        <div className="flex flex-col h-full overflow-hidden relative" style={{ contain: 'content' }}>
            {/* ── Ambient background ── Optimized to avoid expensive blur filters */}
            {!performanceMode && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                    <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] rounded-full opacity-[0.1]"
                        style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)', transform: 'translateZ(0)' }} />
                    <div className="absolute bottom-[10%] left-[-20%] w-[120px] h-[120px] rounded-full opacity-[0.08]"
                        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', transform: 'translateZ(0)' }} />
                </div>
            )}

            {/* ── Logo Header ── */}
            <div className="relative z-10 px-6 pt-7 pb-5 flex items-center justify-between shrink-0">
                <Link 
                    href="/" 
                    onClick={() => isMobile && onClose && onClose()}
                    className="flex items-center gap-2.5 group/logo"
                >
                    <div className="w-14 h-14 flex items-center justify-center relative shrink-0">
                        {!performanceMode && (
                            <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full opacity-30 shrink-0" />
                        )}
                        <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(44,252,125,0.25)]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[20px] font-[900] tracking-[-0.04em] font-kanit uppercase italic leading-tight flex items-center gap-0 group-hover/logo:text-primary transition-all pr-4">
                            <span className="text-foreground">PELOTI</span>
                            <span className="px-1" style={{ background: 'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FY</span>
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.25em] leading-none mt-0.5 text-foreground/45">Dominá el Potrero</span>
                    </div>
                </Link>

                <div className="flex items-center gap-1.5">
                    {!isMobile && (
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all bg-foreground/[0.04] border border-foreground/[0.08] hover:bg-foreground/10 active:scale-90"
                            >
                                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-foreground/40" /> : <Moon className="w-3.5 h-3.5 text-foreground/40" />}
                            </button>
                            <button
                                onClick={() => {
                                    setNotificationsOpen(true);
                                    setPendingCount(0);
                                }}
                                className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all bg-foreground/[0.04] border border-foreground/[0.08] hover:bg-foreground/10 active:scale-90"
                            >
                                <Bell className="w-3.5 h-3.5 text-foreground/40" />
                                {pendingCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-background text-[7px] font-black rounded-full flex items-center justify-center border border-background">
                                        {pendingCount > 9 ? '9+' : pendingCount}
                                    </span>
                                )}
                            </button>
                        </div>
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
                        <div
                            className="group relative overflow-hidden rounded-[1.25rem] p-3.5 cursor-pointer transition-all hover:bg-primary/5"
                            style={{
                                background: 'linear-gradient(135deg, rgba(44,252,125,0.06) 0%, rgba(44,252,125,0.02) 100%)',
                                border: '1px solid rgba(44,252,125,0.12)',
                                transform: 'translateZ(0)',
                            }}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-[0.875rem] flex items-center justify-center overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(44,252,125,0.15), rgba(44,252,125,0.05))',
                                            border: '1px solid rgba(44,252,125,0.2)',
                                        }}>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-lg text-primary">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background"
                                        style={{ background: '#2cfc7d' }} />
                                </div>

                                <div className="flex flex-col min-w-0 pr-1 flex-1">
                                    <p className="text-xs font-black text-foreground italic uppercase tracking-tighter truncate">
                                        {user.name || 'Usuario'}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: rank.color }}>
                                            {rank.name}
                                        </span>
                                        <span className="text-[8px] text-foreground/25 font-black">·</span>
                                        <span className="text-[8px] font-black text-foreground/35 uppercase tracking-widest">
                                            {elo} ELO
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* ── Navigation ── */}
            <div className="relative z-10 flex-1 overflow-y-auto px-2.5 pb-3 flex flex-col gap-0.5 no-scrollbar min-h-0">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] px-4 mb-2 mt-1 text-foreground/45">Navegación</span>

                {navItems.map((item) => (
                    <NavItem 
                        key={item.href} 
                        item={item} 
                        isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))} 
                        isMobile={isMobile} 
                        onClose={onClose} 
                    />
                ))}

                {/* ── Quick Create CTA ── */}
                <div className="mt-4 px-1 shrink-0">
                    <div className="h-px mb-4 opacity-10 bg-foreground" />
                    <Link href="/create" onClick={() => isMobile && onClose && onClose()}>
                        <motion.button
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-11 rounded-[0.875rem] font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 text-background relative overflow-hidden group shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 100%)',
                                transform: 'translateZ(0)',
                            }}
                        >
                            <PlusCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-500 relative z-10" strokeWidth={3} />
                            <span className="relative z-10">Armar Partido</span>
                        </motion.button>
                    </Link>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className={`relative z-10 p-4 shrink-0 ${isMobile ? 'pb-8' : ''}`}>
                <div className="h-px mb-4 opacity-10 bg-foreground" />
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-[0.875rem] transition-all font-black text-[9px] uppercase tracking-widest active:scale-[0.97] hover:bg-red-500/10"
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

// ChevronRight helper component
function ChevronRight({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
    );
}

export function Sidebar() {
    const { isOpen, closeSidebar: onClose } = useSidebar();
    const { performanceMode } = useSettings();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (isOpen) onClose(); }, [pathname, isOpen, onClose]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }} // Faster transition
                        className="absolute inset-0"
                        style={{ 
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: performanceMode ? 'none' : 'blur(4px)', // Much reduced blur
                            WebkitBackdropFilter: performanceMode ? 'none' : 'blur(4px)',
                        }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '-101%' }} // Slightly more to ensure it's hidden
                        animate={{ x: 0 }}
                        exit={{ x: '-101%' }}
                        transition={performanceMode ? { type: 'tween', duration: 0.15, ease: 'easeOut' } : { 
                            type: 'spring', 
                            damping: 35, // Higher damping for less oscillation
                            stiffness: 300, 
                            mass: 0.8 // Lower mass for snappier feel
                        }}
                        className="absolute inset-y-0 left-0 w-[280px] flex flex-col shadow-2xl sidebar-container"
                        style={{
                            backgroundColor: 'var(--surface-elevated)',
                            backdropFilter: performanceMode ? 'none' : 'blur(16px)', // Reduced from 24px
                            WebkitBackdropFilter: performanceMode ? 'none' : 'blur(16px)',
                            borderRight: '1px solid rgba(var(--foreground-rgb),0.06)',
                            boxShadow: '10px 0 40px rgba(0,0,0,0.2)',
                            transform: 'translateZ(0)', // Force GPU acceleration
                            willChange: 'transform',    // Hint to browser
                        }}
                    >
                        <SidebarContent isMobile onClose={onClose} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

SidebarContent.displayName = 'SidebarContent';
