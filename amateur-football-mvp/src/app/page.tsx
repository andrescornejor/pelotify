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
  const { activeSport: selectedSport, setActiveSport: setSelectedSport } = useSettings();
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
         */}        {isMobile ? (
          <section className="space-y-4 pt-1">
            <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-6">
                {/* Header: Identity & Greeting */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 font-kanit italic">{greeting}</p>
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={selectedSport}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-3xl font-black italic uppercase font-kanit tracking-tighter text-foreground leading-none"
                      >
                        {focusSportMeta.homeHeadline.split(' ')[0]} <br/>
                        <span className="text-primary">{focusSportMeta.homeHeadline.split(' ').slice(1).join(' ')}</span>
                      </motion.h1>
                    </AnimatePresence>
                  </div>
                  <Link href="/profile/me">
                    <div className="w-16 h-16 rounded-2xl border-2 border-primary/20 p-1 bg-surface-elevated shadow-lg">
                      <div className="w-full h-full rounded-xl overflow-hidden bg-foreground/5">
                        {metadata?.avatar_url ? (
                          <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User2 className="w-7 h-7 text-foreground/20" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Sport Selector Integration */}
                <div className="w-full">
                  <SportSelector selectedSport={selectedSport} onSelect={setSelectedSport} variant="compact" />
                </div>

                {/* Stats & Actions Dashboard */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Create Action */}
                  <Link href={`/create?sport=${selectedSport}`} className="col-span-2">
                    <button className="w-full h-16 rounded-[1.5rem] bg-primary text-black flex items-center justify-center gap-3 shadow-[0_12px_30px_rgba(44,252,125,0.25)]">
                      <PlusCircle className="w-6 h-6" />
                      <span className="text-xs font-black uppercase tracking-widest font-kanit italic">Armar Partido</span>
                    </button>
                  </Link>

                  {/* Search Action */}
                  <Link href={`/search?sport=${selectedSport}`}>
                    <button className="w-full h-14 rounded-[1.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center gap-2 text-foreground">
                      <Search className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest font-kanit italic">Buscar</span>
                    </button>
                  </Link>

                  {/* Highlights Action */}
                  <Link href="/highlights">
                    <button className="w-full h-14 rounded-[1.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center gap-2 text-foreground">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest font-kanit italic">Highlights</span>
                    </button>
                  </Link>

                  {/* Quick Stats */}
                  <div className="col-span-2 grid grid-cols-3 gap-2 mt-1">
                    <div className="bg-foreground/[0.03] border border-foreground/[0.05] rounded-2xl p-3 flex flex-col items-center">
                      <p className="text-[7px] font-black text-foreground/30 uppercase tracking-widest mb-1">Partidos</p>
                      <p className="text-lg font-black text-foreground italic font-kanit">{statsSummary.totalMatches}</p>
                    </div>
                    <div className="bg-foreground/[0.03] border border-foreground/[0.05] rounded-2xl p-3 flex flex-col items-center">
                      <p className="text-[7px] font-black text-foreground/30 uppercase tracking-widest mb-1">Victorias</p>
                      <p className="text-lg font-black text-primary italic font-kanit">{statsSummary.wins}</p>
                    </div>
                    <div className="bg-foreground/[0.03] border border-foreground/[0.05] rounded-2xl p-3 flex flex-col items-center">
                      <p className="text-[7px] font-black text-foreground/30 uppercase tracking-widest mb-1">Eficiencia</p>
                      <p className="text-lg font-black text-foreground italic font-kanit">{statsSummary.winRate}%</p>
                    </div>
                  </div>
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
          </section>
        ) : reduceAnimations ? (
          <section className="relative overflow-hidden rounded-[2.5rem] shadow-xl bg-background border border-foreground/5 group/hero">
            <div className="absolute inset-0 z-0 select-none">
              <img
                src={focusSportMeta.heroImage}
                alt=""
                className="w-full h-full object-cover opacity-20 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
            </div>

            <div className="relative z-10 flex flex-col p-8 gap-8">
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
                    style={{ fontSize: 'clamp(2.5rem, 12vw, 5rem)' }}
                  >
                    {focusSportMeta.homeHeadline.split(' ')[0].toUpperCase()} <br /> 
                    <span className="text-primary italic">{focusSportMeta.homeHeadline.split(' ').slice(1).join(' ').toUpperCase()}</span>
                  </h1>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-surface relative" style={{ borderColor: rankCalculation.info.color }}>
                    {metadata?.avatar_url ? (
                      <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User2 className="w-6 h-6 text-foreground/40" />
                    )}
                  </div>
                  <div>
                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Bienvenido de nuevo</p>
                    <p className="text-foreground text-xl font-black font-kanit uppercase italic">{userName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  {[
                    { label: `${focusSportMeta.shortLabel} jugados`, value: statsSummary.totalMatches, color: 'text-accent', icon: Calendar },
                    { label: 'Efectividad', value: `${statsSummary.winRate}%`, color: 'text-primary', icon: TrendingUp },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <item.icon className="w-3 h-3" /> {item.label}
                      </p>
                      <p className={cn('text-2xl font-black italic tracking-tighter uppercase font-kanit', item.color)}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-md space-y-4">
                <div className="bg-surface/60 p-6 rounded-[2rem] border border-foreground/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <RankBadgeInline rankName={rankCalculation.info.name} size="sm" />
                    <div className="flex-1">
                      <h3 className="text-xl font-black italic text-foreground leading-none font-kanit uppercase tracking-tighter">
                        {rankCalculation.info.name}
                      </h3>
                    </div>
                    <span className="text-2xl font-black text-foreground italic font-kanit leading-none">{Math.round(rankCalculation.progress)}%</span>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 bg-foreground/5 rounded-full overflow-hidden border border-foreground/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${rankCalculation.progress}%`,
                          background: rankCalculation.info.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/create?sport=${selectedSport}`} className="col-span-2">
                    <button className="w-full h-14 rounded-2xl bg-primary text-black text-[11px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                      <PlusCircle className="w-5 h-5" />
                      Armar partido
                    </button>
                  </Link>

                  <Link href={`/search?sport=${selectedSport}`} className="col-span-2">
                    <button className="w-full h-14 rounded-2xl bg-surface border border-foreground/5 text-foreground text-[11px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      Buscar
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative overflow-hidden rounded-[3.5rem] lg:rounded-[5rem] border border-white/5 bg-[#0a0a0a] min-h-[700px] flex flex-col items-center justify-center text-center p-8 lg:p-20 group/hero transform-gpu"
          >
            {/* Stage Background */}
            <div className="absolute inset-0 z-0">
               {/* Sport Background Image with elegant fade */}
               <AnimatePresence mode="wait">
                 <motion.div
                   key={selectedSport}
                   initial={{ opacity: 0, scale: 1.1 }}
                   animate={{ opacity: 0.15, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                   className="absolute inset-0"
                 >
                   <img
                     src={focusSportMeta.heroImage}
                     alt=""
                     className="w-full h-full object-cover grayscale brightness-50"
                   />
                 </motion.div>
               </AnimatePresence>

               {/* Stage Lighting - Single performant gradient */}
               <div 
                 className="absolute inset-0 opacity-40 mix-blend-overlay transition-colors duration-1000"
                 style={{
                   background: `radial-gradient(circle at center, ${sportTheme.accent}88 0%, transparent 70%)`
                 }}
               />

               {/* Subtle Grain Overlay */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
               
               {/* Vignette */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/20 to-[#0a0a0a]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
              {/* Top Badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 font-kanit italic">
                  {greeting} • Pelotify Pro
                </span>
              </motion.div>

              {/* Main Headline */}
              <div className="relative mb-12">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={selectedSport}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    className="text-6xl md:text-8xl lg:text-[10rem] font-black italic uppercase font-kanit tracking-tighter text-white leading-none"
                  >
                    {focusSportMeta.homeHeadline.split(' ')[0]} <br />
                    <span className="text-primary">{focusSportMeta.homeHeadline.split(' ').slice(1).join(' ')}</span>
                  </motion.h1>
                </AnimatePresence>
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-20 h-20 border-t-2 border-l-2 border-primary/20 rounded-tl-3xl" />
                <div className="absolute -bottom-10 -right-10 w-20 h-20 border-b-2 border-r-2 border-primary/20 rounded-br-3xl" />
              </div>

              {/* Sport Switcher - Redesigned integration */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-md mb-12"
              >
                <SportSelector
                  selectedSport={selectedSport}
                  onSelect={setSelectedSport}
                />
              </motion.div>

              {/* Bottom Grid: Identity & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
                {/* Pro Identity Card */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="lg:col-span-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col justify-between group hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/30 p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white/10">
                        {metadata?.avatar_url ? (
                          <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <Users className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Identidad</p>
                      <h3 className="text-2xl font-black italic text-white font-kanit uppercase leading-none">{userName}</h3>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                     <div className="text-left">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Rango actual</p>
                        <div className="flex items-center gap-2">
                           <rankCalculation.rank.icon className="w-4 h-4 text-primary" />
                           <span className="text-sm font-black text-white italic font-kanit uppercase">{rankCalculation.info.name}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Socio No.</p>
                        <p className="text-sm font-black text-white font-mono opacity-40">#{user?.id?.slice(0, 5).toUpperCase()}</p>
                     </div>
                  </div>
                </motion.div>

                {/* Primary CTA Block */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="lg:col-span-1 flex flex-col gap-4"
                >
                  <Link href={`/create?sport=${selectedSport}`} className="h-full">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-full min-h-[140px] rounded-[2.5rem] bg-primary text-black flex flex-col items-center justify-center gap-2 group relative overflow-hidden shadow-[0_20px_50px_rgba(44,252,125,0.3)]"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <PlusCircle className="w-10 h-10 mb-1" />
                      <span className="text-sm font-black uppercase tracking-[0.2em] font-kanit italic">Armar Partido</span>
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Secondary Actions & Stats */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="lg:col-span-1 grid grid-cols-2 gap-4"
                >
                  <Link href={`/search?sport=${selectedSport}`} className="col-span-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-white group"
                    >
                      <Search className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest font-kanit italic">Buscar Partido</span>
                    </motion.button>
                  </Link>
                  
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 flex flex-col justify-center items-center">
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Partidos</p>
                    <p className="text-2xl font-black text-white italic font-kanit">{statsSummary.totalMatches}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 flex flex-col justify-center items-center">
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Victorias</p>
                    <p className="text-2xl font-black text-primary italic font-kanit">{statsSummary.wins}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>
        )}

        {isMobile ? (
          <div className="space-y-8 pb-10">
            {/* Quick Stats Grid */}
            <section className="grid grid-cols-2 gap-3">
              {statCardsData.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[2rem] border border-white/5 bg-surface-elevated/40 p-5 shadow-xl backdrop-blur-sm"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner"
                    style={{ backgroundColor: `${stat.color}10` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/30 font-kanit">
                      {stat.label}
                    </p>
                    <p className="mt-0.5 text-3xl font-black italic text-foreground tracking-tighter font-kanit">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            {/* Momentum & Progress */}
            <section className="rounded-[2.2rem] border border-white/5 bg-surface-elevated p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-kanit italic">Momentum Pro</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit">
                    {rankCalculation.rank.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 font-kanit">Racha</p>
                  <p className="text-3xl font-black italic text-primary font-kanit leading-none mt-1">{usageSnapshot.streakDays}D</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="h-2.5 rounded-full bg-foreground/5 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${rankCalculation.progress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_15px_rgba(44,252,125,0.4)]" 
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-foreground/40 font-kanit italic">
                  <span>{Math.round(rankCalculation.progress)}% Completado</span>
                  <span className="text-foreground/20">Next: {rankCalculation.nextRank.name}</span>
                </div>
              </div>
            </section>

            {/* Social / 3erTiempo */}
            <section className="space-y-4">
              <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-kanit italic">Social</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none">
                    3er Tiempo
                  </h3>
                </div>
                <Link href="/feed" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-kanit border-b border-foreground/10 pb-0.5">
                  Ver Todo
                </Link>
              </div>
              
              {recentPosts.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-px-2 swipe-ignore">
                  {recentPosts.slice(0, 8).map((post, idx) => (
                    <Link
                      key={post.id}
                      href={`/feed?post=${post.id}`}
                      className="snap-start min-w-[300px] shrink-0"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/5 bg-surface-elevated shadow-2xl group">
                        {post.image_url ? (
                          <>
                            <img src={post.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.1),transparent)]" />
                        )}
                        
                        <div className="relative h-full p-6 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/10 bg-surface shadow-lg">
                                {post.author?.avatar_url ? (
                                  <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-foreground/20 font-black">
                                    <User2 className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-foreground font-kanit italic uppercase">{post.author?.name || 'Jugador'}</p>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/40 font-kanit">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                               <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            </div>
                          </div>

                          <div>
                            <p className="text-lg font-bold leading-tight text-foreground/90 line-clamp-3 font-kanit italic">
                              "{post.content}"
                            </p>
                            <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary font-kanit italic">
                              <span>{post.likes_count || 0} LIKES</span>
                              <span>{post.comments_count || 0} RESPUESTAS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-white/10 bg-surface-elevated/40 p-8 text-center text-[11px] font-black uppercase tracking-widest text-foreground/30 font-kanit italic">
                  El muro todavía está tranquilo.
                </div>
              )}
            </section>

            {/* Highlights Grid */}
            <section className="space-y-4">
              <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-kanit italic">Clips</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none">
                    Highlights
                  </h3>
                </div>
                <Link href="/highlights" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-kanit border-b border-foreground/10 pb-0.5">
                  Ver Todo
                </Link>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-px-2 swipe-ignore">
                {highlights.slice(0, 5).map((highlight) => (
                  <Link
                    key={highlight.id}
                    href={`/highlights?v=${highlight.id}`}
                    className="snap-start min-w-[200px] shrink-0"
                  >
                    <div className="relative aspect-[9/16] overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl group">
                      {highlight.thumbnail_url ? (
                        <img src={highlight.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="absolute inset-0 bg-surface-elevated" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary fill-primary" />
                         </div>
                      </div>

                      <div className="absolute inset-x-4 bottom-5 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl overflow-hidden border border-white/20 bg-surface">
                          {highlight.profiles?.avatar_url ? (
                            <img src={highlight.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-white/40 font-kanit">
                              {highlight.profiles?.name?.charAt(0) || 'J'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-black uppercase tracking-widest text-white font-kanit italic">
                            @{highlight.profiles?.name || 'Jugador'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recommended Matches */}
            <section className="space-y-4">
              <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-kanit italic">Radar Pro</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none">
                    Partidos Para Vos
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {recommendedMatches.slice(0, 3).map((match) => (
                  <Link
                    key={match.id}
                    href={`/match?id=${match.id}`}
                    className="block"
                  >
                    <div className="rounded-[2rem] border border-white/5 bg-surface-elevated/40 p-5 shadow-lg backdrop-blur-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary/10 rounded-bl-2xl border-l border-b border-primary/20">
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary font-kanit italic">Recomendado</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 font-kanit italic mb-1">
                            {SPORT_META[getMatchSport(match)].icon} {getFormatMeta(match.type, getMatchSport(match)).label}
                          </p>
                          <h4 className="text-lg font-black italic uppercase tracking-tighter text-foreground font-kanit truncate">
                            {match.location}
                          </h4>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-foreground/40 font-kanit">
                            {match.date} · <span className="text-primary">{match.time} hs</span>
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                           <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 xl:col-span-8 space-y-8 order-2 lg:order-1">
              {/* --- DASHBOARD TAB CONTROLLER --- */}
              <section className="sticky top-24 z-40 pb-6">
                <div className="w-full rounded-[2.5rem] p-1.5 bg-surface-elevated/80 backdrop-blur-xl border border-white/5 shadow-2xl flex items-center gap-1.5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  {[
                    { id: 'activity', label: 'Feed', icon: Activity },
                    { id: 'teams', label: 'Equipos', icon: Users },
                    { id: 'social', label: 'Social', icon: MessageSquare },
                    { id: 'futtok', label: focusSportMeta.highlightLabel, icon: Flame },
                  ].map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "relative flex-1 h-12 rounded-full flex items-center justify-center gap-3 transition-all duration-500 group overflow-hidden",
                          isSelected ? "text-black" : "text-foreground/40 hover:text-foreground/70"
                        )}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-dashboard-pill"
                            className="absolute inset-0 bg-primary shadow-[0_0_20px_rgba(44,252,125,0.4)]"
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                          />
                        )}
                        <tab.icon className={cn(
                          "w-4 h-4 relative z-10 transition-transform duration-500",
                          isSelected ? "scale-110" : "group-hover:scale-110"
                        )} />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] italic relative z-10 font-kanit">
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
                    className="space-y-10"
                  >
                    <motion.section
                      id="stat-cards"
                      className="grid grid-cols-4 gap-5"
                    >
                      {statCardsData.map((stat, i) => (
                        <div key={i} className="rounded-[2.5rem] p-6 bg-surface-elevated border border-white/5 shadow-xl group hover:border-primary/20 transition-all duration-500">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-foreground/5 border border-white/5 group-hover:scale-110 transition-transform" style={{ color: stat.color }}>
                              <stat.icon className="w-6 h-6" />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 font-kanit">{stat.label}</p>
                           <p className="text-3xl font-black italic text-foreground mt-1 font-kanit tracking-tighter">{stat.value}</p>
                        </div>
                      ))}
                    </motion.section>

                    <motion.section
                      variants={fadeUp}
                      className="space-y-6"
                    >
                      <div className="flex items-end justify-between px-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-kanit italic">Progreso</p>
                          <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                            Road to Glory
                          </h2>
                        </div>
                        <Sparkles className="w-6 h-6 text-primary/20 animate-pulse" />
                      </div>

                      <div className="bg-surface-elevated/40 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05),transparent_70%)]" />
                        
                        <div className="relative z-10 space-y-12">
                          {/* Rank Nodes */}
                          <div className="relative flex items-center justify-between px-10">
                            {/* Track Base */}
                            <div className="absolute left-0 right-0 h-1 bg-white/5 rounded-full top-1/2 -translate-y-1/2" />
                            
                            {/* Track Active */}
                            <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: '100%' }}
                               className="absolute left-0 h-1 bg-primary shadow-[0_0_15px_rgba(44,252,125,0.5)] rounded-full top-1/2 -translate-y-1/2"
                               style={{ width: `${(statsSummary.elo / 1000) * 100}%` }}
                            />

                            {RANKS.slice(0, 5).map((rankItem, i) => {
                               const isReached = statsSummary.elo >= rankItem.minElo;
                               const isCurrent = rankCalculation.info.name === rankItem.name;
                               return (
                                 <div key={i} className="relative z-10 flex flex-col items-center">
                                    <div className={cn(
                                       "w-16 h-16 rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-500",
                                       isReached ? "bg-surface-elevated border-primary shadow-[0_0_20px_rgba(44,252,125,0.2)]" : "bg-surface-elevated/50 border-white/10 opacity-30 grayscale"
                                    )}>
                                       <RankBadgeInline rankName={rankItem.name} size="md" />
                                    </div>
                                    <p className={cn(
                                       "absolute top-20 text-[10px] font-black uppercase tracking-widest font-kanit italic",
                                       isReached ? "text-foreground" : "text-foreground/20"
                                    )}>{rankItem.name}</p>
                                 </div>
                               )
                            })}
                          </div>

                          {/* Quick Detailed Stats */}
                          <div className="grid grid-cols-3 gap-6 pt-10">
                             {[
                               { label: 'Elo actual', value: statsSummary.elo, icon: Zap, color: 'text-primary' },
                               { label: 'Win Rate', value: `${statsSummary.winRate}%`, icon: TrendingUp, color: 'text-foreground' },
                               { label: 'Matches', value: statsSummary.totalMatches, icon: Activity, color: 'text-foreground' }
                             ].map((s, i) => (
                               <div key={i} className="bg-foreground/[0.03] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                     <s.icon className={cn("w-5 h-5", s.color)} />
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 font-kanit">{s.label}</p>
                                     <p className="text-xl font-black italic text-foreground font-kanit">{s.value}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    </motion.section>

                    <section className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-kanit italic">Actividad</p>
                          <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                            Comunidad Live
                          </h2>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {activities.map((activity, idx) => (
                          <div key={idx} className="group p-6 rounded-[2rem] bg-surface-elevated/40 border border-white/5 hover:border-primary/20 transition-all duration-300 flex items-center gap-6">
                             <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Activity className="w-6 h-6 text-primary" />
                             </div>
                             <div className="flex-1">
                                <p className="text-lg font-bold text-foreground font-kanit italic uppercase leading-none">
                                   {activity.user}
                                </p>
                                <p className="text-foreground/40 text-sm mt-1">
                                   {activity.detail}
                                </p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest font-kanit italic">{activity.time}</p>
                             </div>
                          </div>
                        ))}
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
                    className="space-y-10"
                  >
                    <div className="flex items-end justify-between px-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-kanit italic">Clubes</p>
                        <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                          Mis Equipos
                        </h2>
                      </div>
                      <Link href="/teams" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-kanit border-b border-foreground/10 pb-0.5">
                        Ver Todos
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      {userTeams.length > 0 ? (
                        userTeams.map((team) => (
                          <div key={team.id} className="group p-6 rounded-[2.5rem] bg-surface-elevated/40 border border-white/5 hover:border-primary/20 transition-all duration-500 flex items-center gap-8">
                             <div className="w-20 h-20 rounded-3xl bg-surface border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl group-hover:scale-105 transition-transform">
                                {team.logo_url ? <img src={team.logo_url} alt="" className="w-full h-full object-cover" /> : <Shield className="w-10 h-10 text-foreground/10" />}
                             </div>
                             <div className="flex-1">
                                <h3 className="text-2xl font-black italic text-foreground uppercase font-kanit tracking-tighter">{team.name}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                   <div className="flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full border border-white/5">
                                      <Users className="w-3.5 h-3.5 text-primary" />
                                      <span className="text-[10px] font-black text-foreground/60 uppercase font-kanit italic">{team.members_count} Jugadores</span>
                                   </div>
                                   <div className="flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full border border-white/5">
                                      <Trophy className="w-3.5 h-3.5 text-primary" />
                                      <span className="text-[10px] font-black text-foreground/60 uppercase font-kanit italic">Level {team.level || 1}</span>
                                   </div>
                                </div>
                             </div>
                             <button className="px-8 h-12 rounded-2xl bg-foreground/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:bg-primary hover:text-black hover:border-primary transition-all font-kanit italic">
                                GESTIONAR
                             </button>
                          </div>
                        ))
                      ) : (
                        <EmptyState icon={Shield} title="Sin Plantel" description="Aún no eres parte de ningún equipo." />
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
                    className="space-y-10"
                  >
                    <div className="flex items-end justify-between px-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-kanit italic">Social</p>
                        <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                          3er Tiempo
                        </h2>
                      </div>
                      <Link href="/feed" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-kanit border-b border-foreground/10 pb-0.5">
                        Ir al Muro
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {recentPosts.length > 0 ? (
                        recentPosts.map((post, idx) => (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-surface-elevated/60 rounded-[3rem] border border-white/5 overflow-hidden group hover:border-primary/10 transition-all duration-300"
                          >
                            <div className="p-8 flex flex-col gap-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-surface shadow-xl">
                                    {post.author.avatar_url ? (
                                      <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-foreground/10 font-bold text-xl font-kanit italic uppercase">
                                        {post.author.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xl font-black italic text-foreground leading-none font-kanit uppercase">{post.author.name}</p>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 font-kanit italic">
                                      @{post.author.handle || post.author.name.toLowerCase().replace(/\s+/g, '')}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest font-kanit italic">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              <p className="text-xl text-foreground font-medium leading-snug italic font-kanit">
                                "{post.content}"
                              </p>

                              <div className="flex items-center gap-8 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-primary font-kanit italic text-sm font-black">
                                  <Heart className="w-4 h-4 fill-primary" />
                                  <span>{post.likes_count} LIKES</span>
                                </div>
                                <div className="flex items-center gap-2 text-foreground/40 font-kanit italic text-sm font-black">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{post.comments_count} RESPUESTAS</span>
                                </div>
                                <Link href={`/feed?post=${post.id}`} className="ml-auto">
                                   <button className="h-10 px-6 rounded-xl bg-foreground/5 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-primary hover:text-black transition-all font-kanit italic">
                                      VER CONVERSACIÓN
                                   </button>
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <EmptyState icon={MessageSquare} title="Silencio en el Muro" description="Se el primero en postear algo épico." />
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
                    className="space-y-10"
                  >
                    <div className="flex items-end justify-between px-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-kanit italic">Highlights</p>
                        <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                          Tendencias Clips
                        </h2>
                      </div>
                      <Link href="/highlights" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-kanit border-b border-foreground/10 pb-0.5">
                        Ver Todo
                      </Link>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-none snap-x h-[450px]">
                      {highlights.length > 0 ? (
                        highlights.map((h) => (
                          <Link key={h.id} href={`/highlights?v=${h.id}`} className="shrink-0 aspect-[9/16] h-full rounded-[3rem] overflow-hidden relative group snap-start border border-white/5 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                            <div className="absolute inset-0 bg-surface z-0" />
                            {h.thumbnail_url && <img src={h.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-1" />}
                            
                            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                               <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center">
                                  <Play className="w-8 h-8 text-primary fill-primary" />
                               </div>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-surface border border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
                                {h.profiles?.avatar_url ? <img src={h.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User2 className="w-4 h-4 text-white/40" />}
                              </div>
                              <span className="text-[11px] font-black text-white font-kanit italic uppercase tracking-widest">@{h.profiles?.name || 'jugador'}</span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <EmptyState icon={Flame} title="Sin Brillo" description="Aún no hay clips tendencia." />
                      )}
                      
                      <Link href="/highlights" className="shrink-0 aspect-[9/16] h-full rounded-[3rem] bg-surface-elevated/40 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 group hover:border-primary/40 transition-all text-foreground/20 snap-start">
                        <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                          <PlusCircle className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] font-kanit italic">Subir Clip</span>
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
              {/* Featured / Next Match Card */}
              <div id="featured-match" className="relative group/match overflow-hidden rounded-[3rem] bg-surface-elevated border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-kanit italic">Próximo</p>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground font-kanit">Agenda Pro</h3>
                    </div>
                    {nextMatch && (
                      <div className="h-10 px-4 rounded-2xl bg-foreground/5 border border-white/5 flex items-center justify-center">
                         <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest font-kanit">
                            {nextMatchMeta.icon} {nextMatchFormat?.label || nextMatch.type || 'F5'}
                         </span>
                      </div>
                    )}
                  </div>

                  {nextMatch ? (
                    <div className="space-y-8">
                      {/* Matchup Visualization */}
                      <div className="relative rounded-[2.5rem] bg-surface p-8 border border-white/5 shadow-inner overflow-hidden group/matchup">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03),transparent)]" />
                        
                        <div className="relative z-10 flex items-center justify-between gap-4">
                           {/* Team A */}
                           <div className="flex flex-col items-center gap-4 flex-1">
                              <div className="w-20 h-20 rounded-2xl bg-surface-elevated border border-white/5 p-3 shadow-xl group-hover/matchup:scale-105 transition-transform">
                                 <JerseyVisualizer primaryColor="#10b981" secondaryColor="#ffffff" pattern="hoops" className="w-full h-full" />
                              </div>
                              <p className="text-sm font-black italic text-foreground uppercase font-kanit tracking-tighter truncate w-full text-center">
                                 {nextMatch.team_a_name || 'LOCAL'}
                              </p>
                           </div>

                           <div className="text-2xl font-black italic text-foreground/20 font-kanit">VS</div>

                           {/* Team B */}
                           <div className="flex flex-col items-center gap-4 flex-1">
                              <div className="w-20 h-20 rounded-2xl bg-surface-elevated border border-white/5 p-3 shadow-xl group-hover/matchup:scale-105 transition-transform">
                                 <JerseyVisualizer primaryColor="#3b82f6" secondaryColor="#ffffff" pattern="vertical" className="w-full h-full" />
                              </div>
                              <p className="text-sm font-black italic text-foreground uppercase font-kanit tracking-tighter truncate w-full text-center">
                                 {nextMatch.team_b_name || 'VISITA'}
                              </p>
                           </div>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-foreground/5 border border-white/5 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest font-kanit mb-1">Fecha</p>
                            <p className="text-sm font-black italic text-foreground font-kanit uppercase">
                               {new Date(nextMatch.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                            </p>
                         </div>
                         <div className="bg-foreground/5 border border-white/5 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest font-kanit mb-1">Hora</p>
                            <p className="text-sm font-black italic text-foreground font-kanit">{nextMatch.time?.slice(0, 5)} HS</p>
                         </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Link href={`/match?id=${nextMatch.id}`} className="w-full">
                           <button className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_10px_20px_rgba(44,252,125,0.2)] hover:scale-[1.02] transition-all font-kanit italic">
                              VER ENCUENTRO
                           </button>
                        </Link>
                        <CalendarButton match={nextMatch} className="w-full h-14 rounded-2xl bg-foreground/5 text-foreground/40 font-black uppercase text-[10px] tracking-widest hover:bg-foreground/10 transition-all font-kanit italic" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center text-center gap-6">
                       <div className="w-20 h-20 rounded-3xl bg-foreground/5 border border-white/5 flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-foreground/20" />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground/80 font-kanit">Agenda Libre</h4>
                          <p className="text-xs text-foreground/40 font-medium max-w-[200px]">No hay encuentros programados por ahora.</p>
                       </div>
                       <Link href="/search" className="w-full">
                          <button className="w-full h-12 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:bg-foreground/5 transition-all font-kanit italic">
                             BUSCAR PARTIDO
                          </button>
                       </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Card */}
              <div className="bg-surface-elevated/40 rounded-[3rem] border border-white/5 p-8 space-y-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-kanit italic">Radar</p>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground font-kanit">Para Vos</h3>
                   </div>
                   <Sparkles className="w-5 h-5 text-primary/20" />
                </div>

                <div className="space-y-4">
                   {recommendedMatches.slice(0, 4).map((match) => (
                     <Link key={match.id} href={`/match?id=${match.id}`} className="block group">
                        <div className="p-5 rounded-[2rem] bg-foreground/[0.03] border border-white/5 group-hover:border-primary/20 transition-all duration-300">
                           <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary font-kanit italic mb-1">
                              {SPORT_META[getMatchSport(match)].icon} {getFormatMeta(match.type, getMatchSport(match)).label}
                           </p>
                           <h4 className="text-base font-black italic uppercase tracking-tighter text-foreground font-kanit group-hover:text-primary transition-colors truncate">
                              {match.location}
                           </h4>
                           <p className="text-[10px] font-black text-foreground/30 uppercase mt-1 tracking-widest font-kanit italic">
                              {match.date} · {match.time} HS
                           </p>
                        </div>
                     </Link>
                   ))}
                </div>
              </div>

              {/* Quick Access Links */}
              <div className="bg-surface-elevated/40 rounded-[3rem] border border-white/5 p-8 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 font-kanit italic">Acceso Rápido</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Establecimientos', icon: MapPin, href: '/establecimientos' },
                    { label: 'Mis Amigos', icon: Users, href: '/friends' },
                    { label: 'Chat Global', icon: MessageSquare, href: '/messages' },
                    { label: 'Configuración', icon: Target, href: '/settings' }
                  ].map((link, idx) => (
                    <Link key={idx} href={link.href}>
                      <button className="w-full h-12 px-5 rounded-2xl flex items-center justify-between group hover:bg-foreground/5 transition-all border border-white/5">
                        <div className="flex items-center gap-3">
                          <link.icon className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 font-kanit italic group-hover:text-foreground">{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:translate-x-1 transition-all" />
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}



        <footer className="mt-20 pt-20 pb-16 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(var(--primary-rgb),0.02),transparent_70%)]" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
            <div className="md:col-span-5 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-white/5 p-2.5 flex items-center justify-center">
                   <img src="/logo_pelotify.png" alt="Pelotify Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit">PELOTI<span className="text-primary">FY</span></h2>
                   <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] font-kanit">Stadium Pro Ecosystem</p>
                </div>
              </div>
              <p className="text-sm text-foreground/40 font-medium tracking-wide leading-relaxed max-w-sm italic">
                La plataforma definitiva para organizar fútbol, padel y basket amateur. Elevamos tu juego al siguiente nivel con tecnología de vanguardia y una comunidad imparable.
              </p>
              
              <div className="flex items-center gap-4">
                 {[Twitter, Instagram, Github].map((Icon, i) => (
                   <button key={i} className="w-10 h-10 rounded-xl bg-foreground/5 border border-white/5 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/40 transition-all">
                      <Icon className="w-5 h-5" />
                   </button>
                 ))}
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground font-kanit italic">Plataforma</h4>
                  <ul className="space-y-4">
                     {['Feed', 'Equipos', 'Ranks', 'Torneos'].map(item => (
                       <li key={item}><a href="#" className="text-xs font-bold text-foreground/40 hover:text-primary transition-colors">{item}</a></li>
                     ))}
                  </ul>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground font-kanit italic">Soporte</h4>
                  <ul className="space-y-4">
                     {['Ayuda', 'Términos', 'Privacidad', 'Contacto'].map(item => (
                       <li key={item}><a href="#" className="text-xs font-bold text-foreground/40 hover:text-primary transition-colors">{item}</a></li>
                     ))}
                  </ul>
               </div>
               <div className="space-y-6 col-span-2 sm:col-span-1">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground font-kanit italic">Comunidad</h4>
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                     <p className="text-[10px] font-bold text-primary leading-relaxed">
                        Sumate a los +10,000 jugadores que ya están compitiendo.
                     </p>
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] font-kanit italic">© 2026 Pelotify Pro. All glory reserved.</span>
            <div className="flex items-center gap-6">
               <span className="flex items-center gap-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest font-kanit italic">
                  Engineered for <Sparkles className="w-3.5 h-3.5 text-primary" /> greatness
               </span>
            </div>
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

