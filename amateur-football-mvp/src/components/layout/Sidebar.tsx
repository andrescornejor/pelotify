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
  MapPin,
  ChevronRight,
  Star,
  Award,
  Crown,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { getPendingRequestsCount } from '@/lib/friends';
import { getMatchInvitationsCount } from '@/lib/matches';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

// --- Types ---
interface NavItem {
  icon: any;
  label: string;
  href: string;
  badge?: string | number | null;
  isPro?: boolean;
  isNew?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// --- Sub-components ---

const SidebarGroup = ({
  group,
  pathname,
  onClose,
  isMobile
}: {
  group: NavGroup;
  pathname: string;
  onClose?: () => void;
  isMobile: boolean;
}) => {
  return (
    <div className="mb-6 last:mb-2">
      <div className="px-5 mb-2 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/30 font-kanit italic">
          {group.title}
        </span>
      </div>
      <div className="space-y-1 px-3">
        {group.items.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href + idx}
              href={item.href}
              onClick={() => isMobile && onClose && onClose()}
              className="block group"
            >
              <div
                className={cn(
                  "relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 overflow-hidden",
                  isActive
                    ? "bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(44,252,125,0.05)]"
                    : "hover:bg-foreground/[0.03] border border-transparent"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-3 relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                  <item.icon
                    className={cn(
                      "w-[1.1rem] h-[1.1rem] transition-all duration-300",
                      isActive ? "text-primary scale-110" : "text-foreground/40 group-hover:text-foreground/70"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      "text-[11px] font-black tracking-wider uppercase italic transition-all duration-300",
                      isActive ? "text-foreground" : "text-foreground/60 group-hover:text-foreground/90"
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  {item.isPro && !isActive && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 italic">
                      PRO
                    </span>
                  )}
                  {item.isNew && !isActive && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 italic">
                      NEW
                    </span>
                  )}
                  {item.badge && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-background text-[9px] font-black rounded-full shadow-[0_0_10px_rgba(44,252,125,0.4)]">
                      {item.badge}
                    </span>
                  )}
                  {!isActive && (
                    <ChevronRight className="w-3 h-3 text-foreground/20 group-hover:text-foreground/40 transition-all opacity-0 group-hover:opacity-100" />
                  )}
                </div>

                {/* Subtle hover glow */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.03] to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

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
  const { setNotificationsOpen } = useSidebar();
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

  const navigationGroups: NavGroup[] = useMemo(() => [
    {
      title: "Jugar",
      items: [
        { icon: HomeIcon, label: 'Inicio', href: '/' },
        { icon: Search, label: 'Buscar Partidos', href: '/search' },
        { icon: MapPin, label: 'Sedes en tu zona', href: '/establecimientos', isPro: true },
        { icon: Target, label: 'Torneos/Copas', href: '/tournaments', isNew: true },
        { icon: Zap, label: 'Fichajes / Mercado', href: '/recruitment', isPro: true },
      ]
    },
    {
      title: "Social",
      items: [
        { icon: MessageSquare, label: 'Chats', href: '/messages' },
        {
          icon: Users,
          label: 'Amigos',
          href: '/friends',
          badge: pendingCount > 0 && pathname !== '/friends' ? pendingCount : null
        },
        { icon: Flame, label: 'Futtok Moments', href: '/highlights', isNew: true },
        { icon: Shield, label: 'Mis Equipos', href: '/teams' },
      ]
    },
    {
      title: "Competición",
      items: [
        { icon: Trophy, label: 'Ranking Global', href: '/ranks' },
      ]
    }
  ], [pendingCount, pathname]);

  const metadata = user?.user_metadata || {};
  const elo = metadata?.elo || 0;

  const getRankInfo = (elo: number) => {
    if (elo < 1000) return { name: 'ROOKIE', color: '#94a3b8', icon: Star };
    if (elo < 3000) return { name: 'AMATEUR', color: '#60a5fa', icon: Shield };
    if (elo < 6000) return { name: 'PREMIER', color: '#10b981', icon: Trophy };
    if (elo < 10000) return { name: 'ELITE', color: '#f59e0b', icon: Crown };
    return { name: 'WORLD CLASS', color: '#ec4899', icon: Zap };
  };

  const rank = getRankInfo(elo);
  const RankIcon = rank.icon;

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-background/50">
      {/* ── Visual Backdrop ── */}
      {!performanceMode && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[40%] bg-primary/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-5%] left-[-10%] w-[60%] h-[30%] bg-blue-500/10 blur-[80px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--foreground-rgb),0.02)_0%,transparent_100%)]" />
        </div>
      )}

      {/* ── Top Header ── */}
      <div className="relative z-10 px-6 py-6 pb-4 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-3 group/logo">
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover/logo:scale-110">
            <div className="absolute inset-0 bg-primary/20 blur-[12px] rounded-2xl opacity-50" />
            <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black italic tracking-tighter uppercase leading-none font-kanit text-foreground">
              PELOTI<span className="text-primary">FY</span>
            </span>
            <span className="text-[6.5px] font-black uppercase tracking-[0.25em] text-foreground/30 mt-1 leading-none font-outfit">
              DOMINÁ EL POTRERO
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-foreground/[0.04] border border-foreground/5 hover:bg-foreground/[0.08] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-foreground/50" /> : <Moon className="w-4 h-4 text-foreground/50" />}
          </motion.button>

          {isMobile && onClose && (
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-foreground/[0.04] border border-foreground/5 ml-1">
              <X className="w-4 h-4 text-foreground/40" />
            </button>
          )}
        </div>
      </div>

      {/* ── User Profile Card ( FIFA Style ) ── */}
      {user && (
        <div className="relative z-10 px-4 mb-6 shrink-0 group">
          <Link href="/profile/me" onClick={() => isMobile && onClose && onClose()}>
            <div className="relative overflow-hidden rounded-3xl p-4 border border-foreground/10 shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
              {/* Card Surface */}
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.05] to-transparent backdrop-blur-xl" />

              {/* Dynamic Glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-all duration-700" />

              <div className="relative flex items-center gap-4">
                {/* Avatar with Ring */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br from-primary/40 via-primary/10 to-transparent border border-foreground/10 shadow-lg overflow-hidden">
                    <div className="w-full h-full rounded-[0.85rem] bg-background/40 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User2 className="w-6 h-6 text-primary/40" />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center shadow-lg">
                    <RankIcon className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-black text-foreground italic uppercase tracking-tight truncate leading-tight">
                    {user.name || 'Invitado'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="px-2 py-0.5 rounded-lg text-[8px] font-black italic uppercase tracking-widest border"
                      style={{
                        color: rank.color,
                        borderColor: `${rank.color}33`,
                        background: `${rank.color}11`
                      }}
                    >
                      {rank.name}
                    </div>
                    <span className="text-[10px] font-black text-foreground/40 italic">
                      {elo} <span className="text-[8px] opacity-60">PTS</span>
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 border border-foreground/5">
                  <ChevronRight className="w-4 h-4 text-foreground/30" />
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(elo % 1000) / 10}%` }}
                    className="h-full bg-primary rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/30 blur-sm" />
                  </motion.div>
                </div>
                <span className="text-[8px] font-black text-foreground/20 italic uppercase tracking-tighter">
                  PARA EL SIGUIENTE LVL: {1000 - (elo % 1000)}
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Navigation Groups ── */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar min-h-0 py-2">
        {navigationGroups.map((group, index) => (
          <SidebarGroup
            key={index}
            group={group}
            pathname={pathname}
            onClose={onClose}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className={cn(
        "relative z-10 p-4 shrink-0 transition-all",
        isMobile ? "pb-8" : "pb-4"
      )}>
        <div className="bg-foreground/[0.03] border border-foreground/5 rounded-2xl overflow-hidden">
          <Link href="/settings" onClick={() => isMobile && onClose && onClose()} className="block">
            <div className="px-4 py-3.5 flex items-center gap-3 hover:bg-foreground/[0.04] transition-colors group">
              <Settings className="w-4 h-4 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
              <span className="text-[11px] font-black uppercase italic tracking-widest text-foreground/60 group-hover:text-foreground/90">
                Ajustes / Configuración
              </span>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-red-500/[0.05] transition-colors group"
          >
            <LogOut className="w-4 h-4 text-red-500/40 group-hover:text-red-500/80 transition-colors" />
            <span className="text-[11px] font-black uppercase italic tracking-widest text-red-500/60 group-hover:text-red-500/90">
              Cerrar Sesión Activa
            </span>
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-1 opacity-20">
          <div className="flex items-center gap-1.5">
            <LayoutGrid className="w-2.5 h-2.5" />
            <span className="text-[7px] font-black uppercase tracking-[0.3em]">Pelotify Engine v2.4.0</span>
          </div>
        </div>
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)'
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 40,
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-y-0 left-0 w-[310px] flex flex-col shadow-2xl sidebar-container will-change-transform"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              backdropFilter: performanceMode ? 'none' : 'blur(20px) saturate(160%)',
              borderRight: '1px solid var(--border)',
              boxShadow: performanceMode ? 'none' : 'var(--shadow-xl)',
            }}
          >
            {/* Header ambient glow */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <SidebarContent isMobile onClose={onClose} />

            {/* Decorative edge line */}
            <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
