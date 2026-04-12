'use client';

import { motion } from 'framer-motion';
import { Flame, Clock, Users, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export const MatchOfTheWeekSpotlight = () => {
  const { performanceMode } = useSettings();
  const [countdown, setCountdown] = useState('02:14:30'); // Hardcoded demo for aesthetic

  // Visual countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let [h, m, s] = prev.split(':').map(Number);
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return '00:00:00';
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative w-full rounded-[2.5rem] p-6 sm:p-8 overflow-hidden group shadow-2xl border',
        performanceMode ? 'bg-surface border-foreground/10' : 'glass-premium border-primary/20'
      )}
    >
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1200&auto=format&fit=crop"
          alt="Stadium"
          className="w-full h-full object-cover opacity-[0.15] grayscale mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent mix-blend-screen opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest">
              <Flame className="w-3 h-3 animate-pulse" /> Partido de la Semana
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-foreground/10 text-foreground/60 text-[9px] font-black uppercase tracking-widest">
              <Clock className="w-3 h-3" /> {countdown}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-foreground font-kanit">
              Pibes FC <span className="text-primary mx-2">VS</span> Real Matril
            </h3>
            <p className="text-xs text-foreground/50 font-medium flex items-center gap-2">
               Cancha El Clasico (Sintético) • 8v8 Competitivo
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <button className="flex-1 sm:flex-none px-6 py-4 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-widest italic hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(44,252,125,0.3)] flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Apuesta / Predecir
          </button>
        </div>
      </div>
    </motion.div>
  );
};
