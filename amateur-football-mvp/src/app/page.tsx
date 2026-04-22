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
  Play,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';
import LandingPage from '@/components/LandingPage';
import { StatCard, TeamCard, RankBadgeInline, EmptyState, SectionDivider, LazyVideo, HomePageSkeleton, RANKS, getRankByElo, WeatherWidget, CalendarButton, SportsAnnouncementBanner, SportSelector } from '@/components/home';
import { useHomeData } from '@/hooks/useHomeData';
import { useUserMatches } from '@/hooks/useMatchQueries';
import { useEffect, useMemo, useState } from 'react';
import { getFormatMeta, getMatchSport, getSportMeta, SPORT_META, type Sport } from '@/lib/sports';
import { getUsageSnapshot, getUserPreferences, recommendMatches } from '@/lib/personalization';
import type { Match } from '@/lib/matches';

// --- TYPES & CONSTANTS (extracted to @/components/home) ---



export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  if (user?.is_business) {
    return null; // Will be redirected by AuthContext
  }

  const { data: homeData, isLoading: isDataLoading } = useHomeData(user?.id);

  const userTeams = homeData?.userTeams || [];
  const recommendationPool = homeData?.recommendedMatches || [];
  const activities = homeData?.activities || [];
  const totalPlayers = homeData?.totalPlayers || 0;
  const highlights = homeData?.highlights || [];
  const featuredVenues = homeData?.featuredVenues || [];
  const recentPosts = homeData?.recentPosts || [];
  const { data: userMatches = [] } = useUserMatches(user?.id);
  const [selectedSport, setSelectedSport] = useState<Sport>('football');
  const focusSportMeta = getSportMeta(selectedSport);

  // Dynamic theme mapping
  const sportTheme = useMemo(() => {
    if (selectedSport === 'padel') return { accent: '#22d3ee', accentDark: '#0891b2', accentRgb: '34, 211, 238', gradient: 'from-cyan-500/20 via-sky-500/10' };
    if (selectedSport === 'basket') return { accent: '#f97316', accentDark: '#c2410c', accentRgb: '249, 115, 22', gradient: 'from-orange-500/20 via-amber-500/10' };
    return { accent: '#2cfc7d', accentDark: '#1a9a4a', accentRgb: '44, 252, 125', gradient: 'from-emerald-500/20 via-teal-500/10' };
  }, [selectedSport]);

  const [greeting, setGreeting] = useState('');
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'teams' | 'social' | 'futtok'>('activity');
  const { toggleSidebar, setNotificationsOpen } = useSidebar();
  const { performanceMode, setPerformanceMode } = useSettings();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const reduceAnimations = performanceMode || isMobile;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buen dia');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const isLoading = isDataLoading && !homeData;

  // Handle Countdown Update
  useEffect(() => {
    if (!userMatches.length) {
      setCountdownText(null);
      return;
    }

    const updateCountdown = () => {
      const selectedNextMatch = getNextSportMatch(userMatches, selectedSport);
      if (!selectedNextMatch) {
        setCountdownText(null);
        return;
      }

      const target = new Date(`${selectedNextMatch.date}T${selectedNextMatch.time}`);
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
  }, [userMatches, selectedSport]);


  const metadata = user?.user_metadata || {};
  const userPreferences = useMemo(() => getUserPreferences(metadata), [metadata]);
  const usageSnapshot = useMemo(() => getUsageSnapshot(), [user?.id]);
  const selectedSportMatches = useMemo(
    () => userMatches.filter((match) => getMatchSport(match) === selectedSport),
    [userMatches, selectedSport]
  );
  const nextMatch = useMemo(
    () => getNextSportMatch(userMatches, selectedSport),
    [userMatches, selectedSport]
  );
  const nextMatchSport = nextMatch ? getMatchSport(nextMatch) : selectedSport;
  const nextMatchFormat = nextMatch ? getFormatMeta(nextMatch.type, nextMatchSport) : null;
  const nextMatchMeta = SPORT_META[nextMatchSport];
  const userPreferencesForRecommendation = useMemo(() => ({
    ...userPreferences,
    favoriteSports: [selectedSport, ...userPreferences.favoriteSports.filter(s => s !== selectedSport)]
  }), [userPreferences, selectedSport]);

  const recommendedMatches = useMemo(
    () =>
      recommendMatches(
        recommendationPool.filter((match) => getMatchSport(match) === selectedSport),
        userPreferencesForRecommendation,
        3
      ),
    [recommendationPool, selectedSport, userPreferencesForRecommendation]
  );

  const sportStatsSummary = useMemo(() => {
    const completed = selectedSportMatches.filter((match) => match.is_completed);
    const upcoming = selectedSportMatches.filter((match) => !match.is_completed);
    const wins = completed.filter((match) => {
      const scoreA = match.team_a_score ?? 0;
      const scoreB = match.team_b_score ?? 0;
      if (match.user_team === 'A') return scoreA > scoreB;
      if (match.user_team === 'B') return scoreB > scoreA;
      return false;
    }).length;
    const losses = completed.filter((match) => {
      const scoreA = match.team_a_score ?? 0;
      const scoreB = match.team_b_score ?? 0;
      if (match.user_team === 'A') return scoreA < scoreB;
      if (match.user_team === 'B') return scoreB < scoreA;
      return false;
    }).length;
    const draws = completed.length - wins - losses;
    const winRate = completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0;

    return {
      totalMatches: completed.length,
      upcomingMatches: upcoming.length,
      wins,
      losses,
      draws,
      winRate,
    };
  }, [selectedSportMatches]);

  const statsSummary = useMemo(() => {
    const elo = metadata?.elo || 0;
    return { elo, ...sportStatsSummary };
  }, [metadata, sportStatsSummary]);

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

  const userName = (metadata?.name || user?.email?.split('@')[0] || 'Jugador').split(' ')[0];

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
        icon: Activity,
        label: `${focusSportMeta.shortLabel} jugados`,
        value: statsSummary.totalMatches,
        color: sportTheme.accent,
        glow: `rgba(${sportTheme.accentRgb},0.2)`,
        tooltip: `Partidos completados en ${focusSportMeta.label}`,
      },
      {
        icon: Trophy,
        label: 'Ganados',
        value: statsSummary.wins,
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.2)',
        tooltip: `Victorias en ${focusSportMeta.label}`,
      },
      {
        icon: Calendar,
        label: 'PrÃ³ximos',
        value: statsSummary.upcomingMatches,
        color: '#6366f1',
        glow: 'rgba(99,102,241,0.2)',
        tooltip: `Partidos pendientes de ${focusSportMeta.label}`,
      },
      {
        icon: TrendingUp,
        label: 'Win Rate',
        value: `${statsSummary.winRate}%`,
        color: '#f43f5e',
        glow: 'rgba(244,63,94,0.2)',
        tooltip: `Tu efectividad en ${focusSportMeta.label}`,
      },
    ],
    [focusSportMeta.label, focusSportMeta.shortLabel, sportTheme.accent, sportTheme.accentRgb, statsSummary]
  );

  // Secondary loading state removed per user request to avoid double splash screens
  // if (isLoading) {
  //   return <HomePageSkeleton />;
  // }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <main
      className={cn(
        'relative min-h-screen bg-background font-sans selection:bg-primary selection:text-background pb-20 lg:pb-0 transition-colors duration-300 ease-out',
        performanceMode && 'perf-mode'
      )}
      style={{
        '--primary': sportTheme.accent,
        '--primary-dark': sportTheme.accentDark,
        '--primary-rgb': sportTheme.accentRgb
      } as any}
    >
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



      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-4 lg:py-6 space-y-4 lg:space-y-6">
        <SportsAnnouncementBanner />

        {/* 
            MOBILE APP-LIKE HERO & QUICK ACTIONS
         */}
        {isMobile ? (
          <section className="space-y-4 pt-1">
            <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.28em] text-foreground/35 font-kanit">
                      {greeting}
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={selectedSport}
                        initial={{ y: 15, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -15, opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                        className="mt-2 text-[2rem] font-black italic uppercase tracking-tighter text-foreground leading-[0.9]"
                      >
                        {focusSportMeta.homeHeadline.split(' ')[0].toUpperCase()}
                        <br />
                        <span className="text-primary">{focusSportMeta.homeHeadline.split(' ').slice(1).join(' ').toUpperCase()}</span>
                      </motion.h1>
                    </AnimatePresence>
                  </div>

                  <Link href="/profile/me" className="shrink-0">
                    <div className="w-14 h-14 rounded-[1.2rem] border border-foreground/15 bg-foreground/5 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                      {metadata?.avatar_url ? (
                        <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User2 className="w-6 h-6 text-foreground/40" />
                      )}
                      <div className="absolute inset-x-2 bottom-1 h-1 rounded-full" style={{ background: rankCalculation.info.color }} />
                    </div>
                  </Link>
                </div>

                <SportSelector selectedSport={selectedSport} onSelect={setSelectedSport} />

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.03] px-3 py-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/35">{focusSportMeta.shortLabel}</p>
                    <AnimatePresence mode="wait">
                      <motion.p key={`total-${selectedSport}`} initial={{ y: 10, opacity: 0, filter: 'blur(4px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: -10, opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.2 }} className="mt-2 text-xl font-black italic text-foreground">{statsSummary.totalMatches}</motion.p>
                    </AnimatePresence>
                  </div>
                  <div className="rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.03] px-3 py-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/35">Ganados</p>
                    <AnimatePresence mode="wait">
                      <motion.p key={`wins-${selectedSport}`} initial={{ y: 10, opacity: 0, filter: 'blur(4px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: -10, opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.2 }} className="mt-2 text-xl font-black italic text-primary">{statsSummary.wins}</motion.p>
                    </AnimatePresence>
                  </div>
                  <div className="rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.03] px-3 py-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/35">Win Rate</p>
                    <AnimatePresence mode="wait">
                      <motion.p key={`winrate-${selectedSport}`} initial={{ y: 10, opacity: 0, filter: 'blur(4px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: -10, opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.2 }} className="mt-2 text-xl font-black italic text-foreground">{statsSummary.winRate}%</motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/create?sport=${selectedSport}`}>
                    <button className="w-full h-12 rounded-[1.2rem] bg-primary text-black text-[10px] font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(44,252,125,0.22)]">
                      <PlusCircle className="w-4 h-4" />
                      Armar partido
                    </button>
                  </Link>
                  <Link href={`/search?sport=${selectedSport}`}>
                    <button className="w-full h-12 rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.04] text-foreground text-[10px] font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      Buscar
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {nextMatch ? (
              <Link href={`/match?id=${nextMatch.id}`} className="block">
                <div className="rounded-[1.9rem] border border-primary/30 bg-[linear-gradient(180deg,rgba(var(--foreground-rgb),0.03),rgba(var(--foreground-rgb),0.015))] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-primary">Próximo partido</p>
                      <h3 className="mt-2 truncate text-lg font-black italic uppercase tracking-tighter text-foreground">
                        {nextMatch.location || 'Sede por confirmar'}
                      </h3>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/45">
                        {nextMatchMeta.icon} {nextMatchFormat?.label || focusSportMeta.label} · {nextMatch.time?.slice(0, 5) || '--:--'} hs
                      </p>
                    </div>
                    {countdownText && (
                      <div className="rounded-[1rem] border border-primary/20 bg-primary/10 px-3 py-2 text-center shrink-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-primary">Cuenta atrás</p>
                        <p className="mt-1 text-[10px] font-black uppercase text-foreground">{countdownText}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.03] p-3 flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-foreground/[0.05] border border-foreground/10 p-2 shrink-0">
                        <JerseyVisualizer primaryColor="#18181b" secondaryColor={sportTheme.accent} pattern="vertical" className="w-full h-full" />
                      </div>
                      <span className="truncate text-[10px] font-black uppercase italic text-foreground">
                        {(nextMatch.team_a_name && nextMatch.team_a_name !== 'Team A') ? nextMatch.team_a_name : nextMatchSport === 'padel' ? 'Dupla A' : 'Local'}
                      </span>
                    </div>
                    <span className="text-sm font-black italic text-primary">VS</span>
                    <div className="rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.03] p-3 flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-foreground/[0.05] border border-foreground/10 p-2 shrink-0">
                        <JerseyVisualizer primaryColor={sportTheme.accent} secondaryColor="rgba(var(--foreground-rgb), 0.2)" pattern="hoops" className="w-full h-full" />
                      </div>
                      <span className="truncate text-[10px] font-black uppercase italic text-foreground">
                        {(nextMatch.team_b_name && nextMatch.team_b_name !== 'Team B') ? nextMatch.team_b_name : nextMatchSport === 'padel' ? 'Dupla B' : 'Visita'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-[1.9rem] border border-dashed border-foreground/20 bg-foreground/[0.02] p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-foreground/35">Agenda libre</p>
                <p className="mt-2 text-sm font-bold text-foreground/65">No hay partidos de {focusSportMeta.label} programados.</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Radar', icon: Search, color: 'text-primary', href: `/search?sport=${selectedSport}` },
                { label: 'Equipos', icon: Shield, color: 'text-blue-400', href: '/teams' },
                { label: 'Sedes', icon: MapPin, color: 'text-orange-400', href: '/establecimientos' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="col-span-1">
                  <div className="rounded-[1.3rem] border border-foreground/10 bg-foreground/[0.03] px-2 py-3 flex flex-col items-center justify-center gap-2">
                    <item.icon className={cn('w-5 h-5', item.color)} />
                    <span className="text-[8px] font-black uppercase tracking-[0.16em] text-foreground/55">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>) : reduceAnimations ? (
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
                      {focusSportMeta.homeHeadline.split(' ')[0].toUpperCase()} <br /> <span className="text-primary italic">{focusSportMeta.homeHeadline.split(' ').slice(1).join(' ').toUpperCase()}</span>
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
                      { label: `${focusSportMeta.shortLabel}`, value: `${statsSummary.totalMatches} jug.`, color: 'text-accent', icon: Calendar },
                      { label: 'Win Rate', value: `${statsSummary.winRate}%`, color: 'text-primary', icon: TrendingUp },
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
                    <Link href={`/create?sport=${selectedSport}`} className="col-span-3">
                      <button className="w-full h-12 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        ARMAR PARTIDO {selectedSport !== 'football' && `DE ${selectedSport.toUpperCase()}`}
                      </button>
                    </Link>

                    <Link href={`/search?sport=${selectedSport}`} className="col-span-3">
                      <button className="w-full h-12 rounded-xl bg-surface border border-foreground/5 text-foreground text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                        <Search className="w-3.5 h-3.5 text-primary" />
                        BUSCAR {selectedSport !== 'football' ? selectedSport.toUpperCase() : 'PARTIDO'}
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
            {/* Backdrop image & Effects */}
            <div className="absolute inset-0 z-0 select-none bg-background">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedSport}
                  initial={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                  animate={{ opacity: 0.12, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
                  src={focusSportMeta.heroImage}
                  alt=""
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover grayscale"
                />
              </AnimatePresence>

              {/* Specialized Court Overlays */}
              <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence mode="wait">
                  {selectedSport === 'football' && (
                    <motion.div key="football" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, type: "spring" }} className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(44,252,125,0.05)_0%,transparent_100%)]" />
                  )}
                  {selectedSport === 'padel' && (
                    <motion.div key="padel" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, type: "spring" }} className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                  )}
                  {selectedSport === 'basket' && (
                    <motion.div key="basket" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, type: "spring" }} className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.1)_0%,transparent_50%)]" />
                  )}
                </AnimatePresence>
              </div>


              {/* Overlay gradients for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
              <div className="absolute inset-0 backdrop-blur-[2px] opacity-40 mix-blend-overlay" />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 p-5 sm:p-12 lg:p-16 xl:p-20">
              {/* Left: Text & Branding */}
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

                {/* Title Section based on Branding */}
                <div className="flex flex-col">
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={selectedSport}
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 1.05 }}
                      transition={{ duration: 0.35, type: "spring", bounce: 0.4 }}
                      className="font-black italic uppercase font-kanit tracking-tighter text-foreground"
                      style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: '0.85' }}
                    >
                      {focusSportMeta.homeHeadline.split(' ')[0].toUpperCase()} <br /> <span className="text-primary italic">{focusSportMeta.homeHeadline.split(' ').slice(1).join(' ').toUpperCase()}</span>
                    </motion.h1>
                  </AnimatePresence>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="flex items-stretch gap-0 mt-4 rounded-2xl w-fit relative group cursor-pointer"
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl" style={{ backgroundColor: rankCalculation.info.color }} />

                  {/* VIP ID Side Bar */}
                  <div className="w-2 rounded-l-[1rem] shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10" style={{ backgroundColor: rankCalculation.info.color, boxShadow: `0 0 15px ${rankCalculation.info.color}80` }} />

                  {/* VIP ID Main Body */}
                  <div className="glass-premium border-y border-r border-foreground/15 rounded-r-[1rem] py-2 px-4 shadow-xl flex items-center gap-4 relative z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Avatar Block */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-surface border border-foreground/10 shadow-inner">
                        {metadata?.avatar_url ? (
                          <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover scale-105" />
                        ) : (
                          <User2 className="w-6 h-6 text-foreground/40" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-surface border border-foreground/10 flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-transform" style={{ borderColor: `${rankCalculation.info.color}50` }}>
                        <rankCalculation.rank.icon className="w-3.5 h-3.5 drop-shadow-md" style={{ color: rankCalculation.info.color }} />
                      </div>
                    </div>

                    {/* Data Block */}
                    <div className="flex flex-col py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-foreground/40">JUGADOR REGISTRADO</span>
                        <Shield className="w-3 h-3 opacity-30 text-primary" />
                      </div>
                      <h3 className="text-xl font-black italic uppercase leading-none font-kanit tracking-tighter text-foreground mt-0.5">{userName}</h3>
                    </div>
                  </div>
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
                      label: `${focusSportMeta.shortLabel} jugados`,
                      value: statsSummary.totalMatches,
                      color: 'text-accent',
                      icon: Calendar,
                    },
                    {
                      label: 'Victorias',
                      value: statsSummary.wins,
                      color: 'text-primary',
                      icon: Trophy,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className={cn("space-y-1", idx === 2 && "hidden sm:block")}>
                      <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.25em] flex items-center gap-1.5">
                        <item.icon className="w-2.5 h-2.5" /> {item.label}
                      </p>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={`desktop-stat-${selectedSport}`}
                          initial={{ y: 15, opacity: 0, filter: 'blur(5px)' }}
                          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                          exit={{ y: -15, opacity: 0, filter: 'blur(5px)' }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            'text-2xl font-black italic tracking-tighter uppercase font-kanit',
                            item.color
                          )}
                        >
                          {item.value}
                        </motion.p>
                      </AnimatePresence>
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
                <div className="hidden lg:block">
                  <SportSelector
                    selectedSport={selectedSport}
                    onSelect={setSelectedSport}
                    variant="compact"
                  />
                </div>

                {/* Rank Progress Card */}
                <div className="glass-premium p-6 rounded-[2.5rem] border-foreground/15 space-y-6 relative overflow-hidden group">
                  {/* Background Rank Glow */}
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
                  <Link href={`/create?sport=${selectedSport}`} className="col-span-3">
                    <motion.button
                      whileHover={{ scale: 1.015, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-primary to-primary-dark text-background text-[11px] font-black uppercase tracking-widest italic shadow-[0_20px_40px_rgba(44,252,125,0.25)] flex items-center justify-center gap-3 relative overflow-hidden group border border-foreground/20 leading-none"
                    >
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-foreground/10 group-hover:h-full transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <PlusCircle className="w-6 h-6 relative z-10 group-hover:rotate-180 transition-transform duration-700" />
                      <span className="relative z-10 drop-shadow-sm uppercase">ARMAR PARTIDO {selectedSport !== 'football' && `DE ${selectedSport}`}</span>
                    </motion.button>
                  </Link>

                  <Link href={`/search?sport=${selectedSport}`} className="col-span-2">
                    <motion.button
                      whileHover={{ scale: 1.015, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-16 rounded-[2rem] glass-premium border-foreground/15 text-foreground text-[11px] font-black uppercase tracking-widest italic flex items-center justify-center gap-3 relative overflow-hidden group shadow-xl transition-all duration-500 leading-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Search className="w-5 h-5 relative z-10 text-primary group-hover:scale-110 transition-transform duration-500" />
                      <span className="relative z-10 group-hover:text-primary transition-colors uppercase">BUSCAR {selectedSport !== 'football' ? selectedSport : 'PARTIDO'}</span>

                      <div className="absolute top-2.5 right-4 flex items-center gap-1.5 z-20">
                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" />
                      </div>
                    </motion.button>
                  </Link>

                  <Link href="/highlights" className="col-span-1">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-16 rounded-[2rem] glass-premium border-foreground/15 text-orange-500/50 hover:text-orange-500 font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center transition-all duration-500 shadow-xl relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Flame className="w-6 h-6 relative z-10 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-500" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {isMobile ? (
          <div className="space-y-4">
            <section className="grid grid-cols-2 gap-3">
              {statCardsData.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.6rem] border border-foreground/10 bg-white/[0.03] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.14)]"
                >
                  <div
                    className="w-10 h-10 rounded-[1rem] flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: `${stat.color}18` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <p className="mt-4 text-[9px] font-black uppercase tracking-[0.18em] text-foreground/35">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-black italic text-foreground tracking-tighter">
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="rounded-[1.8rem] border border-foreground/10 bg-white/[0.03] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary">Momentum</p>
                  <h3 className="mt-2 text-lg font-black italic uppercase tracking-tighter text-foreground">
                    {rankCalculation.rank.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/35">Racha</p>
                  <p className="mt-2 text-2xl font-black italic text-primary">{usageSnapshot.streakDays}</p>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${rankCalculation.progress}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-foreground/45">
                <span>Sección top: {usageSnapshot.favoriteSection}</span>
                <span>{Math.round(rankCalculation.progress)}%</span>
              </div>
            </section>



            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary">Social</p>
                  <h3 className="mt-1 text-lg font-black italic uppercase tracking-tighter text-foreground">
                    3erTiempo
                  </h3>
                </div>
                <Link href="/feed" className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/45">
                  Ver muro
                </Link>
              </div>
              {recentPosts.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar scroll-px-1 swipe-ignore">
                  {recentPosts.slice(0, 8).map((post, idx) => (
                    <Link
                      key={post.id}
                      href={`/feed?post=${post.id}`}
                      className="snap-start min-w-[280px] max-w-[280px] shrink-0"
                    >
                      <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.16)]">
                        {post.image_url && (
                          <>
                            <img src={post.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10" />
                          </>
                        )}
                        <div className="relative flex h-full flex-col">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-11 w-11 rounded-full overflow-hidden border border-white/10 bg-surface-elevated shrink-0">
                                {post.author?.avatar_url ? (
                                  <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-foreground/35 font-black">
                                    {post.author?.name?.charAt(0) || 'P'}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-foreground">{post.author?.name || 'Jugador'}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-foreground/40">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-primary">
                              {idx === 0 ? 'En foco' : '3T'}
                            </div>
                          </div>

                          <p className="mt-4 text-[15px] font-medium leading-relaxed text-foreground/82 line-clamp-5">
                            {post.content}
                          </p>

                          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                            <div className="flex items-center gap-4 text-[11px] font-bold text-foreground/55">
                              <span>{post.likes_count || 0} likes</span>
                              <span>{post.comments_count || 0} respuestas</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
                              Ver post
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.7rem] border border-dashed border-foreground/10 bg-white/[0.02] p-5 text-center text-sm font-bold text-foreground/55">
                  El muro todavía está tranquilo.
                </div>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary">Highlights</p>
                  <h3 className="mt-1 text-lg font-black italic uppercase tracking-tighter text-foreground">
                    {focusSportMeta.highlightLabel}
                  </h3>
                </div>
                <Link href="/highlights" className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/45">
                  Ver todo
                </Link>
              </div>
              {highlights.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-1 snap-x swipe-ignore">
                  {highlights.slice(0, 4).map((highlight, idx) => (
                    <Link
                      key={highlight.id}
                      href={`/highlights?v=${highlight.id}`}
                      className={cn(
                        'snap-start overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_18px_44px_rgba(0,0,0,0.18)]',
                        idx === 0 ? 'min-w-[240px]' : 'min-w-[180px]'
                      )}
                    >
                      <div className={cn('relative', idx === 0 ? 'aspect-[10/16]' : 'aspect-[4/6]')}>
                        {highlight.thumbnail_url ? (
                          <img src={highlight.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(var(--primary-rgb),0.35),rgba(0,0,0,0.92))]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
                        <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35 backdrop-blur-md">
                          <Play className="h-5 w-5 translate-x-[1px] text-white" />
                        </div>

                        <div className="absolute inset-x-4 bottom-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full overflow-hidden border border-white/15 bg-white/10">
                              {highlight.profiles?.avatar_url ? (
                                <img src={highlight.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-white/70">
                                  {(highlight.profiles?.name || 'J').charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-white">
                                @{highlight.profiles?.name || 'Jugador'}
                              </p>
                              <p className="text-[9px] font-bold text-white/65">
                                {highlight.likes_count || 0} likes · {highlight.views_count || 0} views
                              </p>
                            </div>
                          </div>

                          {idx === 0 && (
                            <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                              Clip destacado
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.7rem] border border-dashed border-foreground/10 bg-white/[0.02] p-5 text-center text-sm font-bold text-foreground/55">
                  Todavía no hay highlights para mostrar.
                </div>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary">Para vos</p>
                  <h3 className="mt-1 text-lg font-black italic uppercase tracking-tighter text-foreground">
                    Recomendados
                  </h3>
                </div>
                <Link href={`/search?sport=${selectedSport}`} className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/45">
                  Ver más
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar scroll-px-1 swipe-ignore">
                {recommendedMatches.length > 0 ? (
                  recommendedMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/match?id=${match.id}`}
                      className="snap-start min-w-[280px] rounded-[1.7rem] border border-foreground/10 bg-white/[0.03] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)] shrink-0"
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                        {SPORT_META[getMatchSport(match)].icon} {getFormatMeta(match.type, getMatchSport(match)).label}
                      </p>
                      <h4 className="mt-2 text-base font-black italic uppercase tracking-tighter text-foreground truncate">
                        {match.location}
                      </h4>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/45">
                        {match.date} · {match.time}
                      </p>
                      {match.recommendationReasons?.[0] && (
                        <div className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-[9px] font-black text-primary">
                          {match.recommendationReasons[0]}
                        </div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="w-full rounded-[1.7rem] border border-dashed border-foreground/10 bg-white/[0.02] p-5 text-center text-sm font-bold text-foreground/55">
                    No hay sugerencias para {focusSportMeta.label} por ahora.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary">Actividad</p>
                  <h3 className="mt-1 text-lg font-black italic uppercase tracking-tighter text-foreground">
                    Comunidad en movimiento
                  </h3>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-foreground/45">
                  {totalPlayers}+ en juego
                </div>
              </div>
              {activities.length > 0 ? (
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--primary-rgb),0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_38%)] pointer-events-none" />
                  <div className="relative space-y-3">
                    {activities.slice(0, 3).map((activity, idx) => (
                      <div
                        key={`${activity.user}-${idx}`}
                        className={cn(
                          'relative overflow-hidden rounded-[1.5rem] border border-white/10 p-4 backdrop-blur-sm',
                          idx === 0 ? 'bg-black/20' : 'bg-white/[0.035]'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex flex-col items-center shrink-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-primary/20 bg-primary/12 shadow-[0_0_24px_rgba(var(--primary-rgb),0.16)]">
                              <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            {idx < 2 && <div className="mt-2 h-8 w-px bg-gradient-to-b from-primary/40 to-transparent" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary">
                                {idx === 0 ? 'Ahora' : `Pulso 0${idx + 1}`}
                              </p>
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-foreground/40">
                                {activity.time}
                              </span>
                            </div>
                            <p className="mt-2 text-[15px] font-black leading-snug text-foreground">
                              {activity.user}
                              <span className="ml-1 font-medium text-foreground/58">{activity.detail}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.7rem] border border-dashed border-foreground/10 bg-white/[0.02] p-5 text-center text-sm font-bold text-foreground/55">
                  No hay movimiento reciente en la comunidad.
                </div>
              )}
            </section>


          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 xl:col-span-8 space-y-6 order-2 lg:order-1">
              {/* --- DASHBOARD TAB CONTROLLER --- */}
              <section className={cn(
                "z-40 py-2 -mx-2 px-2 lg:bg-transparent lg:static lg:pb-6",
                isMobile ? "relative bg-transparent" : "sticky top-20 bg-background/80 backdrop-blur-md"
              )}>
                <div className={cn(
                  "w-full rounded-[2rem] flex items-center gap-1 relative overflow-hidden",
                  isMobile ? "p-1 bg-surface-elevated/50 border border-foreground/[0.03]" : "p-1.5 glass-premium border-foreground/20 shadow-2xl"
                )}>
                  {!performanceMode && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  )}
                  {[
                    { id: 'activity', label: 'Feed', icon: Activity },
                    { id: 'teams', label: 'Equipos', icon: Users },
                    { id: 'social', label: 'Social', icon: MessageSquare }, // Added social tab
                    { id: 'futtok', label: focusSportMeta.highlightLabel, icon: Flame },
                  ].map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "relative flex-1 py-2 rounded-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 transition-all duration-500 group",
                          isSelected ? "text-background" : "text-foreground/40 hover:text-foreground/70"
                        )}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-dashboard-pill"
                            className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full shadow-[0_4px_15px_rgba(44,252,125,0.3)]"
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                          />
                        )}
                        <tab.icon className={cn(
                          "w-4 h-4 relative z-10 transition-transform duration-500",
                          isSelected ? "scale-110 text-background" : "group-hover:scale-110"
                        )} />
                        <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest italic relative z-10 leading-none">
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

                    <motion.section
                      variants={fadeUp}
                      className="space-y-6"
                    >
                      <div className="flex items-end justify-between px-1">
                        <div className="flex flex-col gap-1">
                          <h2 className="text-xl lg:text-2xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                            Road to Glory
                          </h2>
                          <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-kanit">
                            Tu camino hacia la leyenda
                          </span>
                        </div>
                        <Sparkles className="w-5 h-5 text-primary/30 shrink-0 mb-1 animate-pulse" />
                      </div>

                      <div className={cn("glass-premium p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border-foreground/15 relative overflow-hidden", isMobile && "px-4")}>
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
                        </div>

                        <div className="relative z-10 space-y-8">
                          <div className="relative flex items-center justify-between px-2 sm:px-8 mt-2 overflow-x-auto no-scrollbar gap-8 pb-2">
                            {/* Dotted/Dashed subtle background baseline */}
                            <div className="absolute left-0 right-0 h-1.5 rounded-full top-1/2 -translate-y-1/2 bg-surface border border-foreground/10 overflow-hidden">
                              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                            </div>

                            {/* Neon Active Track */}
                            <div className="absolute left-0 h-1.5 rounded-full top-1/2 -translate-y-1/2 overflow-visible">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-primary-dark via-primary to-primary-light relative shadow-[0_0_20px_rgba(44,252,125,0.6)]"
                                style={{
                                  width: `calc(${(RANKS.findIndex((rank) => rank.name === rankCalculation.info.name) / (RANKS.length - 1)) * 100}% + 20px)`,
                                }}
                              >
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_25px_rgba(44,252,125,1)] animate-pulse" />
                              </motion.div>
                            </div>

                            {/* Nodes */}
                            {RANKS.map((rankItem, i) => {
                              const isReached = statsSummary.elo >= rankItem.minElo;
                              const isCurrent = rankCalculation.info.name === rankItem.name;

                              return (
                                <div
                                  key={rankItem.name}
                                  className="relative flex flex-col items-center group z-10"
                                >
                                  {isReached && (
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                                  )}
                                  <motion.div
                                    whileHover={{ scale: 1.15, y: -5 }}
                                    className={cn(
                                      'w-12 h-12 rounded-[1rem] flex items-center justify-center border-2 transition-all duration-500 relative backdrop-blur-md',
                                      isReached
                                        ? 'bg-surface shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(44,252,125,0.2)] border-primary hover:border-primary-light'
                                        : 'bg-surface/40 border-foreground/10 opacity-50 group-hover:opacity-100 grayscale'
                                    )}
                                  >
                                    {isReached && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(44,252,125,0.8)]" />}
                                    <RankBadgeInline rankName={rankItem.name} size="sm" className="scale-[0.85] drop-shadow-lg" />
                                  </motion.div>

                                  {isCurrent && (
                                    <motion.div
                                      layoutId="current-rank-indicator"
                                      className="absolute -top-10"
                                    >
                                      <div className="px-3 py-1 rounded-lg bg-foreground text-background text-[8px] font-black uppercase tracking-widest whitespace-nowrap relative shadow-xl shadow-foreground/20">
                                        PASO ACTUAL
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            {[
                              { icon: Activity, color: sportTheme.accent, label: `${focusSportMeta.shortLabel}`, value: statsSummary.totalMatches },
                              { icon: Trophy, color: '#f59e0b', label: 'Ganados', value: statsSummary.wins },
                              { icon: Award, color: '#6366f1', label: 'PrÃ³ximos', value: statsSummary.upcomingMatches },
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/15 group hover:bg-foreground/[0.04] transition-colors">
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
                          <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-kanit">
                            Comunidad de {focusSportMeta.label} en tiempo real
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
                              className="p-4 rounded-2xl glass-premium border-foreground/15 flex items-center gap-4 group"
                            >
                              <div className="w-10 h-10 rounded-full bg-surface border border-foreground/15 flex items-center justify-center shrink-0">
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
                        <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-kanit">
                          Plantel profesional
                        </span>
                      </div>
                      <Link href="/teams" className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[9px] font-black text-foreground/55 hover:text-foreground transition-all tracking-[0.2em] uppercase glass border-foreground/20">
                        VER TODOS <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    <div className="flex flex-col gap-5">
                      {userTeams.length > 0 ? (
                        userTeams.map((team) => <TeamCard key={team.id} team={team} performanceMode={performanceMode} />)
                      ) : (
                        <EmptyState icon={Shield} title="Sin Plantel" description="AÃºn no eres parte de ningÃºn equipo." />
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'social' && (
                  <motion.div
                    key="social-tab"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tabContentVariants}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between px-1">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                          Lo Ãºltimo en 3erTiempo
                        </h2>
                        <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-kanit">
                          Conversaciones y posteos alrededor de {focusSportMeta.label}
                        </span>
                      </div>
                      <Link href="/feed" className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black text-white hover:text-primary transition-all tracking-[0.2em] uppercase glass-premium border-primary/20 hover:border-primary/50 shadow-lg shadow-primary/5">
                        VER MURO <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {recentPosts.length > 0 ? (
                        recentPosts.map((post, idx) => (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-premium rounded-[2rem] border-foreground/10 overflow-hidden group hover:border-primary/20 transition-all duration-300"
                          >
                            <div className="p-5 flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Link href={`/feed/profile?id=${post.author.id}`} className="relative">
                                    <div className={cn(
                                      "w-10 h-10 rounded-full overflow-hidden border border-foreground/10 shadow-sm",
                                      post.author.is_pro && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                    )}>
                                      {post.author.avatar_url ? (
                                        <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-surface-elevated flex items-center justify-center text-foreground/40 font-bold text-sm">
                                          {post.author.name.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    {post.author.is_pro && (
                                      <div className="absolute -bottom-1 -right-1 bg-primary text-background p-0.5 rounded shadow-lg">
                                        <Zap className="w-2.5 h-2.5 fill-black" />
                                      </div>
                                    )}
                                  </Link>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-sm text-foreground leading-none">{post.author.name}</span>
                                      {post.author.is_pro && <span className="text-[8px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1 rounded">PRO</span>}
                                    </div>
                                    <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-0.5">
                                      @{post.author.handle || post.author.name.toLowerCase().replace(/\s+/g, '')}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-foreground/20 uppercase">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              <p className="text-[15px] text-foreground/80 leading-snug whitespace-pre-wrap font-medium">
                                {post.content}
                              </p>

                              {post.image_url && (
                                <div className="relative aspect-video rounded-2xl overflow-hidden border border-foreground/10 shadow-sm">
                                  <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </div>
                              )}

                              <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-1.5 text-foreground/40">
                                  <Heart className={cn("w-4 h-4", post.user_has_liked && "fill-pink-500 text-pink-500")} />
                                  <span className="text-xs font-bold">{post.likes_count}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-foreground/40">
                                  <MessageSquare className="w-4 h-4" />
                                  <span className="text-xs font-bold">{post.comments_count}</span>
                                </div>
                                <Link href={`/feed?post=${post.id}`} className="ml-auto text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">
                                  RESPONDER
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <EmptyState icon={MessageSquare} title="Silencio en el Muro" description="Se el primero en postear algo Ã©pico." />
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
                          Tendencias en {focusSportMeta.highlightLabel}
                        </h2>
                        <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-kanit">
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
                          <Link key={h.id} href={`/highlights?v=${h.id}`} className="shrink-0 aspect-[9/16] h-full rounded-[2rem] overflow-hidden relative group snap-start border border-foreground/15 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                            <LazyVideo src={h.video_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-surface border border-foreground/20 flex items-center justify-center overflow-hidden">
                                {h.profiles?.avatar_url ? <img src={h.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User2 className="w-3 h-3 text-white/40" />}
                              </div>
                              <span className="text-[8px] font-black text-white">@{h.profiles?.name || 'user'}</span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <EmptyState icon={Flame} title="Sin Brillo" description="AÃºn no hay clips tendencia." />
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

            <aside className={cn(
              "lg:col-span-4 xl:col-span-4 lg:col-start-9 space-y-8 lg:sticky lg:top-24",
              nextMatch ? "order-1 lg:order-2" : "order-3 lg:order-2"
            )}>
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
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] font-kanit">PRÓXIMO PARTIDO</span>
                      </div>
                      <h3 className="text-[11px] font-medium text-foreground/20 tracking-wide font-kanit">Agenda prioritaria</h3>
                    </div>
                    {nextMatch && (
                      <div className="flex items-center gap-2">
                        <WeatherWidget
                          lat={nextMatch.lat}
                          lng={nextMatch.lng}
                          location={nextMatch.location || ''}
                          date={nextMatch.date || ''}
                          time={nextMatch.time || ''}
                        />
                        <div className="px-4 py-2 rounded-2xl bg-foreground/[0.05] border border-foreground/20 md:">
                          <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                            {nextMatchMeta.icon} {nextMatchFormat?.label || nextMatch.type || 'F5'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {nextMatch ? (
                    <div className="space-y-8">
                      {/* Matchup Visualization Next-Gen */}
                      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-surface to-background border border-foreground/10 p-6 md:p-8 shadow-2xl overflow-hidden group/matchup">
                        {/* Inner Grid / Lines */}
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover/matchup:opacity-100 transition-opacity duration-700" />

                        <div className="relative flex items-center justify-between z-10 w-full max-w-sm mx-auto">
                          {/* LOCAL */}
                          <div className="flex flex-col items-center gap-4 flex-1">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              className="relative w-20 h-20 md:w-24 md:h-24"
                            >
                              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover/matchup:opacity-100 transition-opacity duration-500" />
                              <div className="absolute inset-0 bg-surface border-2 border-foreground/15 rounded-[1.5rem] p-3 shadow-xl overflow-hidden z-10 flex items-center justify-center">
                                <JerseyVisualizer primaryColor="#18181b" secondaryColor="#2cfc7d" pattern="vertical" className="w-full h-full object-contain" />
                              </div>
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center z-20 shadow-lg">
                                <Shield className="w-4 h-4 text-primary" />
                              </div>
                            </motion.div>
                            <div className="text-center space-y-1">
                              <span className="text-sm md:text-base font-black uppercase italic tracking-tighter text-foreground font-kanit block px-2 line-clamp-1 max-w-[120px]">
                                {(nextMatch.team_a_name && nextMatch.team_a_name !== 'Team A') ? nextMatch.team_a_name : nextMatchSport === 'padel' ? 'DUPLA A' : 'LOCAL'}
                              </span>
                              <div className="inline-block px-2 py-0.5 rounded text-[8px] font-black bg-foreground/5 text-foreground/40 uppercase tracking-[0.2em] border border-foreground/10">
                                {nextMatchSport === 'padel' ? 'LADO A' : 'LOCAL'}
                              </div>
                            </div>
                          </div>

                          {/* VS Center */}
                          <div className="flex flex-col items-center justify-center shrink-0 w-20 relative z-20">
                            {/* Animated connecting line */}
                            <div className="absolute h-px w-64 bg-gradient-to-r from-transparent via-foreground/20 to-transparent top-1/2 -translate-y-1/2 -left-22 -z-10 group-hover/matchup:via-primary/40 transition-colors duration-500" />

                            <div
                              className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-surface to-background border border-foreground/20 flex items-center justify-center shadow-lg shadow-black/50 rotate-45"
                            >
                              <span className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-dark font-kanit -rotate-45 leading-none mt-1">VS</span>
                            </div>

                            {countdownText && (
                              <div className="absolute -bottom-10 whitespace-nowrap px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(44,252,125,0.2)] animate-pulse">
                                {countdownText}
                              </div>
                            )}
                          </div>

                          {/* VISITA */}
                          <div className="flex flex-col items-center gap-4 flex-1">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="relative w-20 h-20 md:w-24 md:h-24"
                            >
                              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover/matchup:opacity-100 transition-opacity duration-500" />
                              <div className="absolute inset-0 bg-surface border-2 border-foreground/15 rounded-[1.5rem] p-3 shadow-xl overflow-hidden z-10 flex items-center justify-center">
                                <JerseyVisualizer primaryColor="#10b981" secondaryColor="#ffffff" pattern="hoops" className="w-full h-full object-contain" />
                              </div>
                            </motion.div>
                            <div className="text-center space-y-1">
                              <span className="text-sm md:text-base font-black uppercase italic tracking-tighter text-foreground font-kanit block px-2 line-clamp-1 max-w-[120px]">
                                {(nextMatch.team_b_name && nextMatch.team_b_name !== 'Team B') ? nextMatch.team_b_name : nextMatchSport === 'padel' ? 'DUPLA B' : 'VISITA'}
                              </span>
                              <div className="inline-block px-2 py-0.5 rounded text-[8px] font-black bg-foreground/5 text-foreground/40 uppercase tracking-[0.2em] border border-foreground/10">
                                {nextMatchSport === 'padel' ? 'LADO B' : 'VISITA'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* High-Contrast Info Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col relative overflow-hidden p-4 rounded-[2rem] bg-surface/50 border border-foreground/10 group/info hover:border-primary/30 transition-all duration-300">
                          <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover/info:opacity-20 group-hover/info:scale-110 transition-all">
                            <Calendar className="w-16 h-16 text-primary" />
                          </div>
                          <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-1 relative z-10 flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> FECHA</span>
                          <span className="text-sm font-black italic text-foreground tracking-tight font-kanit relative z-10 shadow-sm">{new Date(nextMatch.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
                        </div>

                        <div className="flex flex-col relative overflow-hidden p-4 rounded-[2rem] bg-surface/50 border border-foreground/10 group/info hover:border-primary/30 transition-all duration-300">
                          <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover/info:opacity-20 group-hover/info:scale-110 transition-all">
                            <Clock className="w-16 h-16 text-primary" />
                          </div>
                          <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-1 relative z-10 flex items-center gap-1.5"><Clock className="w-3 h-3 text-primary" /> HORA</span>
                          <span className="text-sm font-black italic text-foreground tracking-tight font-kanit relative z-10 shadow-sm">{nextMatch.time?.slice(0, 5)} HS</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-5 rounded-[2.5rem] bg-gradient-to-r from-surface/80 to-surface border border-foreground/10 group/loc cursor-pointer hover:border-primary/30 transition-all overflow-hidden relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-dark group-hover/loc:w-2 transition-all duration-300" />
                        <div className="w-12 h-12 rounded-[1.2rem] bg-foreground/5 flex items-center justify-center border border-foreground/10 shrink-0 group-hover/loc:scale-110 group-hover/loc:bg-primary/10 transition-all duration-500">
                          <MapPin className="w-6 h-6 text-foreground/40 group-hover/loc:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-0.5">UBICACIÃ“N DEL ENCUENTRO</span>
                          <span className="text-[12px] font-bold text-foreground/90 truncate group-hover/loc:text-foreground transition-colors">{nextMatch.location || 'Sede por confirmar, mantÃ©n contacto.'}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-foreground/20 group-hover/loc:text-primary group-hover/loc:translate-x-1 transition-all shrink-0" />
                      </div>

                      {/* Action Panel */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link href={`/match?id=${nextMatch.id}`} className="flex-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-14 rounded-[1.5rem] bg-foreground text-background hover:bg-primary hover:text-black font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_30px_rgba(44,252,125,0.4)] transition-all duration-300 group/btn"
                          >
                            VER ENCUENTRO <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </motion.button>
                        </Link>
                        <CalendarButton match={nextMatch} className="w-full h-14 sm:w-auto sm:flex-1 shrink-0 rounded-[1.5rem] bg-surface hover:bg-foreground/10 border border-foreground/15 text-foreground/60 hover:text-foreground transition-all" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative group/agenda overflow-hidden rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-8 glass-premium border-primary/20 bg-surface/40 hover:bg-surface/50 transition-colors duration-500 shadow-2xl">
                      {/* Minimalist Tech Background */}
                      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] mix-blend-overlay" />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/agenda:opacity-100 transition-opacity duration-700" />

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none opacity-50 group-hover/agenda:opacity-100 group-hover/agenda:scale-125 transition-all duration-1000" />

                      <div className="relative group-hover/agenda:-translate-y-2 transition-transform duration-500 z-10">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover/agenda:scale-150 transition-transform duration-1000 opacity-30" />
                        <div className="w-20 h-20 rounded-3xl bg-foreground/[0.03] border border-foreground/10 flex items-center justify-center relative z-10 shadow-xl group-hover/agenda:border-primary/30 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/agenda:opacity-100 transition-opacity" />
                          <Calendar className="w-8 h-8 text-foreground/20 group-hover/agenda:text-primary transition-colors duration-500" />
                        </div>
                      </div>

                      <div className="space-y-3 relative z-10 group-hover/agenda:-translate-y-1 transition-transform duration-700">
                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-foreground/80 font-kanit">Agenda Libre</h4>
                        <p className="text-[11px] font-medium text-foreground/40 tracking-wide leading-relaxed max-w-[240px] mx-auto">
                          No hay encuentros programados.<br />Buscá uno nuevo o armalo desde cero.
                        </p>
                      </div>

                      <Link href="/search" className="w-full relative z-10">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full h-14 rounded-[1.5rem] bg-foreground text-background font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-primary hover:text-black transition-colors duration-300 group/btn border border-transparent overflow-hidden relative"
                        >
                          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                          <Search className="w-4 h-4 group-hover/btn:text-black transition-colors" />
                          <span className="relative z-10">RECLUTAR RIVAL</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />
                        </motion.button>
                      </Link>

                      <div className="flex flex-col gap-2 pt-6 border-t border-foreground/10 w-full relative z-10">
                        <div className="flex items-center justify-center gap-2 text-[8px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">
                          <Sparkles className="w-3 h-3 text-primary/50" />
                          <span>Sugerencia del sistema</span>
                          <Sparkles className="w-3 h-3 text-primary/50" />
                        </div>
                        <p className="text-[10px] font-medium text-foreground/50 italic leading-relaxed px-4">
                          "La proxima historia deportiva arranca cuando alguien arma el encuentro."
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-premium p-6 rounded-[2.5rem] border-foreground/15 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[10px] font-semibold text-foreground/40 tracking-wide font-kanit">
                      Recomendaciones para vos
                    </h3>
                    <p className="text-xl font-black italic uppercase tracking-tighter text-foreground font-kanit mt-1">
                      Partidos sugeridos
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-primary/40" />
                </div>

                {recommendedMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedMatches.map((match) => (
                      <Link
                        key={match.id}
                        href={`/match?id=${match.id}`}
                        className="block rounded-[1.8rem] border border-foreground/10 bg-foreground/[0.02] p-4 hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                              {SPORT_META[getMatchSport(match)].icon} {getFormatMeta(match.type, getMatchSport(match)).label}
                            </p>
                            <h4 className="text-lg font-black italic uppercase tracking-tighter text-foreground mt-2">
                              {match.location}
                            </h4>
                            <p className="text-xs text-foreground/50 mt-1">
                              {match.date} Â· {match.time}
                            </p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                            {match.price ? `$${match.price.toLocaleString()}` : 'Libre'}
                          </span>
                        </div>
                        {match.recommendationReasons?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {match.recommendationReasons.map((reason) => (
                              <span
                                key={reason}
                                className="px-2.5 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] font-black"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.8rem] border border-dashed border-foreground/15 p-5 text-center">
                    <p className="text-sm font-bold text-foreground/60">
                      Todavía no tenemos sugerencias para vos.
                    </p>
                    <p className="text-xs text-foreground/40 mt-2">
                      Ajustá deportes y zona en configuración para mejorar el radar.
                    </p>
                  </div>
                )}
              </div>

              <div className="hidden lg:block glass-premium p-6 rounded-[2.5rem] border-foreground/15 space-y-4">
                <h3 className="text-[10px] font-semibold text-foreground/40 tracking-wide font-kanit">Accesos rápidos</h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Sedes', icon: MapPin, href: '/establecimientos' },
                    { label: 'Mis Amigos', icon: Users, href: '/friends' },
                    { label: 'Chat Global', icon: MessageSquare, href: '/messages' },
                    { label: 'Configuración', icon: Target, href: '/settings' }
                  ].map((link, idx) => (
                    <Link key={idx} href={link.href}>
                      <button className="w-full h-12 px-4 rounded-xl flex items-center justify-between group hover:bg-foreground/[0.03] transition-all border border-transparent hover:border-foreground/15">
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
            </aside>
          </div>
        )}



        <footer className="mt-12 pt-12 pb-16 lg:pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
            <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <img src="/logo_pelotify.png" alt="Pelotify Logo" className="w-12 h-12 object-contain" />
                <span className="text-xl font-black italic uppercase tracking-tighter text-foreground font-kanit">PELOTI<span className="text-primary">FY</span></span>
              </div>
              <p className="text-[11px] text-foreground/40 font-medium tracking-wide leading-relaxed max-w-sm">
                La plataforma para organizar futbol, padel y basket amateur con una comunidad bien activa.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-medium tracking-wide text-foreground/30">
            <span>Â© 2026 Pelotify. Todos los derechos reservados.</span>
            <span className="flex items-center gap-2">DiseÃ±ado con <Sparkles className="w-3 h-3 text-primary" /> para campeones</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function getNextSportMatch(matches: Array<Partial<Match>>, sport: Sport) {
  const now = Date.now();

  return matches
    .filter((match) => getMatchSport(match) === sport && !match.is_completed && match.date && match.time)
    .sort((left, right) => {
      const leftTime = new Date(`${left.date}T${left.time}`).getTime();
      const rightTime = new Date(`${right.date}T${right.time}`).getTime();
      return leftTime - rightTime;
    })
    .find((match) => new Date(`${match.date}T${match.time}`).getTime() >= now) || null;
}

