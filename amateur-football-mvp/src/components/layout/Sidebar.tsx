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
  MessageSquare,
  Zap,
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
    { icon: Zap, label: 'Fichajes', href: '/recruitment', badge: 'PRUEBA' },
    { icon: Search, label: 'Buscar Partidos', href: '/search' },
    { icon: User2, label: 'Mi Perfil', href: '/profile/me' },
    { icon: MessageSquare, label: 'Chats', href: '/messages' },
    { icon: Flame, label: 'FutTok', href: '/highlights', badge: 'NUEVO' },
    {
      icon: Users,
      label: 'Amigos',
      href: '/friends',
      badge: pendingCount > 0 && pathname !== '/friends' ? pendingCount : null,
    },
    { icon: Shield, label: 'Equipos', href: '/teams' },
    { icon: Settings, label: 'ConfiguraciÃ³n', href: '/settings' },
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
      {/* â”€â”€ Ambient background - Optimized â”€â”€ */}
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

      {/* â”€â”€ Top border â”€â”€ */}
      {!isMobile && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(44,252,125,0.2), transparent)',
          }}
        />
      )}

      {/* â”€â”€ Logo Header â”€â”€ */}
      <div className="relative z-10 px-6 pt-7 pb-5 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <Link
            href="/"
            onClick={() => isMobile && onClose && onClose()}
            className="flex items-center gap-2.5 group/logo"
          >
            <div className="w-16 h-16 flex items-center justify-center relative shrink-0 transition-transform duration-500 group-hover/logo:scale-110">
              {!performanceMode && (
                <div className="absolute inset-0 bg-primary/20 blur-[15px] rounded-full opacity-40 shrink-0" />
              )}
              <img
                src="/logo_pelotify.png"
                alt="Logo"
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-[900] tracking-[-0.04em] font-kanit uppercase italic leading-tight flex items-center gap-0 group-hover/logo:text-primary transition-all pr-4">
                <span className="text-foreground">PELOTI</span>
                <span
                  className="px-2 -mx-2"
                  style={{
                    background: 'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 50%, #1db95a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  FY
                </span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] leading-none mt-0.5 text-foreground/55">
                DominÃ¡ el Potrero
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
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-background text-[10px] font-black rounded-full flex items-center justify-center border border-background"
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

      {/* â”€â”€ User Card â”€â”€ */}
      {user && (
        <div className="relative z-10 mx-4 mb-5 shrink-0">
          <Link href="/profile/me" onClick={() => isMobile && onClose && onClose()}>
            <div
              className="group relative overflow-hidden rounded-[1.25rem] p-4 cursor-pointer transition-transform duration-200 hover:scale-[1.015]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(44,252,126,0.06) 0%, rgba(44,252,125,0.02) 100%)',
                border: '1px solid rgba(44,252,125,0.12)',
              }}
            >
              {/* Background shine on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(ellipse at 30% 50%, rgba(44,252,125,0.08) 0%, transparent 80%)',
                }}
              />

              <div className="flex items-center gap-3 relative z-10">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-11 h-11 rounded-[0.875rem] flex items-center justify-center overflow-hidden"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(44,252,125,0.2), rgba(44,252,125,0.08))',
                      border: '1.5px solid rgba(44,252,125,0.3)',
                      boxShadow: '0 4px 16px rgba(44,252,125,0.15)',
                    }}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-lg text-primary">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  {/* Online dot */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
                    style={{ background: '#2cfc7d', boxShadow: '0 0 6px rgba(44,252,125,0.6)' }}
                  />
                </div>

                <div className="flex flex-col min-w-0 pr-1">
                  <p className="text-sm font-black text-foreground italic uppercase tracking-tighter truncate">
                    {user.name || 'Usuario'}
                  </p>
                  <p className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] mt-0.5">
                    #{user?.id?.slice(0, 5) || '00000'}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: rank.color }}
                    >
                      {rank.name}
                    </span>
                    <span className="text-[10px] text-foreground/25 font-black">Â·</span>
                    <span className="text-[10px] font-black text-foreground/35 uppercase tracking-widest">
                      {elo} ELO
                    </span>
                  </div>
                </div>

                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(44,252,125,0.12)' }}
                >
                  <svg
                    className="w-3 h-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* â”€â”€ Navigation â”€â”€ */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-0.5 no-scrollbar min-h-0">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 mb-1.5 mt-1 text-foreground/55">
          NavegaciÃ³n
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
                    className="relative z-10 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black bg-primary/90 text-background"
                    style={{ boxShadow: '0 0 10px rgba(44,252,125,0.35)' }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* â”€â”€ Quick Create CTA â”€â”€ */}
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

      {/* â”€â”€ Footer â”€â”€ */}
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
          Cerrar SesiÃ³n
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
