'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Target,
  Users,
  Calendar,
  Zap,
  Star,
  Activity,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  PlusCircle,
  Search,
  MessageSquare,
  Flame,
  User2,
  Sparkles,
  Award,
  Shield,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/OnboardingTour';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';

// --- TYPES & CONSTANTS ---

interface Rank {
  name: string;
  minElo: number;
  color: string;
  icon: any;
}

const RANKS: Rank[] = [
  { name: 'HIERRO', minElo: 0, color: '#94a3b8', icon: Shield },
  { name: 'BRONCE', minElo: 500, color: '#d97706', icon: Activity },
  { name: 'PLATA', minElo: 1000, color: '#94a3b8', icon: Target },
  { name: 'ORO', minElo: 1500, color: '#fbbf24', icon: Trophy },
  { name: 'PLATINO', minElo: 2000, color: '#2dd4bf', icon: Award },
  { name: 'DIAMANTE', minElo: 2500, color: '#3b82f6', icon: Sparkles },
  { name: 'ELITE', minElo: 3000, color: '#8b5cf6', icon: Star },
  { name: 'MAESTRO', minElo: 3500, color: '#f43f5e', icon: Crown },
  { name: 'PELOTIFY', minElo: 4000, color: '#2cfc7d', icon: Zap },
];

const getRankByElo = (elo: number) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (elo >= RANKS[i].minElo) return RANKS[i];
  }
  return RANKS[0];
};

// --- COMPONENTS ---

const SectionDivider = () => (
  <div className="flex items-center gap-4 py-4 lg:py-8 opacity-20">
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground to-transparent" />
    <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
    <div className="h-[1px] flex-1 bg-gradient-to-r from-foreground via-foreground to-transparent" />
  </div>
);

const RankBadge = ({ rankName, size = 'md', className }: { rankName: string; size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const rank = RANKS.find(r => r.name === rankName) || RANKS[0];
  const Icon = rank.icon;

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeMap[size], className)}>
      <div 
        className="absolute inset-0 blur-xl rounded-full opacity-40" 
        style={{ backgroundColor: rank.color }}
      />
      <div className="relative z-10 flex items-center justify-center">
        <Icon 
          className={cn(iconSizeMap[size], "drop-shadow-lg")} 
          style={{ color: rank.color }} 
        />
      </div>
    </div>
  );
};

