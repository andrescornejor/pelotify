'use client';

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
import LandingPage from '@/components/LandingPage';
import { StatCard, TeamCard, RankBadgeInline, EmptyState, SectionDivider, LazyVideo, HomePageSkeleton, VenueCard, RANKS, getRankByElo } from '@/components/home';
import { useHomeData } from '@/hooks/useHomeData';
import { useEffect, useMemo, useState } from 'react';

// --- TYPES & CONSTANTS (extracted to @/components/home) ---



export default function HomePage() {
  const { user } = useAuth();

  const { data: homeData, isLoading: isDataLoading } = useHomeData(user?.id);

  const userTeams = homeData?.userTeams || [];
  const nextMatch = homeData?.nextMatch || null;
  const activities = homeData?.activities || [];
  const totalPlayers = homeData?.totalPlayers || 0;
  const highlights = homeData?.highlights || [];
  const featuredVenues = homeData?.featuredVenues || [];

  const [greeting, setGreeting] = useState('');
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'teams' | 'venues' | 'futtok'>('activity');
  const { performanceMode, setPerformanceMode } = useSettings();
  const [scrollProgress, setScrollProgress] = useState(0);

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
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buen dia');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const isLoading = isDataLoading && !homeData;

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

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30, duration: 0.4 } 
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.98,
      transition: { duration: 0.2, ease: "easeIn" as const } 
    }
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

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div
      className={cn(
        'relative min-h-screen bg-background font-sans selection:bg-primary selection:text-background',
        performanceMode && 'perf-mode'
      )}
    >
      <OnboardingTour />
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
            : 'glass border-foreground/10 text-primary shadow-lg shadow-primary/10'
        )}
      >
        <Zap className={cn('w-5 h-5', performanceMode && 'fill-current')} />
        <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">
          {performanceMode ? 'LITE ON' : 'FX ON'}
        </span>
      </button>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12">
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
                  'inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/5',
                  performanceMode && 'bg-surface'
                )}
              >
                <div className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      'absolute inline-flex h-full w-full rounded-full bg-foreground/20 opacity-75',
                      !performanceMode && 'animate-ping'
                    )}
                  />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground/30" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 font-outfit">
                  {greeting}
                </span>
              </motion.div>

              {/* Title Section based on Branding */}
              <div className="flex flex-col">
                <motion.h1
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-black italic uppercase font-kanit tracking-tighter text-foreground"
                  style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)', lineHeight: '0.85' }}
                >
                  PELOTI<span className="text-primary italic">FY</span>
                  <span className="inline-block w-[0.15em] h-[0.15em] ml-4 rounded-full bg-primary align-baseline shadow-[0_0_20px_rgba(44,252,125,0.6)]" />
                </motion.h1>
              </div>

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
                      className="absolute -inset-4 blur-3xl rounded-full opacity-25 group-hover/avatar:opacity-45 transition-opacity"
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
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-foreground/10 flex items-center justify-center shadow-lg"
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
              <div className="glass-premium p-6 rounded-[2.5rem] border-foreground/5 space-y-6 relative overflow-hidden group">
                {/* Background Rank Glow */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 blur-[80px] opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: rankCalculation.info.color }}
                />

                <div className="flex items-center gap-6 relative z-10">
                  <RankBadgeInline rankName={rankCalculation.info.name} size="lg" />
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-semibold text-foreground/40 tracking-wide leading-none font-outfit">
                      Progreso de liga
                    </p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black italic text-foreground leading-none font-kanit uppercase tracking-tighter">
                        {rankCalculation.info.name}
                      </h3>
                      <rankCalculation.rank.icon className="w-5 h-5" style={{ color: rankCalculation.rank.hex }} />
                    </div>
                    <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-outfit">
                      Estado de temporada
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
                  <div className="relative h-3 bg-foreground/5 rounded-full p-0.5 overflow-hidden border border-foreground/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rankCalculation.progress}%` }}
                      transition={{ duration: 2, ease: 'circOut', delay: 0.8 }}
                      className="h-full rounded-full relative"
                      style={{
                        background: `linear-gradient(90deg, ${rankCalculation.info.color}, #5dfd9d)`,
                        boxShadow: `0 0 10px ${rankCalculation.info.color}30`,
                      }}
                    >
                      <div className="absolute inset-0 animate-shimmer opacity-30 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </motion.div>
                  </div>

                  <div className="flex justify-between text-[8px] font-medium text-foreground/30 tracking-wide">
                    <span>Progreso de temporada</span>
                    <span>Siguiente nivel</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Link href="/create" className="col-span-3">
                  <motion.button
                    whileHover={{ scale: 1.015, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-primary to-primary-dark text-background font-black uppercase text-[12px] tracking-[0.4em] shadow-[0_20px_40px_rgba(44,252,125,0.25)] flex items-center justify-center gap-3 relative overflow-hidden group border border-foreground/20"
                  >
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-foreground/10 group-hover:h-full transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <PlusCircle className="w-6 h-6 relative z-10 group-hover:rotate-180 transition-transform duration-700" />
                    <span className="relative z-10 font-bold italic drop-shadow-sm">ARMAR PARTIDO</span>
                  </motion.button>
                </Link>

                <Link href="/highlights" className="col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.015, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-16 rounded-[2rem] bg-zinc-900 border border-foreground/10 text-white font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl transition-all duration-500"
                  >
                    {/* Background Layer: Video or Gradient */}
                    {highlights.length > 0 ? (
                      <div className="absolute inset-0 overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                        <LazyVideo
                          src={highlights[0].video_url}
                          className="w-full h-full object-cover blur-[1px] scale-110 group-hover:scale-125 transition-transform duration-[2s]"
                          autoPlay
                          loop
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-black/60 mix-blend-overlay" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-80" />
                    )}

                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 shadow-[0_0_10px_white]" />

                    <Play className="w-6 h-6 relative z-10 text-primary fill-primary/20 group-hover:scale-125 transition-transform drop-shadow-[0_0_10px_rgba(44,252,125,0.4)]" />
                    <span className="relative z-10 italic font-bold tracking-[0.2em] group-hover:text-primary transition-colors">FUTTOK</span>

                    <div className="absolute top-2.5 right-3 flex items-center gap-1.5 z-20">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
                      <div className="px-2 py-0.5 bg-red-500 text-[7px] rounded-lg font-black border border-foreground/20 text-white italic">LIVE</div>
                    </div>
                  </motion.button>
                </Link>

                <Link href="/search" className="col-span-1">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-16 rounded-[2rem] glass-premium border-foreground/10 text-foreground/40 hover:text-primary font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center transition-all duration-500 shadow-xl"
                  >
                    <Search className="w-5 h-5 group-hover:scale-125 transition-transform" />
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
                  performanceMode={performanceMode}
                  fadeUp={fadeUp}
                />
              ))}
            </motion.section>

            <SectionDivider />

            {/* --- DASHBOARD TAB CONTROLLER --- */}
            <section className="sticky top-20 lg:top-4 z-40 bg-background/80 backdrop-blur-xl py-2 -mx-2 px-2 lg:bg-transparent lg:static lg:pb-6">
               <div className="max-w-fit mx-auto lg:mx-0 p-1.5 rounded-[2rem] glass-premium border-foreground/10 flex items-center gap-1 shadow-2xl relative overflow-hidden">
                  {!performanceMode && (
                     <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  )}
                  {[
                     { id: 'activity', label: 'Feed', icon: Activity },
                     { id: 'teams', label: 'Equipos', icon: Users },
                     { id: 'venues', label: 'Sedes', icon: MapPin },
                     { id: 'futtok', label: 'FutTok', icon: Flame },
                  ].map((tab) => {
                     const isSelected = activeTab === tab.id;
                     return (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id as any)}
                           className={cn(
                              "relative px-5 py-2.5 rounded-full flex items-center gap-2.5 transition-all duration-500 group",
                              isSelected ? "text-background" : "text-foreground/40 hover:text-foreground/70"
                           )}
                        >
                           {isSelected && (
                              <motion.div
                                 layoutId="active-dashboard-pill"
                                 className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full shadow-[0_4px_20px_rgba(44,252,125,0.4)]"
                                 transition={{ type: "spring", stiffness: 400, damping: 35 }}
                              />
                           )}
                           <tab.icon className={cn(
                              "w-4 h-4 relative z-10 transition-transform duration-500",
                              isSelected ? "scale-110 text-background" : "group-hover:scale-110"
                           )} />
                           <span className="text-[11px] font-black uppercase tracking-widest italic relative z-10 leading-none">
                              {tab.label}
                           </span>
                        </button>
                     );
                  })}
               </div>
            </section>

            <AnimatePresence mode="wait">
               {activeTab === 'activity' && (
                  <motion.div
                     key="activity-tab"
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     variants={tabContentVariants}
                     className="space-y-6"
                  >
                     <motion.div
                        variants={fadeUp}
                        whileHover={performanceMode ? {} : { scale: 1.01 }}
                        className={cn(
                           'relative overflow-hidden rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 glass-premium border-primary/10',
                           performanceMode && 'bg-surface'
                        )}
                     >
                        {!performanceMode && (
                           <div
                              className="absolute right-0 top-0 w-full h-full opacity-10 pointer-events-none"
                              style={{
                                 background:
                                    'radial-gradient(ellipse at 100% 0%, rgba(44,252,125,0.6) 0%, transparent 60%)',
                              }}
                           />
                        )}
                        <div className="flex items-center gap-5 relative z-10">
                           <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 glass shadow-inner border-foreground/5">
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
                              <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-foreground/5 glass border-foreground/10 text-foreground/60 font-outfit">
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
                        className="space-y-6"
                     >
                        <div className="flex items-end justify-between px-1">
                           <div className="flex flex-col gap-1">
                              <h2 className="text-xl lg:text-2xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                                 Road to Glory
                              </h2>
                              <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-outfit">
                                 Tu camino hacia la leyenda
                              </span>
                           </div>
                           <Sparkles className="w-5 h-5 text-primary/30 shrink-0 mb-1 animate-pulse" />
                        </div>

                        <div className="glass-premium p-8 rounded-[2.5rem] border-foreground/5 relative overflow-hidden">
                           <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
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
                                                   : 'bg-surface/50 border-foreground/5 opacity-40 group-hover:opacity-100'
                                             )}
                                          >
                                             <RankBadgeInline rankName={rankItem.name} size="sm" className="scale-75" />
                                          </motion.div>
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
                                    { icon: Activity, color: '#2cfc7d', label: 'Partidos', value: statsSummary.totalMatches },
                                    { icon: Target, color: '#f59e0b', label: 'Goles', value: metadata?.goals || 0 },
                                    { icon: Award, color: '#6366f1', label: 'Honores', value: metadata?.mvp_count || 0 },
                                 ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5 group hover:bg-foreground/[0.04] transition-colors">
                                       <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                                          <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{item.label}</p>
                                          <p className="text-xl font-black italic font-kanit text-foreground">{item.value}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </motion.section>

                     <SectionDivider />

                     <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                           <div className="flex flex-col gap-1">
                              <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                                 Feed de Actividad
                              </h2>
                              <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-outfit">
                                 Comunidad en tiempo real
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
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 rounded-2xl glass-premium border-foreground/5 flex items-center gap-4 group"
                                 >
                                    <div className="w-10 h-10 rounded-full bg-surface border border-foreground/5 flex items-center justify-center shrink-0">
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
                              <EmptyState icon={Activity} title="Silencio en la Cancha" description="No hay actividad reciente en tu zona." />
                           )}
                        </div>
                     </section>
                  </motion.div>
               )}

               {activeTab === 'teams' && (
                  <motion.div
                     key="teams-tab"
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     variants={tabContentVariants}
                     className="space-y-6"
                  >
                     <div className="flex items-center justify-between px-1">
                        <div className="flex flex-col gap-1">
                           <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                              Tus Equipos
                           </h2>
                           <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-outfit">
                              Plantel profesional
                           </span>
                        </div>
                        <Link href="/teams" className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[9px] font-black text-foreground/55 hover:text-foreground transition-all tracking-[0.2em] uppercase glass border-foreground/10">
                           VER TODOS <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                     </div>

                     <div className="flex flex-col gap-5">
                        {userTeams.length > 0 ? (
                           userTeams.map((team) => <TeamCard key={team.id} team={team} performanceMode={performanceMode} />)
                        ) : (
                           <EmptyState icon={Shield} title="Sin Plantel" description="Aún no eres parte de ningún equipo." />
                        )}
                     </div>
                  </motion.div>
               )}

               {activeTab === 'venues' && (
                  <motion.div
                     key="venues-tab"
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     variants={tabContentVariants}
                     className="space-y-6"
                  >
                     <div className="flex items-center justify-between px-1">
                        <div className="flex flex-col gap-1">
                           <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                              Sedes Destacadas
                           </h2>
                           <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-outfit">
                              Complejos verificados en Rosario
                           </span>
                        </div>
                        <Link href="/establecimientos" className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black text-white hover:text-primary transition-all tracking-[0.2em] uppercase glass-premium border-primary/20 hover:border-primary/50 shadow-lg shadow-primary/5">
                           EXPLORAR <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {featuredVenues.length > 0 ? (
                           featuredVenues.map((venue) => <VenueCard key={venue.id} venue={venue} performanceMode={performanceMode} />)
                        ) : (
                           Array(2).fill(0).map((_, i) => <div key={i} className="h-80 rounded-[3rem] bg-surface animate-pulse" />)
                        )}
                     </div>
                  </motion.div>
               )}

               {activeTab === 'futtok' && (
                  <motion.div
                     key="futtok-tab"
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     variants={tabContentVariants}
                     className="space-y-6"
                  >
                     <div className="flex items-center justify-between px-1">
                        <div className="flex flex-col gap-1">
                           <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                              Tendencias en FutTok
                           </h2>
                           <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-outfit">
                              Lo mejor de la comunidad
                           </span>
                        </div>
                        <Link href="/highlights" className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black text-white hover:text-emerald-400 transition-all tracking-[0.2em] uppercase glass-premium border-emerald-500/20 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/5">
                           VER TODO <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                     </div>

                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x h-[320px] sm:h-[420px]">
                        {highlights.length > 0 ? (
                           highlights.map((h) => (
                              <Link key={h.id} href={`/highlights?v=${h.id}`} className="shrink-0 aspect-[9/16] h-full rounded-[2rem] overflow-hidden relative group snap-start border border-foreground/5 shadow-xl">
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                 <LazyVideo src={h.video_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                 <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-surface border border-foreground/20 flex items-center justify-center overflow-hidden">
                                       {h.profiles?.avatar_url ? <img src={h.profiles.avatar_url} className="w-full h-full object-cover" /> : <User2 className="w-3 h-3 text-white/40" />}
                                    </div>
                                    <span className="text-[8px] font-black text-white">@{h.profiles?.name || 'user'}</span>
                                 </div>
                              </Link>
                           ))
                        ) : (
                           <EmptyState icon={Flame} title="Sin Brillo" description="Aún no hay clips tendencia." />
                        )}
                        <Link href="/highlights" className="shrink-0 aspect-[9/16] h-full rounded-[2rem] glass-premium border-dashed border-foreground/20 flex flex-col items-center justify-center gap-3 group hover:border-primary/40 transition-all text-foreground/30 snap-start">
                           <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                              <PlusCircle className="w-5 h-5 text-emerald-500" />
                           </div>
                           <span className="text-[8px] font-semibold tracking-wide text-center px-4">Subir jugada</span>
                        </Link>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
            <div id="featured-match" className="relative group/match overflow-hidden rounded-[3rem] glass-premium border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              {/* Background Effects */}
              {!performanceMode && (
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover/match:bg-primary/10 transition-all duration-700" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/[0.03] blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                </>
              )}

              <div className="relative z-10 p-8 space-y-8">
                {/* Header with Type & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-foreground/30 shadow-[0_0_6px_rgba(var(--foreground-rgb),0.3)]" />
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] font-outfit">PRÓXIMO PARTIDO</span>
                    </div>
                    <h3 className="text-[11px] font-medium text-foreground/20 tracking-wide font-outfit">Agenda prioritaria</h3>
                  </div>
                  {nextMatch && (
                    <div className="px-4 py-2 rounded-2xl bg-foreground/[0.05] border border-foreground/10 backdrop-blur-md">
                      <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{nextMatch.type || 'F5'}</span>
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
                          className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background border-2 border-foreground/5 flex items-center justify-center shadow-2xl group-hover/match:border-primary/30 transition-all duration-500 overflow-hidden p-3"
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
                        <div className="w-14 h-14 rounded-full bg-background border border-foreground/10 flex flex-col items-center justify-center shadow-inner group-hover/match:scale-110 transition-transform duration-500">
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
                          className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background border-2 border-foreground/5 flex items-center justify-center shadow-2xl group-hover/match:border-emerald-500/30 transition-all duration-500 overflow-hidden p-3"
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
                      <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-foreground/5 group/info hover:bg-foreground/[0.05] transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-foreground/5 shadow-inner">
                          <Calendar className="w-5 h-5 text-primary/40 group-hover/info:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">FECHA</span>
                          <span className="text-[10px] font-black text-foreground">{new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-foreground/5 group/info hover:bg-foreground/[0.05] transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-foreground/5 shadow-inner">
                          <Clock className="w-5 h-5 text-primary/40 group-hover/info:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">HORA</span>
                          <span className="text-[10px] font-black text-foreground">{nextMatch.time} HS</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-foreground/5 group/info hover:bg-primary/10 transition-all cursor-pointer">
                      <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-foreground/5 shadow-inner group-hover/info:bg-primary/20">
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
                      <button className="w-14 h-14 rounded-2xl glass-premium border-foreground/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/40 transition-all">
                        <PlusCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group/agenda overflow-hidden rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-8 border border-foreground/5 bg-gradient-to-b from-surface/50 to-transparent">
                    {/* Cinematic Spotlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover/agenda:opacity-100 transition-opacity duration-700" />

                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover/agenda:scale-150 transition-transform duration-1000 opacity-20" />
                      <Calendar className="w-16 h-16 text-foreground/10 group-hover/agenda:text-primary/30 transition-colors duration-500" />
                    </div>

                    <div className="space-y-2 relative z-10">
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit">Agenda Libre</h4>
                      <p className="text-[11px] font-medium text-foreground/40 tracking-wide leading-relaxed max-w-[220px]">
                        No tenés próximos partidos.<br />¡Salí a reclutar leyendas!
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

                    <div className="flex flex-col gap-2 pt-4 border-t border-foreground/5 w-full opacity-60">
                      <span className="text-[8px] font-semibold text-foreground/40 tracking-wide font-outfit">Sugerencia de hoy</span>
                      <p className="text-[9px] font-medium text-foreground/40 italic leading-relaxed">
                        "Un equipo unido vale más que 11 estrellas individuales."
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-premium p-6 rounded-[2.5rem] border-foreground/5 space-y-4">
              <h3 className="text-[10px] font-semibold text-foreground/40 tracking-wide font-outfit">Accesos rápidos</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Sedes', icon: MapPin, href: '/establecimientos' },
                  { label: 'Mercado', icon: Target, href: '/scouting' },
                  { label: 'Mis Amigos', icon: Users, href: '/friends' },
                  { label: 'Chat Global', icon: MessageSquare, href: '/messages' },
                  { label: 'Configuración', icon: Target, href: '/settings' }
                ].map((link, idx) => (
                  <Link key={idx} href={link.href}>
                    <button className="w-full h-12 px-4 rounded-xl flex items-center justify-between group hover:bg-foreground/[0.03] transition-all border border-transparent hover:border-foreground/5">
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
                <span className="text-xl font-black italic uppercase tracking-tighter text-foreground font-kanit">PELOTI<span className="text-primary">FY</span></span>
              </div>
              <p className="text-[11px] text-foreground/40 font-medium tracking-wide leading-relaxed max-w-sm">
                La plataforma definitiva para el fútbol amateur competitivo. Dominá el potrero.
              </p>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-medium tracking-wide text-foreground/30">
            <span>© 2026 Pelotify. Todos los derechos reservados.</span>
            <span className="flex items-center gap-2">Diseñado con <Sparkles className="w-3 h-3 text-primary" /> para campeones</span>
          </div>
        </footer>
      </div>
    </div>
  );
}