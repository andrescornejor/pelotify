'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Trophy, Target, Award, Activity, Calendar, Shield, MapPin, Clock, ArrowRight, User2, PlusCircle, Search, MessageSquare, Zap, Sparkles, TrendingUp, Star } from 'lucide-react';
import { RankBadge, RANKS, getRankByElo } from './RankBadge';
import Link from 'next/link';

export const PerformanceToggle = () => {
  const { performanceMode, setPerformanceMode } = useSettings();
  
  return (
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
  );
};

export const PerfBackground = () => {
  const { performanceMode } = useSettings();
  if (performanceMode) return null;

  return (
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
  );
};

export const SectionDivider = () => (
  <div className="flex items-center gap-6 py-10 opacity-30 select-none">
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full bg-primary/40" />
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
      <div className="w-1 h-1 rounded-full bg-primary/40" />
    </div>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
  </div>
);

export const ScrollProgress = () => {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? top / height : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="scroll-progress-bar" style={{ transform: `scaleX(${progress})` }} />
  );
};
