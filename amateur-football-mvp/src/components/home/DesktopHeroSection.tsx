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
  if (reduceAnimations) {
    return (
      <section className="relative overflow-hidden rounded-[2.5rem] shadow-xl bg-background border border-foreground/5 group/hero">
        <div className="absolute inset-0 z-0 select-none">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              background: `linear-gradient(135deg, ${sportTheme.accent}22 0%, transparent 60%), linear-gradient(225deg, rgba(245,158,11,0.08) 0%, transparent 60%)`,
            }}
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
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[3rem] lg:rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] group/hero border border-foreground/10 bg-background transform-gpu"
    >
      {/* Backdrop — replaced external image with CSS gradient for performance */}
      <div className="absolute inset-0 z-0 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSport}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* CSS-only sport background — no external image */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                background: `radial-gradient(ellipse at 30% 20%, ${sportTheme.accent}66 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245,158,11,0.2) 0%, transparent 50%)`,
              }}
            />

            {/* Subtle mesh gradient */}
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${sportTheme.accent}44 0%, transparent 60%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Court Lines Overlay — Simplified */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:120px_120px]" />
        </div>

        {/* Final depth layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 p-5 sm:p-12 lg:p-16 xl:p-20">
        {/* Left: Text & Branding */}
        <div className="flex-1 space-y-6 lg:space-y-8 max-w-2xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/15">
            <div className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground/30" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 font-kanit">
              {greeting}
            </span>
          </div>

          {/* Title Section */}
          <div className="flex flex-col relative">
            <AnimatePresence mode="wait">
              <motion.h1
                key={selectedSport}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="font-black italic uppercase font-kanit tracking-tighter text-foreground relative z-10"
                style={{ fontSize: 'clamp(3rem, 9vw, 7rem)', lineHeight: '0.8' }}
              >
                {focusSportMeta.homeHeadline.split(' ')[0].toUpperCase()} <br />
                <span className="text-primary italic">
                  {focusSportMeta.homeHeadline.split(' ').slice(1).join(' ').toUpperCase()}
                </span>
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
            className="flex items-stretch gap-0 mt-8 rounded-[2.5rem] w-fit relative group cursor-pointer"
          >
            {/* VIP ID Side Bar */}
            <div className="w-3 rounded-l-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20" style={{ backgroundColor: rankCalculation.info.color }} />

            {/* VIP ID Main Body */}
            <div className="glass-premium border-y border-r border-white/10 rounded-r-[2rem] py-4 px-8 shadow-2xl flex items-center gap-8 relative z-10 overflow-hidden min-w-[380px] transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Avatar Block */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-surface-elevated border-2 border-white/10 shadow-2xl p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {metadata?.avatar_url ? (
                      <img src={metadata.avatar_url} alt="" className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                    ) : (
                      <User2 className="w-10 h-10 text-foreground/20" />
                    )}
                  </div>
                </div>
                <div
                  className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-surface border-2 border-white/10 flex items-center justify-center shadow-2xl"
                  style={{ borderColor: `${rankCalculation.info.color}80` }}
                >
                  <rankCalculation.rank.icon className="w-5 h-5" style={{ color: rankCalculation.info.color }} />
                </div>
              </div>

              {/* Data Block */}
              <div className="flex flex-col py-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-foreground/30 font-kanit">IDENTIDAD PELOTIFY</span>
                  <div className="h-[1px] w-8 bg-foreground/10" />
                  <Shield className="w-3.5 h-3.5 opacity-40 text-primary" />
                </div>
                <h3 className="text-3xl font-black italic uppercase leading-none font-kanit tracking-tighter text-foreground mt-2 group-hover:text-primary transition-colors duration-500">
                  {userName}
                </h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[9px] font-bold text-foreground/40 tracking-widest uppercase">{rankCalculation.info.name}</span>
                  <div className="w-1 h-1 rounded-full bg-foreground/20" />
                  <span className="text-[9px] font-bold text-foreground/40 tracking-widest uppercase">LVL {Math.floor(statsSummary.elo / 100)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats / Rank Summary */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 pt-2 lg:pt-4"
          >
            {[
              { label: `${focusSportMeta.shortLabel} jugados`, value: statsSummary.totalMatches, color: 'text-accent', icon: Calendar },
              { label: 'Victorias', value: statsSummary.wins, color: 'text-primary', icon: Trophy },
            ].map((item, idx) => (
              <div key={idx} className={cn("space-y-1", idx === 2 && "hidden sm:block")}>
                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.25em] flex items-center gap-1.5">
                  <item.icon className="w-2.5 h-2.5" /> {item.label}
                </p>
                <p className={cn('text-2xl font-black italic tracking-tighter uppercase font-kanit', item.color)}>
                  {item.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Modern CTA Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
                <div
                  className="h-full rounded-full relative"
                  style={{
                    width: `${rankCalculation.progress}%`,
                    background: `linear-gradient(90deg, ${rankCalculation.info.color}, #5dfd9d)`,
                    transition: 'width 1s ease-out',
                  }}
                />
              </div>

              <div className="flex justify-between text-[8px] font-medium text-foreground/30 tracking-wide">
                <span>Progreso de temporada</span>
                <span>Siguiente nivel</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Link href={`/create?sport=${selectedSport}`} className="col-span-3">
              <button
                className="w-full h-20 rounded-[2.5rem] bg-foreground text-background text-[12px] font-black uppercase tracking-[0.3em] italic shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_35px_70px_rgba(0,0,0,0.4)]"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle at center, ${sportTheme.accent}44 0%, transparent 70%)` }}
                />
                <PlusCircle className="w-7 h-7 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
                <span className="relative z-10 drop-shadow-md">ARMAR PARTIDO {selectedSport !== 'football' && `DE ${selectedSport.toUpperCase()}`}</span>
                <div className="absolute right-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </button>
            </Link>

            <Link href={`/search?sport=${selectedSport}`} className="col-span-2">
              <button
                className="w-full h-20 rounded-[2.5rem] glass-premium border-white/10 text-foreground text-[11px] font-black uppercase tracking-[0.25em] italic flex items-center justify-center gap-4 relative overflow-hidden group shadow-2xl transition-all duration-500 hover:border-primary/30"
              >
                <Search className="w-6 h-6 relative z-10 text-primary group-hover:scale-110 transition-transform duration-500" />
                <span className="relative z-10 group-hover:text-primary transition-colors">BUSCAR {selectedSport !== 'football' ? selectedSport.toUpperCase() : 'PARTIDO'}</span>
              </button>
            </Link>

            <Link href="/highlights" className="col-span-1">
              <button
                className="w-full h-20 rounded-[2.5rem] glass-premium border-white/10 text-orange-500/50 hover:text-orange-500 flex items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden group"
              >
                <Flame className="w-7 h-7 relative z-10 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-500" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