const StatCard = ({ stat, i, isPerfMode, fadeUp }: any) => (
  <motion.div
    variants={fadeUp}
    custom={i}
    whileHover={isPerfMode ? {} : { y: -5, scale: 1.02 }}
    className={cn(
      'group relative overflow-hidden p-5 rounded-[2rem] glass-premium transition-all duration-300 border-white/5',
      isPerfMode && 'bg-surface shadow-none'
    )}
  >
    {/* Glow effect */}
    {!isPerfMode && (
      <div
        className="absolute -right-4 -top-4 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full"
        style={{ backgroundColor: stat.color }}
      />
    )}

    <div className="relative z-10 space-y-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center glass border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500"
        style={{ backgroundColor: `${stat.color}15` }}
      >
        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
      </div>
      <div>
        <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] font-outfit">
          {stat.label}
        </p>
        <div className="flex items-end gap-1">
          <h3 className="text-2xl font-black italic tracking-tighter text-foreground font-kanit">
            {stat.value}
          </h3>
          {!isPerfMode && (
            <TrendingUp className="w-3 h-3 text-primary mb-1 opacity-60 group-hover:translate-y--0.5 group-hover:translate-x-0.5 transition-transform" />
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const TeamCard = ({ team, isPerfMode }: any) => {
  const teamColor = team.primary_color || '#2cfc7d';
  
  return (
    <Link href={`/team?id=${team.id}`} className="block">
      <motion.div
        whileHover={isPerfMode ? {} : { scale: 1.01, y: -4 }}
        className="group flex flex-col sm:flex-row items-center justify-between gap-5 p-6 rounded-[2.5rem] glass-premium border-white/5 hover:border-primary/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4),0_0_30px_rgba(44,252,125,0.1)] transition-all cursor-pointer relative overflow-hidden"
      >
        {/* Animated background glow based on team color */}
        {!isPerfMode && (
          <div 
            className="absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700"
            style={{ backgroundColor: teamColor }}
          />
        )}
        
        <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="relative group/avatar">
              {/* Avatar background glow */}
              {!isPerfMode && (
                <div 
                  className="absolute inset-0 blur-2xl rounded-full scale-0 group-hover/avatar:scale-150 transition-transform duration-1000 opacity-0 group-hover/avatar:opacity-30"
                  style={{ backgroundColor: teamColor }}
                />
              )}
              
              <div 
                className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-primary/40 transition-all duration-500 shadow-inner relative z-10"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {team.logo_url ? (
                  <img 
                  src={team.logo_url} 
                  alt={team.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="p-3 w-full h-full">
                    <JerseyVisualizer 
                      primaryColor={team.primary_color || '#18181b'} 
                      secondaryColor={team.secondary_color || '#10b981'} 
                      pattern={team.jersey_pattern || 'solid'}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Level Badge below Photo */}
            <div className="mt-2 px-3 py-1 rounded-xl bg-background border border-white/10 flex items-center justify-center shadow-lg w-full">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black text-primary uppercase tracking-tighter">LVL {Math.floor((team.elo / 500) + 1)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none group-hover:text-primary transition-colors">
              {team.name}
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                  key={i} 
                  className="w-7 h-7 rounded-full border-2 border-background bg-surface overflow-hidden hover:z-20 hover:scale-110 transition-transform flex items-center justify-center"
                  >
                    <User2 className="w-4 h-4 text-foreground/20" />
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary z-10 backdrop-blur-sm">
                  +{team.members_count || 0}
                </div>
              </div>
              <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <Shield className="w-3 h-3 text-primary/40" />
                <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-outfit">
                  {team.elo > 1000 ? 'Club de Élite' : 'Club Verificado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Action */}
        <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="hidden lg:flex flex-col items-end opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] text-right">Ver Sede Central</span>
            <span className="text-[9px] font-medium text-foreground/30 italic text-right mt-0.5">Gestionar club y plantel</span>
          </div>
          <div 
            className="w-14 h-14 rounded-2xl bg-foreground/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-500 shadow-sm group-hover:shadow-[0_10px_20px_rgba(44,252,125,0.2)] group-hover:scale-110"
          >
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-500" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const EmptyState = ({ icon: Icon, title, description, actionText, actionHref }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    className="w-full py-12 px-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 glass-premium border-white/5 bg-foreground/[0.01] relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="w-16 h-16 rounded-[2rem] bg-surface flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 text-foreground/20 group-hover:text-primary/40 transition-colors" />
    </div>
    <div className="space-y-2 relative z-10">
      <h5 className="text-lg font-black italic uppercase tracking-tighter text-foreground font-kanit">{title}</h5>
      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">
        {description}
      </p>
    </div>
    {actionText && actionHref && (
      <Link href={actionHref}>
        <button className="px-8 h-10 rounded-xl bg-foreground/[0.03] hover:bg-primary hover:text-background border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] transition-all">
          {actionText}
        </button>
      </Link>
    )}
  </motion.div>
);

export default function HomePage() {
  const { user } = useAuth();
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isPerfMode, setIsPerfMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Performance Detection
  useEffect(() => {
    const isLite = localStorage.getItem('perf-mode-lite') === 'true';
    if (isLite) setIsPerfMode(true);

    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(window.scrollY / total);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const togglePerfMode = () => {
    const newVal = !isPerfMode;
    setIsPerfMode(newVal);
    localStorage.setItem('perf-mode-lite', String(newVal));
  };

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const [teamsRes, matchesRes, playersCountRes] = await Promise.all([
          supabase.from('team_members').select('team_id, teams(*)').eq('user_id', user.id).limit(3),
          supabase.from('matches').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }).order('time', { ascending: true }).limit(1),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ]);

        if (teamsRes.data) setUserTeams(teamsRes.data.map((t) => t.teams).filter(Boolean));
        if (matchesRes.data?.[0]) setNextMatch(matchesRes.data[0]);
        if (playersCountRes.count) setTotalPlayers(playersCountRes.count);

        // Fetch Recent Members as real activity
        const { data: recentProfiles } = await supabase
          .from('profiles')
          .select('full_name, created_at, elo')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentProfiles) {
          setActivities(recentProfiles.map(p => ({
            type: 'RANK_UP',
            user: p.full_name || 'Nuevo Jugador',
            detail: `se ha unido a la liga`,
            time: 'Reciente'
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buen dia');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    fetchData();
  }, [user?.id]);

  // Handle Countdown Update
  useEffect(() => {
    if (!nextMatch) {
      setCountdownText(null);
      return;
    }

    const updateCountdown = () => {
      const target = new Date(`${nextMatch.date}T${nextMatch.time}`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdownText('YA EMPIEZA! ');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours >= 24) {
        setCountdownText(null);
        return;
      }

      if (hours > 0) {
        setCountdownText(`FALTAN ${hours}H ${minutes}M`);
      } else {
        setCountdownText(`EN SOLO ${minutes} MINUTOS`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextMatch]);

  const metadata = user?.user_metadata || {};

  const statsSummary = useMemo(() => {
    const elo = metadata?.elo || 0;
    const totalMatches = metadata?.matches || 0;
    const matchesWon = metadata?.matches_won || 0;
    const winRate =
      totalMatches > 0 ? Math.min(100, Math.round((matchesWon / totalMatches) * 100)) : 0;

    return { elo, totalMatches, matchesWon, winRate };
  }, [metadata]);

  const rankCalculation = useMemo(() => {
    const info = getRankByElo(statsSummary.elo);
    const nextR = RANKS[RANKS.findIndex((rank) => rank.name === info.name) + 1] || info;
    const progress =
      nextR.minElo > 0 ? Math.min(100, (statsSummary.elo / nextR.minElo) * 100) : 100;

    const rankObj = {
      name: info.name,
      color: 'text-primary',
      glow: `${info.color}40`,
      hex: info.color,
      icon: info.icon,
    };

    if (rankObj.name === 'HIERRO') {
      rankObj.color = 'text-slate-400';
    } else if (rankObj.name === 'BRONCE') {
      rankObj.color = 'text-amber-600';
    } else if (rankObj.name === 'PLATA') {
      rankObj.color = 'text-slate-300';
    } else if (rankObj.name === 'ORO') {
      rankObj.color = 'text-yellow-400';
    } else if (rankObj.name === 'PLATINO') {
      rankObj.color = 'text-emerald-400';
    } else if (rankObj.name === 'DIAMANTE') {
      rankObj.color = 'text-blue-400';
    } else if (rankObj.name === 'ELITE') {
      rankObj.color = 'text-violet-400';
    } else if (rankObj.name === 'MAESTRO') {
      rankObj.color = 'text-rose-400';
    } else {
      rankObj.color = 'text-primary';
    }

    return { info, nextRank: nextR, progress, rank: rankObj };
  }, [statsSummary.elo]);

  const userName = user?.name || 'Jugador';

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 280, damping: 24, delay: i * 0.07 },
    }),
  };

  const statCardsData = useMemo(
    () => [
      {
        icon: Trophy,
        label: 'Rango Actual',
        value: rankCalculation.rank.name,
        color: rankCalculation.rank.hex,
        glow: rankCalculation.rank.glow,
        tooltip: 'Tu rango competitivo',
      },
      {
        icon: Activity,
        label: 'Partidos',
        value: statsSummary.totalMatches,
        color: '#6366f1',
        glow: 'rgba(99,102,241,0.2)',
        tooltip: 'Partidos jugados',
      },
      {
        icon: Star,
        label: 'MVPs',
        value: metadata?.mvp_count || 0,
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.2)',
        tooltip: 'Veces elegido MVP',
      },
      {
        icon: TrendingUp,
        label: 'Win Rate',
        value: '0%',
        color: '#f43f5e',
        glow: 'rgba(244,63,94,0.2)',
        tooltip: 'Tu efectividad de victoria',
      },
    ],
    [statsSummary, metadata?.mvp_count]
  );

  return (
    <div
      className={cn(
        'relative min-h-screen bg-background font-sans selection:bg-primary selection:text-background',
        isPerfMode && 'perf-mode'
      )}
    >
      <OnboardingTour />
      {/*  SCROLL PROGRESS BAR  */}
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/*  AMBIENT  Simplified for Performance  */}
      {!isPerfMode && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden hidden md:block">
          <div
            className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
          />
        </div>
      )}

      {/*  MOBILE PERF TOGGLE  */}
      <button
        onClick={togglePerfMode}
        className={cn(
          'fixed bottom-24 right-6 z-[100] w-12 h-12 rounded-2xl md:hidden flex flex-col items-center justify-center transition-all active:scale-90 border',
          isPerfMode
            ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(44,252,125,0.4)]'
            : 'glass border-white/10 text-primary shadow-lg shadow-primary/10'
        )}
      >
        <Zap className={cn('w-5 h-5', isPerfMode && 'fill-current')} />
        <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">
          {isPerfMode ? 'LITE ON' : 'FX ON'}
        </span>
      </button>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12">
        {/* 
            HERO  full-width cinematic header
         */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl group/hero"
          style={{
            background:
              'linear-gradient(135deg, rgba(var(--foreground-rgb),0.03) 0%, rgba(var(--foreground-rgb),0.01) 100%)',
            border: '1px solid rgba(var(--foreground-rgb),0.08)',
          }}
        >
          {/* Backdrop image & Effects */}
          <div className="absolute inset-0 z-0 select-none">
            <motion.img
              initial={false}
              animate={
                isPerfMode
                  ? { scale: 1, rotate: 0 }
                  : {
                    scale: [1.02, 1.08, 1.02],
                    rotate: [0, 1, 0],
                  }
              }
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=60&w=1200"
              alt=""
              fetchPriority="high"
              className={cn(
                'w-full h-full object-cover grayscale opacity-[0.08] dark:opacity-[0.12] scale-110 transition-opacity',
                isPerfMode && 'grayscale-0 opacity-20 scale-100'
              )}
            />
            {/* Overlay gradients for depth */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90',
                isPerfMode && 'opacity-70'
              )}
            />
            {!isPerfMode && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
                <div className="absolute inset-0 backdrop-blur-[2px] opacity-40 mix-blend-overlay" />

                {/* Animated "Beam" light effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-[-25deg]"
                />
              </>
            )}
          </div>

          {/* Content Wrapper */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 p-6 sm:p-12 lg:p-16 xl:p-20">
            {/* Left: Text & Branding */}
            <div className="flex-1 space-y-6 lg:space-y-8 max-w-2xl">
              <motion.div
                initial={isPerfMode ? { opacity: 1 } : { x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={cn(
                  'inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-premium border-primary/20',
                  isPerfMode && 'bg-surface'
                )}
              >
                <div className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      'absolute inline-flex h-full w-full rounded-full bg-primary opacity-75',
                      !isPerfMode && 'animate-ping'
                    )}
                  />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/90 font-outfit">
                  {greeting}
                </span>
              </motion.div>

              {/* Title Section */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-black italic tracking-tight leading-[0.85] uppercase font-kanit"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}
                >
                  <span className="text-foreground/90 mix-blend-difference">DOMINA</span>
                  <br />
                  <span
                    className={
                      isPerfMode
                        ? 'text-primary'
                        : 'bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-primary to-primary-dark animate-gradient [text-shadow:0_0_40px_rgba(44,252,125,0.3)]'
                    }
                  >
                    LA CANCHA.
                  </span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 py-2"
                >
                  <div className="h-[2px] w-12 bg-primary/30" />
                  {/* Avatar with rank glow */}
                  <div id="hero-avatar" className="relative group/avatar">
                    <div
                      className="absolute -inset-4 blur-3xl rounded-full opacity-40 group-hover/avatar:opacity-70 transition-opacity"
                      style={{ backgroundColor: rankCalculation.rank.glow }}
                    />
                    <div
                      className="relative w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-surface shadow-2xl"
                      style={{ borderColor: rankCalculation.info.color }}
                    >
                      {metadata?.avatar_url ? (
                        <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User2 className="w-6 h-6 text-foreground/40" />
                      )}
                      
                      {/* Floating Rank Icon */}
                      <div 
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-white/10 flex items-center justify-center shadow-lg"
                      >
                         <rankCalculation.rank.icon className="w-3 h-3" style={{ color: rankCalculation.rank.hex }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground/60 text-lg font-medium font-outfit">
                    Bienvenido,{' '}
                    <span className="text-foreground font-black uppercase">{userName}</span>
                  </p>
                </motion.div>
              </div>

              {/* Stats / Rank Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 pt-2 lg:pt-4"
              >
                {[
                  {
                    label: 'Rango Actual',
                    value: rankCalculation.rank.name,
                    color: rankCalculation.rank.color,
                    icon: Trophy,
                  },
                  {
                    label: 'Partidos Jugados',
                    value: statsSummary.totalMatches,
                    color: 'text-accent',
                    icon: Calendar,
                  },
                ].map((item, idx) => (
                  <div key={idx} className={cn("space-y-1", idx === 2 && "hidden sm:block")}>
                    <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.25em] flex items-center gap-1.5">
                      <item.icon className="w-2.5 h-2.5" /> {item.label}
                    </p>
                    <p
                      className={cn(
                        'text-2xl font-black italic tracking-tighter uppercase font-kanit',
                        item.color
                      )}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Modern CTA Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="lg:shrink-0 w-full lg:w-[400px] space-y-4"
            >
              {/* Rank Progress Card */}
              <div className="glass-premium p-6 rounded-[2.5rem] border-white/5 space-y-6 relative overflow-hidden group">
                {/* Background Rank Glow */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 blur-[80px] opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: rankCalculation.info.color }}
                />

                <div className="flex items-center gap-6 relative z-10">
                  <RankBadge rankName={rankCalculation.info.name} size="lg" />
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none">
                      PROGRESO DE LIGA
                    </p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black italic text-foreground leading-none font-kanit uppercase tracking-tighter">
                        {rankCalculation.info.name}
                      </h3>
                      <rankCalculation.rank.icon className="w-5 h-5" style={{ color: rankCalculation.rank.hex }} />
                    </div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                      ESTADO DE TEMPORADA
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-2">
                       <span className="text-3xl font-black text-foreground italic font-kanit leading-none">
                        {Math.round(rankCalculation.progress)}%
                      </span>
                      <rankCalculation.nextRank.icon className="w-6 h-6 opacity-20" style={{ color: rankCalculation.nextRank.color }} />
                    </div>
                    <p className="text-[8px] font-black text-foreground/30 uppercase mt-1">
                      PARA {rankCalculation.nextRank.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="relative h-3 bg-foreground/5 rounded-full p-0.5 overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rankCalculation.progress}%` }}
                      transition={{ duration: 2, ease: 'circOut', delay: 0.8 }}
                      className="h-full rounded-full relative"
                      style={{
                        background: `linear-gradient(90deg, ${rankCalculation.info.color}, #5dfd9d)`,
                        boxShadow: `0 0 15px ${rankCalculation.info.color}40`,
                      }}
                    >
                      <div className="absolute inset-0 animate-shimmer opacity-30 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </motion.div>
                  </div>

                  <div className="flex justify-between text-[8px] font-black text-foreground/30 uppercase tracking-[0.3em]">
                    <span>PROGRESO DE TEMPORADA</span>
                    <span>SIGUIENTE NIVEL</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Link href="/create" className="col-span-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 rounded-2xl bg-emerald-500 text-background font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_15px_40px_rgba(44,252,125,0.3)] flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/10 group-hover:h-full transition-all duration-500" />
                    <PlusCircle className="w-5 h-5 relative z-10 group-hover:rotate-180 transition-transform duration-700" />
                    <span className="relative z-10">ARMAR PARTIDO</span>
                  </motion.button>
                </Link>
                
                <Link href="/highlights" className="col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 rounded-2xl bg-violet-600 text-white font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 relative overflow-hidden group border border-violet-400/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-80" />
                    <Flame className="w-4 h-4 relative z-10 animate-pulse text-orange-400" />
                    <span className="relative z-10 italic">JUGADAS TOP</span>
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-[6px] rounded-full animate-bounce z-10 border border-white/20">LIVE</div>
                  </motion.button>
                </Link>

                <Link href="/search" className="col-span-1">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 rounded-2xl glass-premium border-white/10 text-foreground/70 font-black uppercase text-[9px] tracking-[0.2em] flex items-center justify-center"
                  >
                    <Search className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 rounded-2xl glass border-white/10 text-foreground/70 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>EXPLORAR</span>
                  </motion.button>
                </Link>
                <Link href="/ranks">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 rounded-2xl glass border-white/10 text-foreground/70 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>RANKINGS</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            <motion.section
              id="stat-cards"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 snap-start scroll-mt-26"
            >
              {statCardsData.map((stat, i) => (
                <StatCard
                  key={stat.label}
                  stat={stat}
                  i={i}
                  isPerfMode={isPerfMode}
                  fadeUp={fadeUp}
                />
              ))}
            </motion.section>

            <SectionDivider />

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              whileHover={isPerfMode ? {} : { scale: 1.01 }}
              className={cn(
                'relative overflow-hidden rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 snap-start scroll-mt-26 glass-premium border-primary/10',
                isPerfMode && 'bg-surface'
              )}
            >
              {!isPerfMode && (
                <div
                  className="absolute right-0 top-0 w-full h-full opacity-10 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at 100% 0%, rgba(44,252,125,0.6) 0%, transparent 60%)',
                  }}
                />
              )}
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 glass shadow-inner border-white/5">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none font-kanit">
                    Comunidad Activa
                  </h4>
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.25em] mt-1 font-outfit">
                    <span className="text-primary text-base font-black mr-1">{totalPlayers}</span>{' '}
                    JUGADORES REGISTRADOS
                  </p>
                </div>
              </div>
              <div className="flex gap-3 relative z-10 shrink-0 w-full sm:w-auto">
                <Link href="/teams" className="flex-1 sm:flex-none">
                  <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-foreground/5 glass border-white/10 text-foreground/60 font-outfit">
                    CLUBES TOP
                  </button>
                </Link>
                <Link href="/search" className="flex-1 sm:flex-none">
                  <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.03] text-background bg-gradient-to-br from-primary to-primary-dark shadow-xl shadow-primary/20 font-outfit">
                    MAPA VIVO
                  </button>
                </Link>
              </div>
            </motion.div>

            <SectionDivider />

            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="space-y-6 snap-start scroll-mt-26"
            >
              <div className="flex items-end justify-between px-1">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl lg:text-2xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                    Road to Glory
                  </h2>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] font-outfit">
                    TU CAMINO HACIA LA LEYENDA
                  </span>
                </div>
                <div className="flex items-center gap-2 text-foreground/30">
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">
                    Nivel de Sistema
                  </span>
                  <Sparkles className="w-5 h-5 text-primary/30 shrink-0 mb-1 animate-pulse" />
                </div>
              </div>

              <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
                </div>

                <div className="relative z-10 space-y-10">
                  <div className="relative flex items-center justify-between px-4 sm:px-10">
                    <div className="absolute left-0 right-0 h-1 bg-foreground/5 top-1/2 -translate-y-1/2" />
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'circOut' }}
                      className="absolute left-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary-light top-1/2 -translate-y-1/2"
                      style={{
                        width: `${(RANKS.findIndex((rank) => rank.name === rankCalculation.info.name) / (RANKS.length - 1)) * 100}%`,
                      }}
                    />

                    {RANKS.map((rankItem, i) => {
                      const isReached = statsSummary.elo >= rankItem.minElo;
                      const isCurrent = rankCalculation.info.name === rankItem.name;

                      return (
                        <div
                          key={rankItem.name}
                          className="relative flex flex-col items-center group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500',
                              isReached
                                ? 'bg-background border-primary shadow-[0_0_15px_rgba(44,252,125,0.3)]'
                                : 'bg-surface/50 border-white/5 opacity-40 group-hover:opacity-100'
                            )}
                          >
                            <RankBadge rankName={rankItem.name} size="sm" className="scale-75" />
                          </motion.div>

                          <div
                            className={cn(
                              'absolute -bottom-8 whitespace-nowrap text-[8px] font-black uppercase tracking-tighter transition-all duration-300',
                              isCurrent
                                ? 'text-primary opacity-100 scale-110'
                                : 'text-foreground/20 opacity-0 group-hover:opacity-100 group-hover:-bottom-6'
                            )}
                          >
                            {rankItem.name}
                          </div>

                          {isCurrent && (
                            <motion.div
                              layoutId="current-rank-indicator"
                              className="absolute -top-12"
                            >
                              <div className="px-2 py-1 rounded bg-primary text-background text-[7px] font-black uppercase tracking-widest whitespace-nowrap relative">
                                TU RANGO
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    {[
                      {
                        icon: Activity,
                        color: '#2cfc7d',
                        label: 'Partidos',
                        value: statsSummary.totalMatches,
                        desc: 'Experiencia acumulada.',
                      },
                      {
                        icon: Target,
                        color: '#f59e0b',
                        label: 'Goles',
                        value: metadata?.goals || 0,
                        desc: 'Bono por efectividad.',
                      },
                      {
                        icon: Award,
                        color: '#6366f1',
                        label: 'Honores',
                        value: metadata?.mvp_count || 0,
                        desc: 'Reconocimiento MVP.',
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/[0.02] border border-white/5 group hover:bg-foreground/[0.04] transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.color}15` }}
                        >
                          <item.icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                            {item.label}
                          </p>
                          <p className="text-xl font-black italic font-kanit text-foreground">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.div
              whileHover={{ scale: 1.005 }}
              className="relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-8 glass-premium border-primary/10 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-6 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <RankBadge rankName={rankCalculation.info.name} size="md" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none font-kanit">
                    Dominio de la Liga {rankCalculation.info.name}
                  </h4>
                  <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] max-w-sm">
                    Estás en el top{' '}
                    <span className="text-primary">{Math.max(1, 100 - statsSummary.winRate)}%</span> de
                    jugadores en tu categoría. Seguí ganando para desbloquear{' '}
                    <span style={{ color: rankCalculation.nextRank.color }}>
                      {rankCalculation.nextRank.name}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <Link href="/ranks">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-14 px-10 rounded-2xl flex items-center justify-center gap-4 transition-all text-white shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary to-primary-dark group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] italic relative z-10">
                    VER RANKING GLOBAL
                  </span>
                  <Trophy className="w-5 h-5 text-white/90 relative z-10 group-hover:rotate-12 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>

            <SectionDivider />

            {/* NEW: FEATURED HIGHLIGHTS SECTION */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                  Jugadas Destacadas
                </h2>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                  PURO TALENTO NACIONAL
                </span>
              </div>
              <Link
                href="/highlights"
                className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[9px] font-black text-foreground/55 hover:text-foreground transition-all tracking-[0.2em] uppercase glass border-violet-500/20"
              >
                VER TIKTOK <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x h-48 sm:h-64">
              {[1, 2, 3, 4].map((i) => (
                <Link key={i} href="/highlights" className="shrink-0 w-32 sm:w-44 h-full rounded-[2rem] overflow-hidden relative group snap-start border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <img 
                    src={`https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=60&w=400&sig=${i}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                    alt="jugada"
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 text-[6px] rounded-full font-black text-white italic z-20">LIVE</div>
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-surface border border-white/20 flex items-center justify-center overflow-hidden">
                        <User2 className="w-3 h-3 text-white/40" />
                      </div>
                      <span className="text-[7px] font-black text-white truncate">@crack_{i}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-orange-400" />
                      <span className="text-[8px] font-black text-white">{120 * i}K</span>
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link href="/highlights" className="shrink-0 w-32 sm:w-44 h-full rounded-[2rem] glass-premium border-dashed border-white/20 flex flex-col items-center justify-center gap-3 group hover:border-primary/40 transition-all text-foreground/30 snap-start">
                 <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-widest text-center px-4">Subir mi Jugada</span>
              </Link>
            </div>

            <SectionDivider />

            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                  Tus Equipos
                </h2>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                  PLANTEL PROFESIONAL
                </span>
              </div>
              <Link
                href="/teams"
                className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[9px] font-black text-foreground/55 hover:text-foreground transition-all tracking-[0.2em] uppercase glass border-white/10"
              >
                VER TODOS{' '}
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-col gap-5 pb-6 lg:pb-0">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-24 rounded-[2rem] skeleton-shimmer" />
                ))
              ) : userTeams.length > 0 ? (
                userTeams.map((team) => <TeamCard key={team.id} team={team} isPerfMode={isPerfMode} />)
              ) : null}
            </div>

            <SectionDivider />
            <section id="activity-feed" className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                    Feed de Actividad
                  </h2>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                    COMUNIDAD EN TIEMPO REAL
                  </span>
                </div>
                <Activity className="w-5 h-5 text-primary/30" />
              </div>

              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl glass-premium border-white/5 flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface border border-white/5 flex items-center justify-center shrink-0">
                        {activity.type === 'RANK_UP' ? <TrendingUp className="w-4 h-4 text-primary" /> : <Star className="w-4 h-4 text-accent" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-foreground">
                          {activity.user} <span className="text-foreground/40 font-medium tracking-tight"> {activity.detail}</span>
                        </p>
                        <p className="text-[8px] font-black text-primary/60 uppercase mt-0.5 tracking-tighter">hace {activity.time}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <EmptyState 
                    icon={Activity}
                    title="Silencio en la Cancha"
                    description="No hay actividad reciente en tu zona. ¡Sé el primero en hacer historia hoy!"
                  />
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
            <div id="featured-match" className="glass-premium p-6 rounded-[2.5rem] border-primary/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4">
                 <div className="px-2 py-1 rounded bg-primary text-background text-[7px] font-black uppercase tracking-widest animate-pulse">PRXIMO</div>
               </div>
               
               <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-4">Agenda Prioritaria</h3>
               
               {nextMatch ? (
                 <div className="space-y-6">
                   <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-surface border border-white/5" />
                        <span className="text-[9px] font-black uppercase tracking-tighter text-foreground/60">{nextMatch.team_a_name || 'Team A'}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black italic text-primary font-kanit">VS</span>
                        <div className="px-2 py-0.5 rounded-full bg-surface text-[8px] font-black text-foreground/40 uppercase mt-1">
                          {nextMatch.time}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-surface border border-white/5" />
                        <span className="text-[9px] font-black uppercase tracking-tighter text-foreground/60">{nextMatch.team_b_name || 'Team B'}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 justify-center py-2 px-4 rounded-xl bg-foreground/[0.03] border border-white/5">
                      <MapPin className="w-3 h-3 text-foreground/40" />
                      <span className="text-[9px] font-medium text-foreground/60 truncate">{nextMatch.location || 'Sede por confirmar'}</span>
                   </div>
                   
                   <Link href={`/match?id=${nextMatch.id}`} className="block">
                     <button className="w-full h-12 rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-background transition-all">
                       VER DETALLE
                     </button>
                   </Link>
                 </div>
               ) : (
                 <div className="relative group/agenda overflow-hidden rounded-[2rem] p-8 flex flex-col items-center text-center gap-6 border border-white/5 bg-gradient-to-b from-surface/50 to-transparent">
                    {/* Cinematic Spotlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover/agenda:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover/agenda:scale-150 transition-transform duration-1000 opacity-20" />
                      <Calendar className="w-12 h-12 text-foreground/10 group-hover/agenda:text-primary/30 transition-colors duration-500" />
                    </div>

                    <div className="space-y-1 relative z-10">
                      <h4 className="text-xl font-black italic uppercase tracking-tighter text-foreground font-kanit">Agenda Libre</h4>
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] leading-relaxed">
                        No tenés partidos para hoy.<br/>Es el momento ideal para reclutar.
                      </p>
                    </div>

                    <Link href="/search" className="w-full relative z-10">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-12 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 relative overflow-hidden group/btn shadow-[0_0_20px_rgba(44,252,125,0.15)] hover:shadow-[0_0_30px_rgba(44,252,125,0.3)] transition-all"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        <Search className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">BUSCAR MATCH</span>
                        {/* Pulse effect */}
                        <div className="absolute w-full h-full animate-pulse bg-white/5 rounded-full" />
                      </motion.button>
                    </Link>

                    {/* Tip of the day */}
                    <div className="mt-2 pt-4 border-t border-white/5 w-full flex flex-col gap-2 opacity-60 group-hover/agenda:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">PRO-TIP</span>
                      <p className="text-[9px] font-medium text-foreground/40 italic">
                        "Un buen pase al hueco rompe cualquier defensa cerrada. Usá el radar para anticipar."
                      </p>
                    </div>
                 </div>
               )}
            </div>

            <div className="glass-premium p-6 rounded-[2.5rem] border-white/5 space-y-4">
               <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Accesos Rápidos</h3>
               <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Mis Amigos', icon: Users, href: '/friends' },
                    { label: 'Chat Global', icon: MessageSquare, href: '/messages' },
                    { label: 'Configuración', icon: Target, href: '/settings' }
                  ].map((link, idx) => (
                    <Link key={idx} href={link.href}>
                      <button className="w-full h-12 px-4 rounded-xl flex items-center justify-between group hover:bg-foreground/[0.03] transition-all border border-transparent hover:border-white/5">
                        <div className="flex items-center gap-3">
                          <link.icon className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground">{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/40 group-hover:translate-x-1 transition-all" />
                      </button>
                    </Link>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <footer className="mt-20 pt-16 pb-24 lg:pb-12 border-t border-foreground/[0.05]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
            <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <img src="/logo_pelotify.png" alt="Pelotify Logo" className="w-12 h-12 object-contain" />
                <span className="text-xl font-black italic uppercase tracking-tighter text-foreground font-kanit">PELOTIFY</span>
              </div>
              <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                LA PLATAFORMA DEFINITIVA PARA EL FÚTBOL AMATEUR COMPETITIVO. DOMINA LA CANCHA.
              </p>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30">
            <span> 2026 Pelotify. Todos los derechos reservados.</span>
            <span className="flex items-center gap-2">Diseado con <Sparkles className="w-3 h-3 text-primary" /> para campeones</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
