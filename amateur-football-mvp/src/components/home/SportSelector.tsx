'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Sport, SPORT_META } from '@/lib/sports';

interface SportSelectorProps {
  selectedSport: Sport;
  onSelect: (sport: Sport) => void;
}

export function SportSelector({ selectedSport, onSelect }: SportSelectorProps) {
  const sports: Sport[] = ['football', 'padel', 'basket'];

  return (
    <div className="relative w-full rounded-[2rem] border border-white/10 bg-background/55 p-2.5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.22)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)] pointer-events-none" />
      <div className="relative z-10 grid grid-cols-3 gap-2">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          const meta = SPORT_META[sport];
          const accent =
            sport === 'padel'
              ? 'from-cyan-400/25 to-sky-500/15 text-cyan-300 border-cyan-400/30'
              : sport === 'basket'
                ? 'from-orange-400/25 to-amber-500/15 text-orange-300 border-orange-400/30'
                : 'from-emerald-400/25 to-green-500/15 text-emerald-300 border-emerald-400/30';

          return (
            <button
              key={sport}
              onClick={() => onSelect(sport)}
              className={cn(
                'group relative min-h-[82px] rounded-[1.4rem] border px-3 py-3 transition-all duration-300 outline-none text-left overflow-hidden',
                isSelected
                  ? cn('bg-gradient-to-br shadow-[0_18px_40px_rgba(0,0,0,0.22)] scale-[1.01]', accent)
                  : 'bg-white/[0.03] border-white/8 text-foreground/55 hover:text-foreground hover:bg-white/[0.05] hover:border-white/15'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-sport-surface"
                  className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <motion.span
                    animate={isSelected ? { scale: 1.14, y: -1 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="text-[1.65rem] leading-none drop-shadow-sm"
                  >
                    {meta.icon}
                  </motion.span>
                  <div
                    className={cn(
                      'rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em]',
                      isSelected ? 'border-current/20 bg-black/10 text-current' : 'border-white/10 text-foreground/30'
                    )}
                  >
                    {isSelected ? 'Activo' : 'Elegir'}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-[0.14em] font-kanit italic">
                      {meta.label}
                    </span>
                    {isSelected && <Zap className="w-3.5 h-3.5" />}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] opacity-75">
                    <Trophy className="w-3 h-3" />
                    <span>{meta.highlightLabel}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
