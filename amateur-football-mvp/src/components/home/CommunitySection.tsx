'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

export const CommunitySection = ({ totalPlayers, fadeUp }: any) => {
  const { performanceMode } = useSettings();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={1}
      whileHover={performanceMode ? {} : { scale: 1.01 }}
      className={cn(
        'relative overflow-hidden rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 snap-start scroll-mt-26 glass-premium border-primary/10',
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
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 glass shadow-inner border-white/5">
          <Users className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h4 className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none font-kanit">
            Comunidad Activa
          </h4>
          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.25em] mt-1 font-outfit">
            <span className="text-primary text-base font-black mr-1">{totalPlayers}</span>{' '}
            jugadores registrados
          </p>
        </div>
      </div>
      <div className="flex gap-3 relative z-10 shrink-0 w-full sm:w-auto">
        <Link href="/teams" className="flex-1 sm:flex-none">
          <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-foreground/5 glass border-white/10 text-foreground/60 font-outfit active:scale-95">
            CLUBES TOP
          </button>
        </Link>
        <Link href="/search" className="flex-1 sm:flex-none">
          <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.03] text-background bg-gradient-to-br from-primary to-primary-dark shadow-xl shadow-primary/20 font-outfit active:scale-95">
            MAPA VIVO
          </button>
        </Link>
      </div>
    </motion.div>
  );
};
