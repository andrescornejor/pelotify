'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Target, Award, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankBadge, RANKS } from './RankBadge';
import { useRankProgressBar } from '@/hooks/useRankProgressBar';
import Link from 'next/link';

export const RoadToGlory = ({ statsSummary, metadata, fadeUp }: any) => {
  const rankCalculation = useRankProgressBar(statsSummary.elo);

  return (
    <>
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
              Tu camino hacia la leyenda
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

              {RANKS.map((rankItem) => {
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
                        <div className="px-2 py-1 rounded bg-primary text-background text-[7px] font-black uppercase tracking-widest whitespace-nowrap relative shadow-xl shadow-primary/20">
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
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <RankBadge rankName={rankCalculation.info.name} size="md" />
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none font-kanit">
              Dominio de la Liga {rankCalculation.info.name}
            </h4>
            <p className="text-[12px] text-foreground/60 font-medium tracking-wide max-w-sm">
              Estás en el top{' '}
              <span className="text-primary font-black">{Math.max(1, 100 - statsSummary.winRate)}%</span> de
              jugadores en tu categoría. Seguí ganando para desbloquear{' '}
              <span style={{ color: rankCalculation.nextRank.color }} className="font-black">
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
            className="h-14 px-10 rounded-2xl flex items-center justify-center gap-4 transition-all text-white shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary to-primary-dark group overflow-hidden relative active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic relative z-10">
              VER RANKING GLOBAL
            </span>
            <Trophy className="w-5 h-5 text-white/90 relative z-10 group-hover:rotate-12 transition-transform" />
          </motion.button>
        </Link>
      </motion.div>
    </>
  );
};
