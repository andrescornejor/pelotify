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
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/OnboardingTour';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';
import { getHighlights, Highlight } from '@/lib/highlights';
import { RankUpCelebration } from '@/components/RankUpCelebration';

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
  <div className="flex items-center gap-6 py-10 opacity-30 select-none">
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full bg-primary/40" />
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
      <div className="w-1 h-1 rounded-full bg-primary/40" />
    </div>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
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

const StatCard = ({ stat, i, performanceMode, fadeUp }: any) => (
  <motion.div
    variants={fadeUp}
    custom={i}
    whileHover={performanceMode ? {} : { y: -8, scale: 1.02, rotate: 1 }}
    className={cn(
      'group relative overflow-hidden p-6 rounded-[2.5rem] glass-premium transition-all duration-500 border-white/5 shadow-2xl',
      performanceMode && 'bg-surface shadow-none'
    )}
  >
    {/* Dynamic Background Glow */}
    {!performanceMode && (
      <div
        className="absolute -right-6 -top-6 w-32 h-32 blur-[50px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 rounded-full"
        style={{ backgroundColor: stat.color }}
      />
    )}

    <div className="relative z-10 space-y-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center glass border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500"
        style={{ backgroundColor: `${stat.color}15` }}
      >
        <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
      </div>
      <div>
        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] font-outfit">
          {stat.label}
        </p>
        <div className="flex items-end gap-1.5 mt-1">
          <h3 className="text-3xl font-black italic tracking-tighter text-foreground font-kanit leading-none">
            {stat.value}
          </h3>
          {!performanceMode && (
            <div className="mb-1 flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
               <TrendingUp className="w-3 h-3" />
               <span className="text-[8px] font-black">+4%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const TeamCard = ({ team, performanceMode }: any) => {
  const teamColor = team.primary_color || '#2cfc7d';
  
  return (
    <Link href={`/team?id=${team.id}`} className="block">
      <motion.div
        whileHover={performanceMode ? {} : { scale: 1.01, y: -6 }}
        className="group flex flex-col sm:flex-row items-center justify-between gap-6 p-7 rounded-[3rem] glass-premium border-white/5 hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden shadow-2xl"
      >
        {/* Dynamic Ray Background */}
        {!performanceMode && (
          <>
            <div 
              className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-1000"
              style={{ backgroundColor: teamColor }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </>
        )}
        
        <div className="flex items-center gap-8 relative z-10 w-full sm:w-auto">
          <div className="flex flex-col items-center min-w-[100px]">
            <div className="relative group/avatar">
              {!performanceMode && (
                <div 
                  className="absolute inset-0 blur-3xl rounded-full scale-0 group-hover/avatar:scale-150 transition-transform duration-1000 opacity-0 group-hover/avatar:opacity-40"
                  style={{ backgroundColor: teamColor }}
                />
              )}
              
              <div 
                className="w-24 h-24 rounded-[3rem] bg-gradient-to-br from-surface to-background flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-primary/50 transition-all duration-700 shadow-2xl relative z-10 p-1"
              >
                <div className="w-full h-full rounded-[2.8rem] overflow-hidden">
                  {team.logo_url ? (
                    <img 
                    src={team.logo_url} 
                    alt={team.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="p-4 w-full h-full bg-background">
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

              {/* LVL Floating Badge */}
              <div className="absolute -bottom-2 right-0 px-2.5 py-1 rounded-lg bg-primary text-background text-[10px] font-black italic shadow-lg z-20 transform group-hover:translate-y--1 transition-transform">
                Lvl {Math.floor((team.elo / 500) + 1)}
              </div>
            </div>
          </div>
 
          <div className="flex-1 space-y-3">
            <h4 className="text-3xl font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none group-hover:text-primary transition-colors duration-300">
              {team.name}
            </h4>
            <div className="flex items-center gap-5">
              <div className="flex -space-x-3.5">
                {[1, 2, 3].map((i) => (
                  <div 
                  key={i} 
                  className="w-9 h-9 rounded-full border-2 border-background bg-surface-elevated overflow-hidden hover:z-20 hover:scale-125 transition-transform flex items-center justify-center shadow-lg"
                  >
                    <User2 className="w-5 h-5 text-foreground/10" />
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-background bg-primary text-[10px] font-black text-background flex items-center justify-center z-10 shadow-lg">
                  +{team.members_count || 0}
                </div>
              </div>
              <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-full bg-foreground/[0.03] border border-white/5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] font-outfit">
                  {team.elo > 1000 ? 'ELITE CLUB' : 'VERIFICADO'}
                </span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Action Button */}
        <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto mt-6 sm:mt-0">
          <div className="hidden xl:flex flex-col items-end opacity-0 group-hover:opacity-100 translate-x-8 group-hover:translate-x-0 transition-all duration-700">
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em] font-outfit">Sede Central</span>
            <span className="text-[9px] font-medium text-foreground/30 italic mt-1 uppercase">Entrar al vestuario</span>
          </div>
          <div 
            className="w-16 h-16 rounded-[2rem] bg-foreground/[0.04] border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-700 shadow-xl group-hover:shadow-[0_15px_30px_rgba(44,252,125,0.3)] group-hover:scale-110"
          >
            <ArrowRight className="w-8 h-8 group-hover:translate-x-1.5 transition-transform duration-500" />
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
  const { performanceMode, setPerformanceMode } = useSettings();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isRankUpCelebrationOpen, setIsRankUpCelebrationOpen] = useState(false);
  const [celebrationRank, setCelebrationRank] = useState('');

  // Local sync to set global perf-mode if user previously toggled it here (Legacy compatibility)
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(window.scrollY / total);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Handle Rank-Up Celebration Logic
  useEffect(() => {
    if (!rankCalculation.info.name || isLoading) return;

    const lastCelebratedRank = localStorage.getItem('last_celebrated_rank');
    if (lastCelebratedRank !== rankCalculation.info.name && statsSummary.elo > 0) {
      // If the current rank is better than last celebrated (or first time)
      setCelebrationRank(rankCalculation.info.name);
      setIsRankUpCelebrationOpen(true);
      localStorage.setItem('last_celebrated_rank', rankCalculation.info.name);
    }
  }, [rankCalculation.info.name, isLoading, statsSummary.elo]);

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
        performanceMode && 'perf-mode'
      )}
    >
      <OnboardingTour />
      <RankUpCelebration 
        newRankName={celebrationRank} 
        isOpen={isRankUpCelebrationOpen} 
        onClose={() => setIsRankUpCelebrationOpen(false)} 
      />
      {/*  SCROLL PROGRESS BAR  */}
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/*  AMBIENT  Simplified for Performance  */}
      {!performanceMode && (
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
        onClick={() => setPerformanceMode(!performanceMode)}
        className={cn(
          'fixed bottom-24 right-6 z-[100] w-12 h-12 rounded-2xl md:hidden flex flex-col items-center justify-center transition-all active:scale-90 border',
          performanceMode
            ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(44,252,125,0.4)]'
            : 'glass border-white/10 text-primary shadow-lg shadow-primary/10'
        )}
      >
        <Zap className={cn('w-5 h-5', performanceMode && 'fill-current')} />
        <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">
          {performanceMode ? 'LITE ON' : 'FX ON'}
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
                performanceMode
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
                performanceMode && 'grayscale-0 opacity-20 scale-100'
              )}
            />
            {/* Overlay gradients for depth */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90',
                performanceMode && 'opacity-70'
              )}
            />
            {!performanceMode && (
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
                initial={performanceMode ? { opacity: 1 } : { x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={cn(
                  'inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-premium border-primary/20',
                  performanceMode && 'bg-surface'
                )}
              >
                <div className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      'absolute inline-flex h-full w-full rounded-full bg-primary opacity-75',
                      !performanceMode && 'animate-ping'
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
                      performanceMode
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
                    whileHover={{ scale: 1.015, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-primary to-primary-dark text-background font-black uppercase text-[12px] tracking-[0.4em] shadow-[0_20px_40px_rgba(44,252,125,0.25)] flex items-center justify-center gap-3 relative overflow-hidden group border border-white/20"
                  >
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 group-hover:h-full transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <PlusCircle className="w-6 h-6 relative z-10 group-hover:rotate-180 transition-transform duration-700" />
                    <span className="relative z-10 font-bold italic drop-shadow-sm">ARMAR PARTIDO</span>
                  </motion.button>
                </Link>
                
                <Link href="/highlights" className="col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.015, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-16 rounded-[2rem] bg-zinc-900 border border-white/10 text-white font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl transition-all duration-500"
                  >
                    {/* Background Layer: Video or Gradient */}
                    {highlights.length > 0 ? (
                      <div className="absolute inset-0 overflow-hidden opacity-30 group-hover:opacity-50 transition-opacity duration-700">
                        <video 
                          src={highlights[0].video_url} 
                          className="w-full h-full object-cover blur-[1px] scale-110 group-hover:scale-125 transition-transform duration-[2s]" 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-black/60 mix-blend-overlay" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-80" />
                    )}

                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 shadow-[0_0_10px_white]" />
                    
                    <Play className="w-6 h-6 relative z-10 text-primary fill-primary/20 group-hover:scale-125 transition-transform drop-shadow-[0_0_15px_rgba(44,252,125,0.6)]" />
                    <span className="relative z-10 italic font-bold tracking-[0.2em] group-hover:text-primary transition-colors">FUTTOK</span>
                    
                    <div className="absolute top-2.5 right-3 flex items-center gap-1.5 z-20">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
                      <div className="px-2 py-0.5 bg-red-500 text-[7px] rounded-lg font-black border border-white/20 text-white italic">LIVE</div>
                    </div>
                  </motion.button>
                </Link>

                <Link href="/search" className="col-span-1">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-16 rounded-[2rem] glass-premium border-white/10 text-foreground/40 hover:text-primary font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center transition-all duration-500 shadow-xl"
                  >
                    <Search className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* BENTO GRID DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start auto-rows-min">
          
          {/* 1. FEATURED MATCH: Highlight (High Priority) - Bento Col Span 4, Row Span 2 */}
          <motion.div 
            variants={fadeUp} custom={3}
            className="lg:col-span-4 lg:row-span-2 relative group/match overflow-hidden rounded-[3rem] glass-premium border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] h-full min-h-[500px]"
          >
             {/* Background Effects */}
             {!performanceMode && (
               <>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover/match:bg-primary/20 transition-all duration-700" />
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                 <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
               </>
             )}

             <div className="relative z-10 p-8 flex flex-col h-full space-y-8">
               <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#2cfc7d]" />
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-outfit">PRÓXIMO PARTIDO</span>
                    </div>
                 </div>
                 {nextMatch && (
                   <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{nextMatch.type || 'F5'}</span>
                   </div>
                 )}
               </div>
               
               {nextMatch ? (
                 <div className="flex-1 flex flex-col justify-between space-y-10">
                   <div className="relative flex items-center justify-between gap-4 px-4 py-10">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <div className="flex flex-col items-center gap-4 relative z-10 flex-1">
                        <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background border-2 border-white/5 flex items-center justify-center shadow-2xl overflow-hidden p-3">
                           <JerseyVisualizer primaryColor="#18181b" secondaryColor="#2cfc7d" pattern="vertical" className="w-full h-full" />
                        </motion.div>
                        <span className="text-[11px] font-black uppercase italic tracking-tighter text-foreground font-kanit">{(nextMatch.team_a_name && nextMatch.team_a_name !== 'Team A') ? nextMatch.team_a_name : 'LOCAL'}</span>
                      </div>
                      <div className="flex flex-col items-center gap-3 relative z-10 shrink-0">
                        <div className="w-14 h-14 rounded-full bg-background border border-white/10 flex items-center justify-center shadow-inner group-hover/match:scale-110 transition-transform">
                          <span className="text-2xl font-black italic text-primary font-kanit">VS</span>
                        </div>
                        {countdownText && (
                          <div className="absolute -bottom-10 px-3 py-1 rounded-lg bg-primary text-background text-[8px] font-black uppercase tracking-widest animate-bounce">
                            {countdownText}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-4 relative z-10 flex-1">
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background border-2 border-white/5 flex items-center justify-center shadow-2xl overflow-hidden p-3">
                           <JerseyVisualizer primaryColor="#10b981" secondaryColor="#ffffff" pattern="hoops" className="w-full h-full" />
                        </motion.div>
                        <span className="text-[11px] font-black uppercase italic tracking-tighter text-foreground font-kanit">{(nextMatch.team_b_name && nextMatch.team_b_name !== 'Team B') ? nextMatch.team_b_name : 'VISITA'}</span>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                     <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 group/info hover:bg-primary/10 transition-all cursor-pointer">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-medium text-foreground/70 truncate">{nextMatch.location || 'Sede por confirmar'}</span>
                     </div>
                     <div className="flex gap-3">
                       <Link href={`/match?id=${nextMatch.id}`} className="flex-1">
                        <button className="w-full h-14 rounded-2xl bg-primary text-background font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                          ENTRAR AL MATCH
                        </button>
                       </Link>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Calendar className="w-12 h-12 text-foreground/10" />
                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Agenda Libre</p>
                    <Link href="/search">
                      <button className="px-6 h-10 rounded-xl bg-foreground/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-primary">BUSCAR PARTIDO</button>
                    </Link>
                 </div>
               )}
             </div>
          </motion.div>

          {/* 2. STATS OVERVIEW: Bento Col Span 8 (2x2 internally) */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-6 h-full">
            {statCardsData.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} i={i} performanceMode={performanceMode} fadeUp={fadeUp} />
            ))}
          </div>

          {/* 3. ROAD TO GLORY: Large central element - Bento Col Span 8 */}
          <motion.div 
            variants={fadeUp} custom={4}
            className="lg:col-span-8 glass-premium p-8 rounded-[3rem] border-white/5 relative overflow-hidden h-full min-h-[400px]"
          >
            <div className="flex flex-col h-full justify-between gap-10">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black italic text-foreground uppercase tracking-tighter font-kanit">Road to Glory</h2>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">CAMINO A LA LEYENDA</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>

              <div className="relative flex items-center justify-between px-10">
                <div className="absolute left-0 right-0 h-1 bg-foreground/5" />
                <motion.div 
                   initial={{ width: 0 }} whileInView={{ width: `${(RANKS.findIndex(r => r.name === rankCalculation.info.name) / (RANKS.length - 1)) * 100}%` }}
                   className="absolute left-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary-light"
                />
                {RANKS.filter((_, i) => i % 2 === 0 || i === RANKS.length - 1).map((rankItem) => (
                  <div key={rankItem.name} className="relative flex flex-col items-center">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all", statsSummary.elo >= rankItem.minElo ? "bg-background border-primary" : "bg-surface/50 border-white/5 opacity-30")}>
                      <rankItem.icon className="w-5 h-5" style={{ color: statsSummary.elo >= rankItem.minElo ? rankItem.color : undefined }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-6 rounded-3xl bg-foreground/[0.02] border border-white/5">
                <div className="flex items-center gap-6">
                  <RankBadge rankName={rankCalculation.info.name} size="md" />
                  <div>
                    <h4 className="text-xl font-black text-foreground italic uppercase tracking-tighter font-kanit leading-none">Dominando {rankCalculation.info.name}</h4>
                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] mt-2">Próximo objetivo: <span style={{ color: rankCalculation.nextRank.color }}>{rankCalculation.nextRank.name}</span></p>
                  </div>
                </div>
                <Link href="/ranks">
                  <button className="h-12 px-8 rounded-xl bg-primary text-background font-black text-[10px] tracking-widest uppercase hover:scale-105 transition-all">VER LIGA</button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* 4. FutTok Trend: Bento Col Span 4, Row Span 2 (Vertical content) */}
          <motion.div 
            variants={fadeUp} custom={5}
            className="lg:col-span-4 lg:row-span-2 glass-premium rounded-[3rem] border-emerald-500/20 shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col"
          >
            <div className="p-8 pb-4 relative z-20 bg-gradient-to-b from-black/80 to-transparent">
               <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter font-kanit">FutTok</h2>
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em]">LO MÁS TRENDING</span>
            </div>
            <div className="flex-1 px-4 pb-8 space-y-4 overflow-y-auto no-scrollbar pt-20 mt-[-80px]">
              {highlights.slice(0, 3).map((h) => (
                <Link key={h.id} href={`/highlights?v=${h.id}`} className="block group">
                  <div className="relative aspect-[9/10] rounded-[2rem] overflow-hidden border border-white/10 group-hover:border-emerald-500/50 transition-all">
                    <video src={h.video_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" muted loop playsInline />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                       <span className="text-[10px] font-black text-white italic">@{h.profiles?.name || 'jugador'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/highlights" className="p-8 pt-4">
              <button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-background transition-all">VER FEED COMPLETO</button>
            </Link>
          </motion.div>

          {/* 5. TEAM LIST: Bento Col Span 8 */}
          <motion.div 
            variants={fadeUp} custom={6}
            className="lg:col-span-8 glass-premium p-8 rounded-[3rem] border-white/5 h-full"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black italic text-foreground uppercase tracking-tighter font-kanit">Mis Equipos</h2>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">ADMINISTRA TU PLANTILLA</span>
              </div>
              <Link href="/teams">
                <button className="h-10 px-5 rounded-xl glass border border-white/10 text-[9px] font-black uppercase text-foreground/40 hover:text-foreground transition-all">VER TODOS</button>
              </Link>
            </div>
            <div className="space-y-4">
              {userTeams.length > 0 ? (
                userTeams.map(team => <TeamCard key={team.id} team={team} performanceMode={performanceMode} />)
              ) : (
                <EmptyState icon={Users} title="Sin Equipo" description="Buscá equipo en el mercado o fundá el tuyo propio." actionText="FUNDAR CLUB" actionHref="/team-builder" />
              )}
            </div>
          </motion.div>

          {/* 6. ACTIVITY FEED: Bento Col Span 4 */}
          <motion.div 
            variants={fadeUp} custom={7}
            className="lg:col-span-4 glass-premium p-8 rounded-[3rem] border-white/5 h-full min-h-[400px]"
          >
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black italic text-foreground uppercase tracking-tighter font-kanit">Actividad</h2>
               <Activity className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="space-y-4">
               {activities.map((a, i) => (
                 <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-foreground/[0.02] border border-white/5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                       <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-foreground">{a.user} <span className="text-foreground/40">{a.detail}</span></p>
                       <span className="text-[8px] font-black text-primary uppercase mt-1 tracking-widest">{a.time}</span>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>

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
