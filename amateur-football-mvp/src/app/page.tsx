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
  Play,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/OnboardingTour';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';
import { getHighlights, Highlight } from '@/lib/highlights';

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
    whileHover={isPerfMode ? {} : { y: -4, scale: 1.015 }}
    className={cn(
      'group relative overflow-hidden rounded-[2.5rem] transition-all duration-500',
      isPerfMode ? 'bg-surface border border-border' : 'glass-premium p-6 border-white/5 hover:border-primary/20 shadow-2xl'
    )}
  >
    {/* Expert Background Gradient */}
    {!isPerfMode && (
      <div
        className="absolute -right-8 -bottom-8 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-1000 rounded-full"
        style={{ backgroundColor: stat.color }}
      />
    )}

    <div className="relative z-10 flex flex-col gap-5">
      <div
        className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center glass shadow-inner transition-all duration-700 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
        style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}25` }}
      >
        <stat.icon className="w-6 h-6 transition-transform duration-500 group-hover:rotate-12" style={{ color: stat.color }} />
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] font-outfit italic">
          {stat.label}
        </p>
        <div className="flex items-center gap-2">
          <h3 className="text-3xl font-[900] italic tracking-[-0.04em] text-foreground font-kanit leading-none">
            {stat.value}
          </h3>
          {!isPerfMode && (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 border border-primary/20">
               <TrendingUp className="w-3 h-3 text-primary" />
            </div>
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
        {/* Cinematic Team Aura */}
        {!isPerfMode && (
          <div 
            className="absolute -right-20 -top-20 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-20 transition-all duration-1000 group-hover:scale-150"
            style={{ backgroundColor: teamColor }}
          />
        )}
        
        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 w-full sm:w-auto">
          <div className="relative shrink-0">
            {/* Elite Badge */}
            <div className="absolute -top-3 -right-3 z-20 px-3 py-1 bg-primary rounded-lg shadow-[0_5px_15px_rgba(var(--primary-rgb),0.3)] transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <span className="text-[9px] font-[1000] text-black uppercase tracking-widest italic font-kanit">LVL {level}</span>
            </div>

            <div 
              className={cn(
                "w-24 h-24 rounded-[2.5rem] flex items-center justify-center overflow-hidden border-2 transition-all duration-700 relative shadow-2xl skew-x-[-4deg] group-hover:skew-x-0 group-hover:scale-110",
                isPerfMode ? "bg-background border-white/10" : "bg-gradient-to-br from-surface to-background border-white/5 group-hover:border-primary/40"
              )}
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {team.logo_url ? (
                <img 
                  src={team.logo_url} 
                  alt={team.name} 
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 blur-0 group-hover:blur-sm opacity-100 group-hover:opacity-40"
                />
              ) : (
                <div className="p-4 w-full h-full">
                  <JerseyVisualizer 
                    primaryColor={team.primary_color || '#18181b'} 
                    secondaryColor={team.secondary_color || '#10b981'} 
                    pattern={team.jersey_pattern || 'solid'}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              )}
              {/* Overlay Label on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic font-kanit">VER CLUB</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-3xl lg:text-4xl font-[1000] italic uppercase tracking-tighter text-foreground font-kanit leading-none group-hover:text-primary transition-colors duration-500">
                {team.name}
              </h4>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                 <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-outfit">Sede Central</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-white/10" />
                 <span className="text-[9px] font-black text-primary uppercase tracking-widest font-outfit italic">{team.type || 'F5'} PREFERENCE</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-background bg-surface overflow-hidden hover:z-20 hover:scale-110 transition-transform flex items-center justify-center shadow-lg"
                  >
                    <User2 className="w-4 h-4 text-foreground/20" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary z-10 backdrop-blur-sm shadow-lg">
                  +{team.members_count || 0}
                </div>
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors duration-500" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.3em] font-outfit leading-none">STATUS</span>
                   <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest font-kanit italic">
                     {team.elo > 1000 ? 'ÉLITE CERTIFICADA' : 'EQUIPO VERIFICADO'}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Hover Optimized */}
        <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto mt-6 sm:mt-0 relative z-10">
          <div className="hidden lg:flex flex-col items-end opacity-0 group-hover:opacity-100 translate-x-6 group-hover:translate-x-0 transition-all duration-700">
            <span className="text-[11px] font-[1000] text-primary uppercase tracking-[0.2em] font-kanit">ADMINISTRAR</span>
            <span className="text-[9px] font-medium text-foreground/30 italic mt-0.5">Estadísticas y plantilla completa</span>
          </div>
          <div 
            className="w-16 h-16 rounded-[2rem] glass-premium bg-foreground/[0.04] border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-700 shadow-xl group-hover:shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] group-hover:scale-110 group-hover:-rotate-12 active:scale-95"
          >
            <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform duration-700" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const EmptyState = ({ icon: Icon, title, description, actionText, actionHref }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, y: 10 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    className="w-full py-16 px-8 rounded-[4rem] flex flex-col items-center justify-center text-center gap-8 glass-premium border-white/5 bg-foreground/[0.01] relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    <div className="w-20 h-20 rounded-[2.8rem] bg-surface/50 flex items-center justify-center border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative overflow-hidden">
       <div className="absolute inset-0 bg-primary/5 animate-pulse" />
       <Icon className="w-10 h-10 text-foreground/10 group-hover:text-primary transition-colors duration-500 relative z-10" />
    </div>
    <div className="space-y-3 relative z-10">
      <h5 className="text-2xl font-[1000] italic uppercase tracking-tighter text-foreground font-kanit">{title}</h5>
      <p className="text-[11px] font-black text-foreground/20 uppercase tracking-[0.3em] max-w-[280px] leading-relaxed font-outfit">
        {description}
      </p>
    </div>
    {actionText && actionHref && (
      <Link href={actionHref}>
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 h-14 rounded-2xl bg-foreground/[0.04] hover:bg-primary hover:text-black border border-white/10 hover:border-primary/40 text-[10px] font-[1000] uppercase tracking-[0.4em] transition-all duration-500 font-kanit italic shadow-xl"
        >
          {actionText}
        </motion.button>
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
  const [highlights, setHighlights] = useState<Highlight[]>([]);

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
          supabase.from('match_participants')
            .select('matches:matches!inner(*)')
            .eq('user_id', user.id)
            .gte('matches.date', new Date().toISOString().split('T')[0])
            .order('date', { foreignTable: 'matches', ascending: true })
            .limit(1),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ]);

        if (teamsRes.data) setUserTeams(teamsRes.data.map((t) => t.teams).filter(Boolean));
        if (matchesRes.data?.[0]) {
          const m = (matchesRes.data[0] as any).matches;
          const mData = Array.isArray(m) ? m[0] : m;
          setNextMatch(mData);
        }
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
        // Fetch Highlights
        const highlightsData = await getHighlights(6);
        if (highlightsData) setHighlights(highlightsData);
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
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-16 p-8 sm:p-14 lg:p-20 xl:p-24">
            {/* Left: Text & Branding */}
            <div className="flex-1 space-y-8 lg:space-y-12 max-w-3xl">
              <motion.div
                initial={isPerfMode ? { opacity: 1 } : { x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={cn(
                  'inline-flex items-center gap-4 px-5 py-2 rounded-full glass-premium border-primary/20 bg-primary/5',
                  isPerfMode && 'bg-surface'
                )}
              >
                <div className="relative flex h-2.5 w-2.5">
                  <span
                    className={cn(
                      'absolute inline-flex h-full w-full rounded-full bg-primary opacity-75',
                      !isPerfMode && 'animate-ping'
                    )}
                  />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic font-kanit">
                  SISTEMA ACTIVO — {greeting}
                </span>
              </motion.div>

              {/* Title Section */}
              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-black italic tracking-[-0.04em] leading-[0.82] uppercase font-kanit"
                  style={{ fontSize: 'clamp(3.5rem, 8vw, 8.5rem)' }}
                >
                  <span className="text-foreground relative">
                     DOMINA
                     <span className="absolute -top-6 -right-12 text-[12px] font-black tracking-[1em] text-primary/40 opacity-50 hidden lg:block italic">THE ELITE</span>
                  </span>
                  <br />
                  <span
                    className={
                      isPerfMode
                        ? 'text-primary'
                        : 'bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-primary-dark [text-shadow:0_0_60px_rgba(var(--primary-rgb),0.4)]'
                    }
                  >
                    LA CANCHA.
                  </span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-6 py-4"
                >
                  <div className="h-[1px] w-20 bg-gradient-to-r from-primary/60 to-transparent" />
                  {/* Avatar with rank glow */}
                  <div className="relative group/avatar">
                    {!isPerfMode && (
                      <div
                        className="absolute -inset-6 blur-[40px] rounded-full opacity-40 group-hover/avatar:opacity-80 transition-opacity duration-1000 animate-pulse"
                        style={{ backgroundColor: rankCalculation.rank.hex + '40' }}
                      />
                    )}
                    <div
                      className="relative w-16 h-16 rounded-[2rem] border-2 overflow-hidden flex items-center justify-center bg-surface shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3"
                      style={{ borderColor: rankCalculation.info.color + '60' }}
                    >
                      {metadata?.avatar_url ? (
                        <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User2 className="w-8 h-8 text-foreground/20" />
                      )}
                      
                      {/* Floating Rank Icon */}
                      <div 
                        className="absolute -top-1 -right-1 w-7 h-7 rounded-2xl bg-background border border-white/10 flex items-center justify-center shadow-2xl scale-0 group-hover/avatar:scale-100 transition-transform duration-500"
                      >
                         <rankCalculation.rank.icon className="w-4 h-4" style={{ color: rankCalculation.rank.hex }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] font-outfit">Leyenda confirmada</p>
                    <p className="text-foreground text-3xl font-[1000] uppercase font-kanit italic tracking-tighter">
                      {userName}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Stats Summary Panel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-10 lg:gap-16 pt-6"
              >
                {[
                  {
                    label: 'STATUS',
                    value: rankCalculation.rank.name,
                    color: rankCalculation.rank.hex,
                    icon: Trophy,
                  },
                  {
                    label: 'COMBATES',
                    value: statsSummary.totalMatches,
                    color: 'var(--primary)',
                    icon: Zap,
                  },
                  {
                    label: 'VICTORIA',
                    value: '0%',
                    color: 'var(--accent)',
                    icon: Star,
                  }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2 group/stat">
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] flex items-center gap-2 group-hover/stat:text-primary/60 transition-colors">
                      <item.icon className="w-3 h-3" /> {item.label}
                    </p>
                    <p
                      className="text-4xl font-[1000] italic tracking-[-0.05em] uppercase font-kanit leading-none"
                      style={{ color: item.color }}
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
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:shrink-0 w-full lg:w-[420px] space-y-6"
            >
              {/* Rank Progress Card - Expert Redesign */}
              <div className="glass-premium p-8 rounded-[3rem] border-white/5 space-y-8 relative overflow-hidden group/rank shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
                {/* Background Rank Glow */}
                {!isPerfMode && (
                  <div
                    className="absolute -top-32 -right-32 w-64 h-64 blur-[100px] opacity-20 transition-all duration-1000 group-hover/rank:opacity-50"
                    style={{ backgroundColor: rankCalculation.info.color }}
                  />
                )}

                <div className="flex items-center gap-6 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover/rank:scale-150 transition-transform duration-1000" />
                    <RankBadge rankName={rankCalculation.info.name} size="lg" className="relative z-10" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] leading-none font-kanit italic">
                      ESTADO COMPETITIVO
                    </p>
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-[1000] italic text-foreground leading-none font-kanit uppercase tracking-[-0.04em]">
                        {rankCalculation.info.name}
                      </h3>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end mb-1">
                     <div className="flex flex-col">
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] italic font-kanit">Nivel de Maestría</span>
                        <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.1em] mt-1">Sig: {rankCalculation.nextRank.name}</span>
                     </div>
                     <span className="text-4xl font-[1000] italic text-foreground font-kanit leading-none tracking-tighter">
                        {Math.round(rankCalculation.progress)}%
                     </span>
                  </div>
                  
                  <div className="relative h-4 bg-foreground/5 rounded-2xl p-1 overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rankCalculation.progress}%` }}
                      transition={{ duration: 2, ease: 'circOut', delay: 1 }}
                      className="h-full rounded-xl relative"
                      style={{
                        background: `linear-gradient(90deg, ${rankCalculation.info.color}, var(--primary))`,
                        boxShadow: `0 0 20px ${rankCalculation.info.color}40`,
                      }}
                    >
                      <div className="absolute inset-0 animate-shimmer opacity-30 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link href="/create" className="col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-16 rounded-[1.8rem] bg-primary text-black font-[1000] uppercase text-[12px] tracking-[0.3em] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-4 relative overflow-hidden group/btn font-kanit italic"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-0 bg-white/20 group-hover/btn:h-full transition-all duration-500" />
                    <PlusCircle className="w-6 h-6 relative z-10 group-hover/btn:rotate-180 transition-transform duration-700" />
                    <span className="relative z-10">CREAR ESCUADRA</span>
                  </motion.button>
                </Link>
                
                <Link href="/highlights" className="col-span-1">
                   <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full h-14 rounded-2xl glass-premium border-white/5 flex items-center justify-center gap-3 group/futtok relative overflow-hidden shadow-2xl"
                   >
                      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-transparent opacity-0 group-hover/futtok:opacity-100 transition-opacity" />
                      <Play className="w-4 h-4 text-rose-500 fill-rose-500/20 group-hover/futtok:scale-125 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 italic font-kanit">FutTok</span>
                   </motion.button>
                </Link>

                <Link href="/ranks" className="col-span-1">
                   <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full h-14 rounded-2xl glass-premium border-white/5 flex items-center justify-center gap-3 group/ranklink relative overflow-hidden shadow-2xl"
                   >
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover/ranklink:opacity-100 transition-opacity" />
                      <Trophy className="w-4 h-4 text-primary group-hover/ranklink:scale-125 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 italic font-kanit">Ranks</span>
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
                  Tendencias en FutTok
                </h2>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                  LO MEJOR DE LA COMUNIDAD
                </span>
              </div>
                <Link
                  href="/highlights"
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black text-white hover:text-emerald-400 transition-all tracking-[0.2em] uppercase glass-premium border-emerald-500/20 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                >
                  EXPLORAR FutTok <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x h-[280px] sm:h-[380px]">
              {highlights.length > 0 ? (
                highlights.map((h) => (
                  <Link key={h.id} href={`/highlights?v=${h.id}`} className="shrink-0 aspect-[9/16] h-full rounded-[2rem] overflow-hidden relative group snap-start border border-white/5 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <video 
                      src={h.video_url} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                      muted
                      playsInline
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 text-[6px] rounded-full font-black text-white italic z-20">LIVE</div>
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-surface border border-white/20 flex items-center justify-center overflow-hidden">
                          {h.profiles?.avatar_url ? (
                            <img src={h.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <User2 className="w-3 h-3 text-white/40" />
                          )}
                        </div>
                        <span className="text-[7px] font-black text-white truncate">@{h.profiles?.name || 'user'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-orange-400" />
                        <span className="text-[8px] font-black text-white">{h.likes_count}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                // Placeholder skeletons while loading or if empty
                [1, 2, 3].map((i) => (
                  <div key={i} className="shrink-0 w-32 sm:w-44 h-full rounded-[2rem] bg-surface border border-white/5 animate-pulse" />
                ))
              )}
              
              <Link href="/highlights" className="shrink-0 aspect-[9/16] h-full rounded-[2rem] glass-premium border-dashed border-white/20 flex flex-col items-center justify-center gap-3 group hover:border-primary/40 transition-all text-foreground/30 snap-start">
                 <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-5 h-5 text-emerald-500" />
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
            <div id="featured-match" className="relative group/match overflow-hidden rounded-[3rem] glass-premium border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
               {/* Background Effects */}
               {!isPerfMode && (
                 <>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover/match:bg-primary/20 transition-all duration-700" />
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                   <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                 </>
               )}

               <div className="relative z-10 p-8 space-y-8">
                 {/* Header with Type & Badge */}
                 <div className="flex items-center justify-between">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#2cfc7d]" />
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-outfit">PRÓXIMO PARTIDO</span>
                      </div>
                      <h3 className="text-[11px] font-medium text-foreground/30 uppercase tracking-[0.2em] font-outfit">Agenda Prioritaria</h3>
                   </div>
                   {nextMatch && (
                     <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{nextMatch.type || 'F5'}</span>
                     </div>
                   )}
                 </div>
                 
                 {nextMatch ? (
                   <div className="space-y-10">
                     {/* Matchup Visualization */}
                     <div className="relative flex items-center justify-between gap-4 px-4">
                        {/* Connecting Line */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        
                        {/* Team A */}
                        <div className="flex flex-col items-center gap-4 relative z-10 flex-1">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background border-2 border-white/5 flex items-center justify-center shadow-2xl group-hover/match:border-primary/30 transition-all duration-500 overflow-hidden p-3"
                          >
                             <JerseyVisualizer 
                               primaryColor="#18181b" 
                               secondaryColor="#2cfc7d" 
                               pattern="vertical"
                               className="w-full h-full"
                             />
                          </motion.div>
                          <div className="text-center space-y-1">
                            <span className="text-[11px] font-black uppercase italic tracking-tighter text-foreground font-kanit block truncate max-w-[100px]">{(nextMatch.team_a_name && nextMatch.team_a_name !== 'Team A') ? nextMatch.team_a_name : 'LOCAL'}</span>
                            <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">LOCAL</span>
                          </div>
                        </div>

                        {/* VS Center */}
                        <div className="flex flex-col items-center gap-3 relative z-10 shrink-0">
                          <div className="w-14 h-14 rounded-full bg-background border border-white/10 flex flex-col items-center justify-center shadow-inner group-hover/match:scale-110 transition-transform duration-500">
                            <span className="text-2xl font-black italic text-primary font-kanit leading-none">VS</span>
                          </div>
                          {countdownText && (
                            <div className="absolute -bottom-10 whitespace-nowrap px-3 py-1 rounded-lg bg-primary text-background text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 animate-bounce">
                              {countdownText}
                            </div>
                          )}
                        </div>

                        {/* Team B */}
                        <div className="flex flex-col items-center gap-4 relative z-10 flex-1">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background border-2 border-white/5 flex items-center justify-center shadow-2xl group-hover/match:border-emerald-500/30 transition-all duration-500 overflow-hidden p-3"
                          >
                             <JerseyVisualizer 
                               primaryColor="#10b981" 
                               secondaryColor="#ffffff" 
                               pattern="hoops"
                               className="w-full h-full"
                             />
                          </motion.div>
                          <div className="text-center space-y-1">
                            <span className="text-[11px] font-black uppercase italic tracking-tighter text-foreground font-kanit block truncate max-w-[100px]">{(nextMatch.team_b_name && nextMatch.team_b_name !== 'Team B') ? nextMatch.team_b_name : 'VISITANTE'}</span>
                            <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">VISITA</span>
                          </div>
                        </div>
                     </div>
                     
                     {/* Info Grid */}
                     <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 group/info hover:bg-foreground/[0.05] transition-all">
                           <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-white/5 shadow-inner">
                              <Calendar className="w-5 h-5 text-primary/40 group-hover/info:text-primary transition-colors" />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">FECHA</span>
                              <span className="text-[10px] font-black text-foreground">{new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 group/info hover:bg-foreground/[0.05] transition-all">
                           <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-white/5 shadow-inner">
                              <Clock className="w-5 h-5 text-primary/40 group-hover/info:text-primary transition-colors" />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">HORA</span>
                              <span className="text-[10px] font-black text-foreground">{nextMatch.time} HS</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 group/info hover:bg-primary/10 transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-white/5 shadow-inner group-hover/info:bg-primary/20">
                           <MapPin className="w-5 h-5 text-foreground/20 group-hover/info:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">UBICACIÓN</span>
                           <span className="text-[10px] font-medium text-foreground/70 truncate group-hover/info:text-foreground transition-colors">{nextMatch.location || 'Sede por confirmar'}</span>
                        </div>
                     </div>
                     
                     <div className="flex gap-3 pt-2">
                       <Link href={`/match?id=${nextMatch.id}`} className="flex-1">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-primary hover:text-background transition-all"
                        >
                          ENTRAR AL MATCH <ArrowRight className="w-4 h-4" />
                        </motion.button>
                       </Link>
                       <button className="w-14 h-14 rounded-2xl glass-premium border-white/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/40 transition-all">
                          <PlusCircle className="w-6 h-6" />
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="relative group/agenda overflow-hidden rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-8 border border-white/5 bg-gradient-to-b from-surface/50 to-transparent">
                      {/* Cinematic Spotlight */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover/agenda:opacity-100 transition-opacity duration-700" />
                      
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover/agenda:scale-150 transition-transform duration-1000 opacity-20" />
                        <Calendar className="w-16 h-16 text-foreground/10 group-hover/agenda:text-primary/30 transition-colors duration-500" />
                      </div>

                      <div className="space-y-2 relative z-10">
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit">Agenda Libre</h4>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
                          No tenés próximos partidos.<br/>¡Salí a reclutar leyendas!
                        </p>
                      </div>

                      <Link href="/search" className="w-full relative z-10">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(44,252,125,0.2)] hover:shadow-[0_20px_40px_rgba(44,252,125,0.4)] transition-all"
                        >
                          <Search className="w-4 h-4" />
                          <span>RECLUTAR</span>
                        </motion.button>
                      </Link>

                      <div className="flex flex-col gap-2 pt-4 border-t border-white/5 w-full opacity-60">
                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Sugerencia de hoy</span>
                        <p className="text-[9px] font-medium text-foreground/40 italic leading-relaxed">
                          "Un equipo unido vale más que 11 estrellas individuales."
                        </p>
                      </div>
                   </div>
                 )}
              </div>
            </div>

            <div className="glass-premium p-6 rounded-[2.5rem] border-white/5 space-y-4">
               <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Accesos Rápidos</h3>
               <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Mercado', icon: Target, href: '/scouting' },
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
            <span className="flex items-center gap-2">Diseñado con <Sparkles className="w-3 h-3 text-primary" /> para campeones</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
