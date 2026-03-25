import {
  X,
  User2,
  LogOut,
  Settings,
  Trophy,
  Shield,
  Home as HomeIcon,
  Search,
  Users,
  Sun,
  Moon,
  Bell,
  PlusCircle,
  Flame,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { getPendingRequestsCount } from '@/lib/friends';
import { getMatchInvitationsCount } from '@/lib/matches';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { cn } from '@/lib/utils';

export const SidebarContent = memo(function SidebarContent({
  isMobile = false,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { performanceMode } = useSettings();
  const { isNotificationsOpen, setNotificationsOpen } = useSidebar();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const [fCount, mCount] = await Promise.all([
          getPendingRequestsCount(user.id),
          getMatchInvitationsCount(user.id),
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
    { icon: HomeIcon, label: 'Inicio', href: '/' },
    { icon: Trophy, label: 'Ranking Global', href: '/ranks' },
    { icon: Search, label: 'Buscar Partidos', href: '/search' },
    { icon: User2, label: 'Mi Perfil', href: '/profile/me' },
    { icon: Target, label: 'Mercado', href: '/scouting', badge: 'PRO' },
    { icon: Flame, label: 'FutTok', href: '/highlights', badge: 'NUEVO' },
    {
      icon: Users,
      label: 'Amigos',
      href: '/friends',
      badge: pendingCount > 0 && pathname !== '/friends' ? pendingCount : null,
    },
    { icon: Shield, label: 'Equipos', href: '/teams' },
    { icon: Settings, label: 'Configuración', href: '/settings' },
  ];

  const metadata = user?.user_metadata || {};
  const elo = metadata?.elo || 0;
  const getRankName = (elo: number) => {
    if (elo < 1000)
      return {
        name: 'ROOKIE',
        color: 'var(--color-foreground-muted, rgba(var(--foreground-rgb),0.4))',
      };
    if (elo < 3000) return { name: 'AMATEUR', color: '#60a5fa' };
    if (elo < 6000) return { name: 'PREMIER', color: '#10b981' };
    if (elo < 10000) return { name: 'ELITE', color: '#f59e0b' };
    return { name: 'WORLD CLASS', color: '#34d399' };
  };
  const rank = getRankName(elo);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* ── Ambient background - Optimized ── */}
      {!performanceMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05]">
          <div
            className="absolute top-[-20%] right-[-30%] w-[70%] h-[50%] rounded-full"
            style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[0%] left-[-20%] w-[60%] h-[30%] rounded-full"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
          />
        </div>
      )}

      {/* ── Top border ── */}
      {!isMobile && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(44,252,125,0.2), transparent)',
          }}
        />
      )}

      {/* ── Logo Header ── */}
      <div className="relative z-10 px-6 pt-10 pb-6 flex items-center justify-between shrink-0">
        <Link
          href="/"
          onClick={() => isMobile && onClose && onClose()}
          className="flex items-center gap-3.5 group/logo"
        >
          <div className="w-14 h-14 flex items-center justify-center relative shrink-0">
            {!performanceMode && (
              <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full opacity-60 group-hover/logo:opacity-100 transition-opacity" />
            )}
            <img
              src="/logo_pelotify.png"
              alt="Logo"
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(44,252,125,0.3)] transition-transform duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-3"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[24px] font-[900] tracking-[-0.06em] font-kanit uppercase italic leading-none flex items-center">
              <span className="text-foreground">PELOTI</span>
              <span className="text-primary italic">FY</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground/40 leading-none">
                 PRO LEAGUE 2026
               </span>
            </div>
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-3.5 h-3.5 text-foreground/40" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-foreground/40" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setNotificationsOpen(true);
                  setPendingCount(0);
                }}
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
                      style={{ boxShadow: '0 0 8px rgba(44,252,125,0.5)' }}
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
        <div className="relative z-10 mx-5 mb-8 shrink-0">
          <Link href="/profile/me" onClick={() => isMobile && onClose && onClose()} className="block">
            <div className="group relative overflow-hidden rounded-[2rem] glass-premium p-1 cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] border-primary/10 hover:border-primary/30">
              {/* Internal padding container */}
              <div className="p-4 rounded-[1.9rem] bg-background/40">
                <div className="flex items-center gap-4 relative z-10">
                  {/* Avatar with Ring */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-surface border border-white/5 flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-xl text-primary font-kanit">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>
                    {/* Status Dot */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-background bg-primary shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
                  </div>
  
                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="text-[13px] font-black text-foreground italic uppercase tracking-tighter truncate leading-none">
                      {user.name || 'Usuario'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[7px] font-black text-primary uppercase tracking-widest border border-primary/20">
                          {rank.name}
                       </span>
                       <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.1em]">
                          {elo} PTS
                       </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-foreground/[0.03] border border-white/5 group-hover:bg-primary group-hover:text-background transition-all duration-500">
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-0.5 no-scrollbar min-h-0">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 mb-1.5 mt-1 text-foreground/55">
          Navegación
        </span>

        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={index}
              href={item.href}
              onClick={() => isMobile && onClose && onClose()}
              className="relative group"
            >
              <div
                className={`relative flex items-center justify-between px-3 py-3 rounded-[0.875rem] transition-all duration-200 overflow-hidden ${
                  isActive ? '' : 'hover:bg-foreground/[0.04] hover:translate-x-0.5'
                }`}
                style={
                  isActive
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(44,252,125,0.12) 0%, rgba(44,252,125,0.05) 100%)',
                        border: '1px solid rgba(44,252,125,0.15)',
                      }
                    : {
                        border: '1px solid transparent',
                      }
                }
              >
                {/* Active left bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                    style={{ background: 'linear-gradient(180deg, #5dfd9d, #2cfc7d)' }}
                  />
                )}

                {/* Hover shimmer - simplified */}
                {!isActive && !performanceMode && (
                  <div
                    className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(var(--foreground-rgb),0.03), transparent)',
                    }}
                  />
                )}

                <div className="flex items-center gap-3 relative z-10 pl-1">
                  <item.icon
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isActive
                        ? 'text-primary'
                        : 'text-foreground/35 group-hover:text-foreground/65'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-black tracking-widest transition-colors uppercase italic',
                      isActive
                        ? 'text-foreground'
                        : 'text-foreground/75 group-hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className="relative z-10 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[9px] font-black bg-primary/90 text-background"
                    style={{ boxShadow: '0 0 10px rgba(44,252,125,0.35)' }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* ── Quick Create CTA ── */}
        <div className="mt-4 px-1">
          <div
            className="h-px mb-4"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(var(--foreground-rgb),0.1), transparent)',
            }}
          />
          <Link href="/create" onClick={() => isMobile && onClose && onClose()}>
            <motion.button
              whileHover={performanceMode ? {} : { scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full h-11 rounded-[0.875rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 text-background relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 50%, #1db95a 100%)',
                boxShadow: performanceMode ? 'none' : '0 6px 20px rgba(44,252,125,0.3)',
              }}
            >
              {!performanceMode && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    animation: 'shimmer 1s ease',
                  }}
                />
              )}
              <PlusCircle
                className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500 relative z-10"
                strokeWidth={2.5}
              />
              <span className="relative z-10">Armar Partido</span>
            </motion.button>
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={`relative z-10 p-4 shrink-0 ${isMobile ? 'pb-8' : ''}`}>
        <div
          className="h-px mb-4"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(var(--foreground-rgb),0.1), transparent)',
          }}
        />
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
});

export function Sidebar() {
  const { isOpen, closeSidebar: onClose } = useSidebar();
  const { performanceMode } = useSettings();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (isOpen) onClose();
  }, [pathname]);

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
            transition={
              performanceMode
                ? { duration: 0.15, ease: 'easeOut' }
                : { type: 'tween', duration: 0.25, ease: 'easeOut' }
            }
            className="absolute inset-y-0 left-0 w-[290px] flex flex-col shadow-2xl sidebar-container will-change-transform"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              backdropFilter: performanceMode ? 'none' : 'blur(12px)',
              borderRight: '1px solid rgba(var(--foreground-rgb),0.08)',
              boxShadow: performanceMode ? 'none' : '20px 0 60px rgba(0,0,0,0.3)',
            }}
          >
            <SidebarContent isMobile onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
