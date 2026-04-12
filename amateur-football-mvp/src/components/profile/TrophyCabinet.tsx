'use client';

import { motion } from 'framer-motion';
import { Award, Shield, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

const MOCK_BADGES = [
  { id: 'hattrick', name: 'Hattrick Hero', desc: 'Anotaste 3 goles en un partido', icon: Zap, color: '#f59e0b', earned: true, date: '12 Abr 2026' },
  { id: 'mvp5', name: 'MVP x5', desc: 'Elegido MVP 5 veces', icon: Star, color: '#ec4899', earned: true, date: '10 Feb 2026' },
  { id: 'wall', name: 'The Wall', desc: 'Arco en cero como Portero/Defensa', icon: Shield, color: '#3b82f6', earned: false },
  { id: 'loyalty', name: 'Lealtad', desc: 'Jugaste 50 partidos con el mismo club', icon: Award, color: '#10b981', earned: false },
];

export const TrophyCabinet = () => {
  const { performanceMode } = useSettings();

  return (
    <div className="w-full space-y-4 pt-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black uppercase tracking-tighter italic text-foreground font-kanit drop-shadow-md">
          Vitrina de Trofeos
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          2 / 12 Desbloqueados
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MOCK_BADGES.map((badge, idx) => {
          const isEarned = badge.earned;
          const Icon = badge.icon;
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={performanceMode || !isEarned ? {} : { y: -5, scale: 1.05 }}
              className={cn(
                "relative group p-4 rounded-3xl border flex flex-col items-center gap-3 text-center transition-all duration-500 overflow-hidden",
                isEarned 
                  ? "glass-premium border-primary/20 shadow-xl" 
                  : "bg-surface/50 border-foreground/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
              )}
            >
              {/* Glow background for earned badges */}
              {isEarned && !performanceMode && (
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40"
                  style={{ background: `radial-gradient(circle at center, ${badge.color} 0%, transparent 70%)` }}
                />
              )}

              <div 
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 transition-transform duration-500",
                  isEarned ? "shadow-inner border" : "bg-foreground/5",
                  isEarned && "group-hover:rotate-12"
                )}
                style={isEarned ? { backgroundColor: `${badge.color}15`, borderColor: `${badge.color}30` } : {}}
              >
                <Icon 
                  className="w-7 h-7" 
                  style={{ color: isEarned ? badge.color : 'rgba(255,255,255,0.3)' }} 
                />
              </div>

              <div className="relative z-10">
                <p className={cn("text-[11px] font-black uppercase tracking-widest mb-1", isEarned ? "text-foreground" : "text-foreground/50")}>
                  {badge.name}
                </p>
                <p className="text-[9px] text-foreground/40 leading-snug">
                  {badge.desc}
                </p>
                {isEarned && (
                  <p className="text-[7px] font-bold text-primary mt-2 uppercase tracking-widest">
                    {badge.date}
                  </p>
                )}
              </div>

              {/* Shimmer effect inside earned badges */}
              {isEarned && !performanceMode && (
                <motion.div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                  style={{ background: `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.2) 30%, transparent 40%)`, backgroundSize: '200% 200%' }}
                  animate={{ backgroundPosition: ['200% 0', '-100% 0'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
