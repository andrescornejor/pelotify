'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Users,
  Calendar,
  ChevronRight,
  TrendingUp,
  PlusCircle,
  Search,
  Flame,
  User2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';
import { RankBadgeInline } from './RankBadge';
import { SportSelector } from './SportSelector';
import type { Sport } from '@/lib/sports';

interface DesktopHeroProps {
  selectedSport: Sport;
  setSelectedSport: (sport: Sport) => void;
  focusSportMeta: any;
  sportTheme: { accent: string; accentDark: string; accentRgb: string; gradient: string };
  greeting: string;
  userName: string;
  metadata: Record<string, any>;
  statsSummary: { totalMatches: number; wins: number; winRate: number; elo: number; upcomingMatches: number };
  rankCalculation: any;
  performanceMode: boolean;
  reduceAnimations: boolean;
}

export function DesktopHeroSection({
  selectedSport,
  setSelectedSport,
  focusSportMeta,
  sportTheme,
  greeting,
  userName,
  metadata,
  statsSummary,
  rankCalculation,
  performanceMode,
  reduceAnimations,
}: DesktopHeroProps) {
  // Pre-calculate design tokens for performance
  const accentColor = sportTheme.accent;
  const accentRgb = sportTheme.accentRgb;
  
  const containerClasses = cn(
    "relative overflow-hidden rounded-[2.5rem] lg:rounded-[3.5rem] border border-foreground/10 bg-background transition-all duration-700 ease-in-out shadow-2xl",
    !performanceMode && "shadow-[0_40px_100px_rgba(0,0,0,0.12)]",
    performanceMode && "shadow-none border-foreground/5"
  );

  const Background = () => {
    if (performanceMode) {
      return (
        <div className="absolute inset-0 z-0 select-none opacity-40">
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 50%)` 
            }}
          />
        </div>
      );
    }

    return (
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSport}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Highly Optimized Mesh Gradient - 3 points of light */}
            <div 
              className="absolute inset-0 opacity-[0.08]"
              style={{
                background: `
                  radial-gradient(at 0% 0%, ${accentColor} 0px, transparent 45%),
                  radial-gradient(at 100% 0%, rgba(${accentRgb}, 0.3) 0px, transparent 40%),
                  radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.15) 0px, transparent 40%)
                `
              }}
            />
            {/* Subtle Dot Pattern - CSS Only */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{ 
                backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>
    );
  };

  return (
    <section className={containerClasses} style={{ transform: 'translateZ(0)' }}>
      <Background />

      <div className="relative z-10 grid grid-cols-12 gap-8 lg:gap-12 p-8 sm:p-12 lg:p-14 xl:p-16">
        {/* LEFT: Branding & Identity (7/12) */}
        <div className="col-span-12 lg:col-span-7 space-y-8 lg:space-y-10">
          <div className="flex flex-col gap-5">
            <div className="inline-flex items-center gap-3 w-fit px-4 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/10">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/45 font-kanit">
                {greeting}, {userName}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={selectedSport}
                initial={reduceAnimations ? {} : { opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceAnimations ? {} : { opacity: 0, x: 15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="font-black italic uppercase font-kanit tracking-tighter text-foreground leading-[0.82]"
                style={{ fontSize: 'clamp(2.8rem, 8.5vw, 6.5rem)' }}
              >
                {focusSportMeta.homeHeadline.split(' ')[0].toUpperCase()} <br />
                <span className="text-primary italic">{focusSportMeta.homeHeadline.split(' ').slice(1).join(' ').toUpperCase()}</span>
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* VIP ID CARD - Refined & Light */}
          <div className="group relative flex items-stretch w-fit rounded-[2.5rem] overflow-hidden border border-foreground/10 bg-surface/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:scale-[1.01] hover:border-primary/20">
            <div className="w-2.5" style={{ backgroundColor: rankCalculation.info.color }} />
            <div className="flex items-center gap-8 px-10 py-6 pr-12">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-foreground/10 bg-background/40 p-1.5">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-foreground/5">
                    {metadata?.avatar_url ? (
                      <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User2 className="w-10 h-10 text-foreground/15" />
                      </div>
                    )}
                  </div>
                </div>
                <div 
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full border-[3px] border-background flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: rankCalculation.info.color }}
                >
                  <rankCalculation.rank.icon className="w-4 h-4 text-black" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-[0.4em] text-foreground/35 font-kanit uppercase">ID PELOTIFY</span>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none mt-1.5 transition-colors group-hover:text-primary">
                  {userName}
                </h3>
                <div className="mt-2.5 flex items-center gap-4 text-[10px] font-bold text-foreground/45 tracking-widest uppercase">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-primary" /> {rankCalculation.info.name}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-foreground/20" />
                  <span>NIVEL {Math.floor(statsSummary.elo / 100)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PERFORMANCE STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-4">
            {[
              { label: `${focusSportMeta.shortLabel} JUGADOS`, value: statsSummary.totalMatches, icon: Calendar, color: "text-foreground" },
              { label: 'WIN RATE', value: `${statsSummary.winRate}%`, icon: TrendingUp, color: "text-primary" },
              { label: 'VICTORIAS', value: statsSummary.wins, icon: Trophy, color: "text-foreground" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2 text-foreground/35 uppercase tracking-[0.25em]">
                  <stat.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black">{stat.label}</span>
                </div>
                <p className={cn("text-3xl font-black italic tracking-tighter uppercase font-kanit", stat.color)}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Actions & Status (5/12) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 justify-center">
          {/* Integrated Sport Selector */}
          <div className="hidden lg:block origin-right">
             <SportSelector selectedSport={selectedSport} onSelect={setSelectedSport} variant="compact" />
          </div>

          {/* LEAGUE PROGRESS */}
          <div className="p-8 rounded-[2.5rem] border border-foreground/10 bg-surface/20 backdrop-blur-md space-y-6 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-5">
                <RankBadgeInline rankName={rankCalculation.info.name} size="lg" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] leading-none">ESTADO TEMPORADA</p>
                  <h4 className="text-2xl font-black italic uppercase tracking-tight text-foreground font-kanit">{rankCalculation.info.name}</h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black italic text-foreground font-kanit">{Math.round(rankCalculation.progress)}%</span>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="h-2.5 bg-foreground/5 rounded-full overflow-hidden border border-foreground/10 p-[2px]">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                  style={{ 
                    width: `${rankCalculation.progress}%`,
                    background: `linear-gradient(90deg, ${accentColor}, #5dfd9d)`
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-black text-foreground/35 uppercase tracking-wide">
                <span>RANGO ACTUAL</span>
                <span className="text-primary/70">SIGUIENTE: {rankCalculation.nextRank.name}</span>
              </div>
            </div>
          </div>

          {/* MAIN ACTIONS */}
          <div className="grid grid-cols-2 gap-5">
            <Link href={`/create?sport=${selectedSport}`} className="col-span-2">
              <button className="w-full group relative h-16 rounded-[2rem] bg-foreground text-background font-black uppercase tracking-[0.25em] italic transition-all duration-300 hover:shadow-2xl active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-15 transition-opacity" />
                <div className="relative flex items-center justify-center gap-4">
                  <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                  <span className="text-base">ARMAR PARTIDO {selectedSport !== 'football' && selectedSport.toUpperCase()}</span>
                </div>
              </button>
            </Link>
            
            <Link href={`/search?sport=${selectedSport}`} className="col-span-1">
              <button className="w-full h-16 rounded-[1.8rem] border border-foreground/10 bg-surface/40 text-foreground font-black uppercase tracking-[0.2em] italic transition-all duration-300 hover:bg-foreground hover:text-background flex items-center justify-center gap-3 group">
                <Search className="w-5 h-5 text-primary group-hover:text-background transition-colors" />
                <span className="text-[12px]">BUSCAR</span>
              </button>
            </Link>

            <Link href="/highlights" className="col-span-1">
              <button className="w-full h-16 rounded-[1.8rem] border border-foreground/10 bg-surface/40 text-foreground font-black uppercase tracking-[0.2em] italic transition-all duration-300 hover:border-orange-500/40 hover:text-orange-500 flex items-center justify-center gap-3">
                <Flame className="w-5 h-5" />
                <span className="text-[12px]">EN FOCO</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

