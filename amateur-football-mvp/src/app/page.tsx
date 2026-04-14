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
  Heart,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/OnboardingTour';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';
import { getHighlights, Highlight } from '@/lib/highlights';
import LandingPage from '@/components/LandingPage';
import { StatCard, TeamCard, RankBadgeInline, EmptyState, SectionDivider, LazyVideo, HomePageSkeleton, VenueCard, RANKS, getRankByElo, WeatherWidget, CalendarButton } from '@/components/home';
import { useHomeData } from '@/hooks/useHomeData';
import { useEffect, useMemo, useState } from 'react';

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  if (user?.is_business) {
    return null; // Will be redirected by AuthContext
  }

  const { data: homeData, isLoading: isDataLoading } = useHomeData(user?.id);

  const userTeams = homeData?.userTeams || [];
  const nextMatch = homeData?.nextMatch || null;
  const activities = homeData?.activities || [];
  const totalPlayers = homeData?.totalPlayers || 0;
  const highlights = homeData?.highlights || [];
  const featuredVenues = homeData?.featuredVenues || [];
  const recentPosts = homeData?.recentPosts || [];

  const [greeting, setGreeting] = useState('');
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'teams' | 'social' | 'futtok'>('activity');
  const { performanceMode, setPerformanceMode } = useSettings();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const reduceAnimations = performanceMode || isMobile;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buen dia');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const isLoading = isDataLoading && !homeData;

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

      <button
        onClick={() => setPerformanceMode(!performanceMode)}
        className={cn(
          'fixed bottom-24 right-6 z-[100] w-12 h-12 rounded-2xl md:hidden flex flex-col items-center justify-center transition-all active:scale-90 border',
          performanceMode
            ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(44,252,125,0.4)]'
            : 'glass border-foreground/20 text-primary shadow-lg shadow-primary/10'
        )}
      >
        <Zap className={cn('w-5 h-5', performanceMode && 'fill-current')} />
        <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">
          {performanceMode ? 'LITE ON' : 'FX ON'}
        </span>
      </button>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-4 lg:py-6 space-y-4 lg:space-y-6">
        
        {reduceAnimations ? (
          <section className="relative overflow-hidden rounded-[2.5rem] shadow-xl bg-background border border-foreground/5 group/hero">
            <div className="absolute inset-0 z-0 select-none">
              <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=60&w=1200"
                alt=""
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
            </div>

            <div className="relative z-10 flex flex-col p-6 gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-foreground/10">
                  <span className="inline-flex w-1.5 h-1.5 rounded-full bg-foreground/30" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40 font-kanit">
                    {greeting}
                  </span>
                </div>

                <div className="flex flex-col">
                  <h1
                    className="font-black italic uppercase font-kanit tracking-tighter text-foreground leading-[0.85]"
                    style={{ fontSize: 'clamp(2.5rem, 12vw, 4rem)' }}
                  >
                    DOMINÁ <br /> <span className="text-primary italic">LA CANCHA</span>
                  </h1>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <div className="w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center bg-surface relative" style={{ borderColor: rankCalculation.info.color }}>
                    {metadata?.avatar_url ? (
                      <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User2 className="w-5 h-5 text-foreground/40" />
                    )}
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-background border border-foreground/20 flex items-center justify-center shadow-sm">
                      <rankCalculation.rank.icon className="w-2.5 h-2.5" style={{ color: rankCalculation.rank.hex }} />
                    </div>
                  </div>
                  <p className="text-foreground/70 text-base font-medium font-kanit">
                    Hola, <span className="text-foreground font-black uppercase">{userName}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { label: 'Rango', value: rankCalculation.rank.name, color: rankCalculation.rank.color, icon: Trophy },
                    { label: 'Partidos', value: statsSummary.totalMatches, color: 'text-accent', icon: Calendar },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.2em] flex items-center gap-1">
                        <item.icon className="w-2.5 h-2.5" /> {item.label}
                      </p>
                      <p className={cn('text-xl font-black italic tracking-tighter uppercase font-kanit', item.color)}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="bg-surface/60 p-4 rounded-2xl border border-foreground/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <RankBadgeInline rankName={rankCalculation.info.name} size="sm" />
                    <div className="flex-1">
                      <h3 className="text-lg font-black italic text-foreground leading-none font-kanit uppercase tracking-tighter">
                        {rankCalculation.info.name}
                      </h3>
                    </div>
                    <span className="text-xl font-black text-foreground italic font-kanit leading-none">{Math.round(rankCalculation.progress)}%</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden border border-foreground/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${rankCalculation.progress}%`,
                          background: rankCalculation.info.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-medium text-foreground/40 tracking-wide uppercase">
                      <span>Progreso</span>
                      <span>Siguiente: {rankCalculation.nextRank.name}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Link href="/create" className="col-span-3">
                    <button className="w-full h-12 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                      <PlusCircle className="w-4 h-4" />
                      ARMAR PARTIDO
                    </button>
                  </Link>

                  <Link href="/search" className="col-span-2">
                    <button className="w-full h-12 rounded-xl bg-surface border border-foreground/5 text-foreground text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                      <Search className="w-3.5 h-3.5 text-primary" />
                      BUSCAR
                    </button>
                  </Link>

                  <Link href="/feed" className="col-span-1">
                    <button className="w-full h-12 rounded-xl bg-surface border border-foreground/5 text-blue-500 font-black flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
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
            <div className="absolute inset-0 z-0 select-none bg-background">
              <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=60&w=1200"
                alt=""
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover grayscale opacity-[0.12] transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
              <div className="absolute inset-0 backdrop-blur-[2px] opacity-40 mix-blend-overlay" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 p-5 sm:p-12 lg:p-16 xl:p-20">
              <div className="flex-1 space-y-6 lg:space-y-8 max-w-2xl">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/15"
                >
                  <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/20 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground/30" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 font-kanit">
                    {greeting}
                  </span>
                </motion.div>

                <div className="flex flex-col">
                  <motion.h1
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="font-black italic uppercase font-kanit tracking-tighter text-foreground"
                    style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)', lineHeight: '0.85' }}
                  >
                    DOMINÁ <br /> <span className="text-primary italic">LA CANCHA</span>
                  </motion.h1>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 py-2"
                >
                  <div className="h-[2px] w-12 bg-primary/30" />
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

                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-foreground/20 flex items-center justify-center shadow-lg">
                        <rankCalculation.rank.icon className="w-3 h-3" style={{ color: rankCalculation.rank.hex }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground/60 text-lg font-medium font-kanit">
                    Bienvenido,{' '}
                    <span className="text-foreground font-black uppercase">{userName}</span>
                  </p>
                </motion.div>

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

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="lg:shrink-0 w-full lg:w-[400px] space-y-4"
              >
                <div className="glass-premium p-6 rounded-[2.5rem] border-foreground/15 space-y-6 relative overflow-hidden group">
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 blur-[80px] opacity-20 transition-opacity group-hover:opacity-40"
                    style={{ backgroundColor: rankCalculation.info.color }}
                  />

                  <div className="flex items-center gap-6 relative z-10">
                    <RankBadgeInline rankName={rankCalculation.info.name} size="lg" />
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-semibold text-foreground/40 tracking-wide leading-none font-kanit">
                        Progreso de liga
                      </p>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black italic text-foreground leading-none font-kanit uppercase tracking-tighter">
                          {rankCalculation.info.name}
                        </h3>
                        <rankCalculation.rank.icon className="w-5 h-5" style={{ color: rankCalculation.rank.hex }} />
                      </div>
                      <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-kanit">
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
                    <div className="relative h-3 bg-foreground/5 rounded-full p-0.5 overflow-hidden border border-foreground/15">
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
                      className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-primary to-primary-dark text-background text-[11px] font-black uppercase tracking-widest italic shadow-[0_20px_40px_rgba(44,252,125,0.25)] flex items-center justify-center gap-3 relative overflow-hidden group border border-foreground/20 leading-none"
                    >
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-foreground/10 group-hover:h-full transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <PlusCircle className="w-6 h-6 relative z-10 group-hover:rotate-180 transition-transform duration-700" />
                      <span className="relative z-10 drop-shadow-sm">ARMAR PARTIDO</span>
                    </motion.button>
                  </Link>

                  <Link href="/search" className="col-span-2">
                    <motion.button
                      whileHover={{ scale: 1.015, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-16 rounded-[2rem] glass-premium border-foreground/15 text-foreground text-[11px] font-black uppercase tracking-widest italic flex items-center justify-center gap-3 relative overflow-hidden group shadow-xl transition-all duration-500 leading-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Search className="w-5 h-5 relative z-10 text-primary group-hover:scale-110 transition-transform duration-500" />
                      <span className="relative z-10 group-hover:text-primary transition-colors">BUSCAR PARTIDO</span>
                    </motion.button>
                  </Link>

                  <Link href="/feed" className="col-span-1">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-16 rounded-[2rem] glass-premium border-foreground/15 text-blue-500/50 hover:text-blue-500 font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center transition-all duration-500 shadow-xl relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Globe className="w-6 h-6 relative z-10 transition-transform group-hover:scale-125 duration-500" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 xl:col-span-8 space-y-6 order-2 lg:order-1">
            <AnimatePresence mode="wait">
                <motion.div
                  key="activity-tab"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={tabContentVariants}
                  className="space-y-6"
                >
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
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 glass shadow-inner border-foreground/15">
                        <Users className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none font-kanit">
                          Comunidad Activa
                        </h4>
                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.25em] mt-1 font-kanit">
                          <span className="text-primary text-base font-black mr-1">{totalPlayers}</span>{' '}
                          JUGADORES REGISTRADOS
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 relative z-10 shrink-0 w-full sm:w-auto">
                      <Link href="/teams" className="flex-1 sm:flex-none">
                        <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-foreground/5 glass border-foreground/20 text-foreground/60 font-kanit">
                          CLUBES TOP
                        </button>
                      </Link>
                      <Link href="/search" className="flex-1 sm:flex-none">
                        <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.03] text-background bg-gradient-to-br from-primary to-primary-dark shadow-xl shadow-primary/20 font-kanit">
                          MAPA VIVO
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
            </AnimatePresence>
          </div>
          {/* Quick links & Upcoming match section */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6 order-1 lg:order-2">
               <div className="glass-premium p-6 rounded-[2.5rem] border-foreground/15 space-y-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-black uppercase tracking-tighter italic text-foreground">Tu Próximo Desafío</h3>
                  </div>
                  {nextMatch ? (
                     <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-background/50 rounded-2xl p-4">
                           <div className="flex flex-col">
                              <span className="text-[10px] text-primary uppercase font-bold tracking-widest">{countdownText}</span>
                              <span className="text-md font-black">{nextMatch.time}</span>
                           </div>
                           <Link href={`/match/${nextMatch.id}`} className="p-3 bg-primary/20 text-primary rounded-xl shrink-0"><ArrowRight className="w-5 h-5"/></Link>
                        </div>
                     </div>
                  ) : <EmptyState icon={Calendar} title="Sin partidos" description="No tienes partidos cerca" />}
               </div>
          </div>
        </div>
      </div>
    </div>
  );
}
