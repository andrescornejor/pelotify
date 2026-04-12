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
  UserPlus,
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
    <div className="mb-5 last:mb-2">
      <div className="px-5 mb-1.5 flex items-center gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/25">
          {group.title}
        </span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-foreground/[0.04] to-transparent" />
      </div>
      <div className="space-y-0.5 px-3">
        {group.items.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== '/' && (pathname + '/').startsWith(item.href + '/'));
          return (
            <Link
              key={item.href + idx}
              href={item.href}
              onClick={() => isMobile && onClose && onClose()}
              className="block group"
            >
              <div
                className={cn(
                  "relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-300 overflow-hidden",
                  isActive
                    ? "bg-primary/8 active-glow-line"
                    : "hover:bg-foreground/[0.03] border border-transparent"
                )}
              >
                <div className="flex items-center gap-3 relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                    isActive 
                      ? "bg-primary/10" 
                      : "bg-foreground/[0.03] group-hover:bg-foreground/[0.05]"
                  )}>
                    <item.icon
                      className={cn(
                        "w-4 h-4 transition-all duration-300",
                        isActive ? "text-primary" : "text-foreground/35 group-hover:text-foreground/60"
                      )}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[12px] font-bold tracking-wide transition-all duration-300",
                      isActive ? "text-foreground" : "text-foreground/50 group-hover:text-foreground/80"
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 relative z-10">
                  {item.isPro && !isActive && (
                    <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/8 text-amber-500/70 border border-amber-500/15">
                      PRO
                    </span>
                  )}
                  {item.isNew && !isActive && (
                    <span className="ticker-badge text-[7px] py-0.5">
                      NEW
                    </span>
                  )}
                  {item.badge && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-background text-[9px] font-black rounded-full" style={{ boxShadow: '0 0 8px rgba(44,252,125,0.3)' }}>
                      {item.badge}
                    </span>
                  )}
                  {!isActive && (
                    <ChevronRight className="w-3 h-3 text-foreground/15 group-hover:text-foreground/30 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5" />
                  )}
                </div>
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
      title: "Premium",
      items: [
        { icon: Star, label: 'Pelotify Pro', href: '/pro', isPro: true },
      ]
    },
    {
      title: "Jugar",
      items: [
        { icon: HomeIcon, label: 'Inicio', href: '/' },
        { icon: Search, label: 'Buscar Partidos', href: '/search' },
        { icon: UserPlus, label: 'Mercado Fichajes', href: '/recruitment', isNew: true },
        { icon: MapPin, label: 'Sedes en tu zona', href: '/establecimientos', isPro: true },
        { icon: Target, label: 'Torneos/Copas', href: '/tournaments', isNew: true },
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
    <div className="flex flex-col h-full overflow-hidden relative bg-background/80">
      {/* ── Visual Backdrop ── */}
      {!performanceMode && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[40%] bg-primary/15 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-5%] left-[-10%] w-[60%] h-[30%] bg-blue-500/8 blur-[80px] rounded-full" />
        </div>
      )}

      {/* ── Top Header ── */}
      <div className="relative z-10 px-5 py-5 pb-3 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group/logo">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover/logo:scale-105">
            {!performanceMode && (
              <div className="absolute inset-0 bg-primary/15 blur-[10px] rounded-full opacity-50" />
            )}
            <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-[-0.03em] uppercase leading-none font-kanit text-foreground">
              PELOTI<span className="text-primary">FY</span>
            </span>
            <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-foreground/20 mt-0.5 leading-none">
              DOMINÁ <span className="text-primary/40">EL POTRERO</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground/[0.03] border border-foreground/[0.04] hover:bg-foreground/[0.06] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-foreground/40" /> : <Moon className="w-3.5 h-3.5 text-foreground/40" />}
          </motion.button>

          {isMobile && onClose && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground/[0.03] border border-foreground/[0.04] ml-0.5">
              <X className="w-3.5 h-3.5 text-foreground/35" />
            </button>
          )}
        </div>
      </div>

      {/* ── User Profile Card — Credential Badge ── */}
      {user && (
        <div className="relative z-10 px-3 mb-4 shrink-0 group">
          <Link href="/profile/me" onClick={() => isMobile && onClose && onClose()}>
            <div className="relative overflow-hidden rounded-2xl card-stadium p-3.5 transition-all duration-500 hover:scale-[1.01] active:scale-[0.99]">
              <div className="relative flex items-center gap-3.5">
                {/* Avatar with Rank Ring */}
                <div className="relative shrink-0">
                  <div 
                    className="w-12 h-12 rounded-xl p-[2px] overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${rank.color}40, ${rank.color}15)` }}
                  >
                    <div className="w-full h-full rounded-[0.6rem] bg-background/60 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User2 className="w-5 h-5 text-primary/30" />
                      )}
                    </div>
                  </div>
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-md border-2 border-background flex items-center justify-center"
                    style={{ background: rank.color }}
                  >
                    <RankIcon className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold text-foreground truncate leading-tight">
                    {user.name || 'Invitado'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest border"
                      style={{
                        color: rank.color,
                        borderColor: `${rank.color}25`,
                        background: `${rank.color}0a`
                      }}
                    >
                      {rank.name}
                    </div>
                    <span className="text-[10px] font-bold text-foreground/30 scoreboard-num">
                      {elo} <span className="text-[7px] opacity-50">PTS</span>
                    </span>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-foreground/[0.03] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 border border-foreground/[0.04]">
                  <ChevronRight className="w-3.5 h-3.5 text-foreground/20" />
                </div>
              </div>

              {/* Rank Progress */}
              <div className="mt-3 pt-2.5 border-t border-foreground/[0.04] flex items-center gap-2">
                <div className="flex-1 h-1 bg-foreground/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(elo % 1000) / 10}%` }}
                    className="h-full rounded-full"
                    style={{ background: rank.color }}
                  />
                </div>
                <span className="text-[7px] font-bold text-foreground/20 uppercase tracking-wider scoreboard-num">
                  {1000 - (elo % 1000)} left
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Navigation Groups ── */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar min-h-0 py-1">
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
        "relative z-10 p-3 shrink-0 transition-all",
        isMobile ? "pb-6" : "pb-3"
      )}>
        <div className="bg-foreground/[0.02] border border-foreground/[0.04] rounded-xl overflow-hidden">
          <Link href="/settings" onClick={() => isMobile && onClose && onClose()} className="block">
            <div className="px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-foreground/[0.03] transition-colors group">
              <Settings className="w-3.5 h-3.5 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <span className="text-[11px] font-bold text-foreground/40 group-hover:text-foreground/60">
                Ajustes
              </span>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-500/[0.04] transition-colors group"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500/30 group-hover:text-red-500/60 transition-colors" />
            <span className="text-[11px] font-bold text-red-500/40 group-hover:text-red-500/70">
              Cerrar Sesión
            </span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 opacity-15">
          <LayoutGrid className="w-2.5 h-2.5" />
          <span className="text-[7px] font-bold uppercase tracking-[0.25em]">Pelotify v2.4</span>
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
            className="absolute inset-0"
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: performanceMode ? 'none' : 'blur(4px)',
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
              stiffness: 420,
              damping: 42,
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-y-0 left-0 w-[290px] flex flex-col shadow-2xl will-change-transform noise-texture"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              backdropFilter: performanceMode ? 'none' : 'blur(20px) saturate(160%)',
              borderRight: '1px solid rgba(var(--foreground-rgb), 0.06)',
            }}
          >
            {/* Header ambient glow */}
            {!performanceMode && (
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
            )}

            <SidebarContent isMobile onClose={onClose} />

            {/* Decorative edge line */}
            <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-foreground/[0.06] to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
