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
    if (elo < 1000) return { name: 'ROOKIE', color: '#94a3b8' };
    if (elo < 3000) return { name: 'AMATEUR', color: '#60a5fa' };
    if (elo < 6000) return { name: 'PREMIER', color: '#10b981' };
    if (elo < 10000) return { name: 'ELITE', color: '#f59e0b' };
    return { name: 'WORLD CLASS', color: '#34d399' };
  };
  const rank = getRankName(elo);

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-black">
      {!performanceMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05]">
          <div className="absolute top-[-20%] right-[-30%] w-[70%] h-[50%] rounded-full bg-primary blur-[100px]" />
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 px-8 pt-10 pb-8 flex items-center justify-between shrink-0">
        <Link href="/" onClick={() => isMobile && onClose && onClose()} className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center p-2 border border-white/10">
            <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-black italic uppercase italic font-kanit">
             PELOTI<span className="text-primary">FY</span>
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          {!isMobile && (
             <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white"
             >
               {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
          )}
          {isMobile && onClose && (
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/10">
              <X className="w-4 h-4 text-white/50" />
            </button>
          )}
        </div>
      </div>

      {/* User Card */}
      {user && (
        <div className="px-6 mb-8 shrink-0">
          <Link href="/profile/me" onClick={() => isMobile && onClose && onClose()} className="block group">
            <div className="relative overflow-hidden rounded-3xl p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
                    {metadata.avatar_url ? (
                      <img src={metadata.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User2 className="w-6 h-6 text-white/10" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black italic uppercase truncate">{metadata.name || 'CAPITÁN'}</h4>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">{rank.name}</p>
                  </div>
               </div>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6 space-y-1 no-scrollbar">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={index} href={item.href} onClick={() => isMobile && onClose && onClose()} className="block">
              <div className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all",
                isActive ? "bg-primary/10 border border-primary/20 text-white" : "text-white/40 hover:bg-white/5 hover:text-white border border-transparent"
              )}>
                <div className="flex items-center gap-4">
                  <item.icon className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[7px] font-black text-primary">{item.badge}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="relative z-10 p-8 shrink-0">
        <button onClick={logout} className="w-full py-4 rounded-2xl bg-red-500/5 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
           <LogOut className="w-4 h-4" /> Cerrar Sesión
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

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (isOpen) onClose(); }, [pathname]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000]">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 w-[280px] bg-black border-r border-white/5"
          >
            <SidebarContent isMobile onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
