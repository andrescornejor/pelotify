'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Star, TrendingUp, User2, PlusCircle, Play, Search, Zap } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useRankProgressBar } from '@/hooks/useRankProgressBar';
import { RankBadge } from './RankBadge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Highlight } from '@/lib/highlights';

export const HeroSection = ({ 
  user,
  userName,
  metadata,
  greeting,
  statsSummary,
  highlights
}: any) => {
  const { performanceMode } = useSettings();
  const rankCalculation = useRankProgressBar(statsSummary.elo);

  return (
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
                      Progreso de Liga
                    </p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black italic text-foreground leading-none font-kanit uppercase tracking-tighter">
                        {rankCalculation.info.name}
                      </h3>
                      <rankCalculation.rank.icon className="w-5 h-5" style={{ color: rankCalculation.rank.hex }} />
                    </div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                      Estado de Temporada
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
                      Para {rankCalculation.nextRank.name}
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
                    <span>Progreso de Temporada</span>
                    <span>Siguiente Nivel</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Link href="/create" className="col-span-3">
                  <motion.button
                    whileHover={{ scale: 1.015, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-primary to-primary-dark text-background font-black uppercase text-[12px] tracking-[0.4em] shadow-[0_20px_40px_rgba(44,252,125,0.25)] flex items-center justify-center gap-3 relative overflow-hidden group border border-white/20 active:scale-95 transition-all"
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
                    className="w-full h-16 rounded-[2rem] bg-zinc-900 border border-white/10 text-white font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl transition-all duration-500 active:scale-95"
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
                    className="w-full h-16 rounded-[2rem] glass-premium border-white/10 text-foreground/40 hover:text-primary font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center transition-all duration-500 shadow-xl active:scale-95"
                  >
                    <Search className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>
  );
};
