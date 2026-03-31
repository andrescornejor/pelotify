'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
import { StatCard, TeamCard, RankBadgeInline, EmptyState, SectionDivider, LazyVideo, HomePageSkeleton, RANKS, getRankByElo } from '@/components/home';
import { useHomeData } from '@/hooks/useHomeData';

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: homeData, isLoading: isDataLoading } = useHomeData(user?.id);
  
  const userTeams = homeData?.userTeams || [];
  const nextMatch = homeData?.nextMatch || null;
  const activities = homeData?.activities || [];
  const totalPlayers = homeData?.totalPlayers || 0;
  const highlights = homeData?.highlights || [];

  const [greeting, setGreeting] = useState('');
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const { performanceMode, setPerformanceMode } = useSettings();
  const [scrollProgress, setScrollProgress] = useState(0);

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

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div
      className={cn(
        'relative min-h-screen bg-background font-sans selection:bg-primary selection:text-background pb-20 md:pb-0',
        performanceMode && 'perf-mode'
      )}
    >
      <OnboardingTour />
      
      {/* Mobile performance toggle */}
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 space-y-10 lg:space-y-14">
        
        {/* HEADER SECTION */}
        <header className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative group cursor-pointer">
              <div
                className="absolute -inset-2 blur-xl rounded-full opacity-30 transition-opacity"
                style={{ backgroundColor: rankCalculation.rank.glow }}
              />
              <div
                className="relative w-14 h-14 rounded-full border-2 overflow-hidden flex items-center justify-center bg-surface shadow-2xl"
                style={{ borderColor: rankCalculation.info.color }}
              >
                {metadata?.avatar_url ? (
                  <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User2 className="w-6 h-6 text-foreground/40" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border border-white/10 flex items-center justify-center shadow-lg">
                <rankCalculation.rank.icon className="w-3.5 h-3.5" style={{ color: rankCalculation.rank.hex }} />
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/90 font-outfit">
                {greeting}
              </span>
              <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase font-kanit">
                {userName}
              </h1>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
             <Link href="/settings">
                <button className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors hover:border-primary/30">
                   <Zap className="w-5 h-5" />
                </button>
             </Link>
          </div>
        </header>

        {/* 1. PRIMARY FOCUS: NEXT MATCH OR EMPTY AGENDA */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#2cfc7d]" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest font-outfit">Tu Agenda</h2>
          </div>

          {nextMatch ? (
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-surface to-background shadow-2xl group cursor-pointer">
              {!performanceMode && (
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/[0.03] blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                </>
              )}
              
              <Link href={`/match?id=${nextMatch.id}`} className="block p-6 sm:p-8 relative z-10 w-full">
                <div className="flex justify-between items-start mb-6">
                   <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-primary" />
                       <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{nextMatch.type || 'F5'} • {new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
                   </div>
                   {countdownText && (
                      <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
                        {countdownText}
                      </div>
                   )}
                </div>

                <div className="flex items-center justify-between lg:justify-center gap-4 sm:gap-12 relative">
                   <div className="flex flex-col items-center gap-3 relative z-10 w-[45%] lg:w-48">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-surface to-background border border-white/10 flex items-center justify-center p-2 sm:p-4 shadow-xl">
                        <JerseyVisualizer primaryColor="#18181b" secondaryColor="#2cfc7d" pattern="vertical" className="w-full h-full" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black uppercase italic tracking-tighter text-foreground text-center truncate w-full">{(nextMatch.team_a_name && nextMatch.team_a_name !== 'Team A') ? nextMatch.team_a_name : 'LOCAL'}</span>
                   </div>

                   <div className="flex flex-col items-center">
                     <span className="text-2xl sm:text-4xl font-black italic text-foreground/20 font-kanit">VS</span>
                     <span className="text-xl sm:text-2xl font-black italic text-primary font-kanit mt-1">{nextMatch.time}</span>
                   </div>

                   <div className="flex flex-col items-center gap-3 relative z-10 w-[45%] lg:w-48">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-surface to-background border border-white/10 flex items-center justify-center p-2 sm:p-4 shadow-xl">
                        <JerseyVisualizer primaryColor="#10b981" secondaryColor="#ffffff" pattern="hoops" className="w-full h-full" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black uppercase italic tracking-tighter text-foreground text-center truncate w-full">{(nextMatch.team_b_name && nextMatch.team_b_name !== 'Team B') ? nextMatch.team_b_name : 'VISITANTE'}</span>
                   </div>
                </div>

                <div className="mt-8 flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 w-full max-w-sm mx-auto">
                   <MapPin className="w-4 h-4 text-primary shrink-0" />
                   <span className="text-xs font-medium text-foreground/80 truncate">{nextMatch.location || 'Sede por confirmar, mantente atento'}</span>
                   <ChevronRight className="w-4 h-4 text-foreground/40 ml-auto shrink-0 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[2rem] glass-premium p-8 sm:p-12 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8 group">
               <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 flex-1 text-center sm:text-left">
                 <div className="w-20 h-20 rounded-full bg-surface/50 flex flex-col items-center justify-center border border-white/10 text-primary/40">
                    <Calendar className="w-8 h-8 opacity-50 mb-1" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit">Agenda Libre</h3>
                    <p className="text-xs font-medium text-foreground/50 max-w-sm">No tienes partidos programados. ¡Es hora de saltar a la cancha y jugar!</p>
                 </div>
               </div>
               <div className="flex flex-col gap-3 w-full sm:w-auto relative z-10 shrink-0">
                  <Link href="/create" className="w-full sm:w-64">
                    <button className="w-full h-14 rounded-full bg-primary text-black font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_0_20px_rgba(44,252,125,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                      <PlusCircle className="w-4 h-4" /> ARMAR PARTIDO
                    </button>
                  </Link>
                  <Link href="/search" className="w-full sm:w-64">
                    <button className="w-full h-14 rounded-full glass border border-white/10 text-foreground font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                      <Search className="w-4 h-4 text-primary" /> BUSCAR PARTIDO
                    </button>
                  </Link>
               </div>
            </div>
          )}
        </motion.section>

        {/* 2. QUICK ACTIONS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
           {[
             { label: 'ARMAR MATCH', desc: 'Crea tu juego', icon: PlusCircle, href: '/create', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
             { label: 'MERCADO', desc: 'Fichajes', icon: Target, href: '/scouting', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
             { label: 'EQUIPOS', desc: 'Tus planteles', icon: Users, href: '/teams', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
             { label: 'FUTTOK', desc: 'Highlights', icon: Play, href: '/highlights', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' }
           ].map((action, idx) => (
             <Link key={idx} href={action.href}>
                <motion.div 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center sm:items-start justify-center p-4 rounded-2xl glass border border-white/5 hover:bg-white/[0.02] hover:border-white/10 transition-all gap-3 h-full group"
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", action.bg, action.color)}>
                     <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-center sm:text-left">
                     <span className="text-[10px] font-black uppercase tracking-widest text-foreground block">{action.label}</span>
                     <span className="text-[9px] font-medium text-foreground/40 hidden sm:block mt-1">{action.desc}</span>
                  </div>
                </motion.div>
             </Link>
           ))}
        </section>

        {/* 3. PERFORMANCE & RANK */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-foreground italic uppercase tracking-tighter font-kanit">ROAD TO GLORY</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             <div className="lg:col-span-8 glass-premium p-6 sm:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden flex flex-col justify-center">
              <div
                  className="absolute -top-40 -right-40 w-80 h-80 blur-[100px] opacity-20 pointer-events-none"
                  style={{ backgroundColor: rankCalculation.info.color }}
              />
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10 w-full mb-8">
                 <div className="shrink-0 scale-125 sm:scale-150 transform sm:origin-top-left mt-2 sm:mt-0">
                    <RankBadgeInline rankName={rankCalculation.info.name} size="lg" />
                 </div>
                 <div className="flex-1 flex flex-col items-center sm:items-start w-full">
                    <p className="text-[10px] font-semibold text-foreground/40 tracking-widest uppercase font-outfit mb-1">Liga Actual</p>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-2">
                       <h3 className="text-3xl sm:text-4xl font-black italic text-foreground leading-none font-kanit uppercase tracking-tighter">
                         {rankCalculation.info.name}
                       </h3>
                       <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                         <span className="text-xs font-black text-primary italic font-kanit">TOP {Math.max(1, 100 - statsSummary.winRate)}%</span>
                         <span className="text-[8px] font-medium text-foreground/40 uppercase tracking-widest">Global</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="relative z-10 w-full">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black text-foreground/50 uppercase tracking-widest">{statsSummary.elo} ELO</span>
                    <div className="flex items-center gap-1.5 opacity-40">
                       <span className="text-[9px] font-black text-foreground uppercase tracking-widest">{rankCalculation.nextRank.name}</span>
                       <rankCalculation.nextRank.icon className="w-3 h-3" style={{ color: rankCalculation.nextRank.color }} />
                    </div>
                 </div>
                 <div className="h-3 relative rounded-full bg-surface border border-white/5 overflow-hidden">
                    <motion.div
                       initial={{ width: 0 }}
                       whileInView={{ width: `${Math.min(100, rankCalculation.progress)}%` }}
                       viewport={{ once: true }}
                       transition={{ duration: 1.5, ease: 'easeOut' }}
                       className="absolute top-0 left-0 h-full rounded-full"
                       style={{
                         background: `linear-gradient(90deg, ${rankCalculation.info.color}, #5dfd9d)`,
                         boxShadow: `0 0 10px ${rankCalculation.info.color}40`,
                       }}
                    />
                 </div>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
               {[
                  { label: 'PARTIDOS', value: statsSummary.totalMatches, icon: Activity, color: '#2cfc7d' },
                  { label: 'VICTORIAS', value: statsSummary.matchesWon, icon: Star, color: '#f59e0b' },
                  { label: 'WIN RATE', value: `${statsSummary.winRate}%`, icon: TrendingUp, color: '#ef4444' },
                  { label: 'MVPs', value: metadata?.mvp_count || 0, icon: Award, color: '#8b5cf6' }
               ].map((stat, idx) => (
                 <div key={idx} className="glass-premium p-4 md:p-5 rounded-2xl border border-white/5 flex flex-col justify-between aspect-square group">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-2" style={{ backgroundColor: `${stat.color}15` }}>
                       <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <div>
                       <span className="text-2xl font-black italic tracking-tighter text-foreground font-kanit leading-none block">{stat.value}</span>
                       <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mt-1 block">{stat.label}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* 4. CONTENT WRAPPER: Highlights & Community */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          
          <section className="space-y-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-black text-foreground italic uppercase tracking-tighter font-kanit">TENDENCIAS FUTTOK</h2>
              </div>
              <Link href="/highlights" className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-light transition-colors flex items-center gap-1">
                 Ver todo <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none snap-x h-[320px] sm:h-[400px]">
              {highlights.length > 0 ? (
                highlights.map((h: Highlight) => (
                  <Link key={h.id} href={`/highlights?v=${h.id}`} className="shrink-0 aspect-[9/16] h-full rounded-[2rem] overflow-hidden relative group snap-start border border-white/5 bg-surface">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-10 pointer-events-none" />
                    <LazyVideo 
                      src={h.video_url} 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-[8px] rounded-full font-black text-white italic z-20 flex items-center gap-1 drop-shadow-md">
                       <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-surface border border-white/20 overflow-hidden flex-shrink-0">
                          {h.profiles?.avatar_url ? (
                            <img src={h.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <User2 className="w-3 h-3 text-white/40 m-auto mt-[4px]" />
                          )}
                        </div>
                        <span className="text-[10px] font-black text-white truncate drop-shadow-md">@{h.profiles?.name || 'user'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 w-fit px-2 py-1 rounded-full backdrop-blur-md border border-white/10">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-[9px] font-black text-white">{h.likes_count}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                [1, 2].map((i: number) => (
                  <div key={i} className="shrink-0 aspect-[9/16] h-full rounded-[2rem] bg-surface/50 border border-white/5 animate-pulse" />
                ))
              )}
              
              <Link href="/highlights" className="shrink-0 aspect-[9/16] h-full rounded-[2rem] glass border-dashed border-white/20 flex flex-col items-center justify-center gap-4 group hover:border-primary/40 hover:bg-primary/5 transition-all text-foreground/30 snap-start">
                 <div className="w-12 h-12 rounded-full bg-surface group-hover:bg-primary border border-white/5 group-hover:border-primary flex items-center justify-center transition-all duration-300">
                    <PlusCircle className="w-6 h-6 text-primary group-hover:text-black transition-colors" />
                 </div>
                 <span className="text-[10px] font-black tracking-widest uppercase text-center px-4 group-hover:text-primary transition-colors">Subir tu<br/>Jugada</span>
              </Link>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-black text-foreground italic uppercase tracking-tighter font-kanit">COMUNIDAD ACTIVA</h2>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 sm:p-5 rounded-2xl glass border border-white/5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                      {activity.type === 'RANK_UP' ? <TrendingUp className="w-5 h-5 text-primary" /> : <Star className="w-5 h-5 text-orange-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {activity.user}
                      </p>
                      <p className="text-[10px] sm:text-xs font-medium text-foreground/50 truncate">
                        {activity.detail}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                       <span className="text-[8px] sm:text-[9px] font-black text-foreground/30 uppercase tracking-widest">{activity.time}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState 
                  icon={Activity}
                  title="Sin Actividad"
                  description="Aún no hay movimientos recientes. ¡Sé el primero en jugar un partido!"
                />
              )}
            </div>
            
            <Link href="/teams" className="block w-full mt-4">
               <button className="w-full h-12 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                  Ver Clubes Top
               </button>
            </Link>
          </section>
        </div>

      </div>
    </div>
  );
}