'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Sport, SPORT_META } from '@/lib/sports';

interface SportSelectorProps {
  selectedSport: Sport;
  onSelect: (sport: Sport) => void;
  variant?: 'default' | 'compact';
}

export function SportSelector({
  selectedSport,
  onSelect,
  variant = 'default',
}: SportSelectorProps) {
  const sports: Sport[] = ['football', 'padel', 'basket'];
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'relative w-full border border-foreground/10 bg-surface/50 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden',
        isCompact ? 'rounded-[1.7rem] p-2' : 'rounded-[2rem] p-2.5'
      )}
    >
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
                  'group relative min-w-0 border transition-all duration-300 outline-none text-left overflow-hidden',
                  isCompact ? 'min-h-[92px] rounded-[1.15rem] px-2.5 py-2' : 'min-h-[82px] rounded-[1.4rem] px-3 py-3',
                  isSelected
                    ? cn('bg-gradient-to-br shadow-[0_18px_40px_rgba(0,0,0,0.12)] scale-[1.01]', accent)
                    : 'bg-foreground/[0.03] border-foreground/10 text-foreground/55 hover:text-foreground hover:bg-foreground/[0.05] hover:border-foreground/20'
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
                    className={cn('leading-none drop-shadow-sm', isCompact ? 'text-[1.3rem]' : 'text-[1.65rem]')}
                  >
                    {meta.icon}
                  </motion.span>
                  <div
                      className={cn(
                        'rounded-full border font-black uppercase tracking-[0.2em]',
                        isCompact ? 'px-1.5 py-1 text-[7px]' : 'px-2 py-1 text-[8px]',
                        isSelected ? 'border-current/20 bg-black/10 text-current' : 'border-foreground/10 text-foreground/30'
                      )}
                  >
                    {isSelected ? 'Activo' : 'Elegir'}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'font-black uppercase tracking-[0.12em] font-kanit italic truncate',
                        isCompact ? 'text-[10px]' : 'text-[11px]'
                      )}
                    >
                      {meta.shortLabel}
                    </span>
                    {isSelected && <Zap className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />}
                  </div>
                  {!isCompact && (
                    <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] opacity-75">
                      <Trophy className="w-3 h-3" />
                      <span className="truncate">{meta.highlightLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
