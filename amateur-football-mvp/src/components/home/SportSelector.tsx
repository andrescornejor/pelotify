'use client';

import { motion } from 'framer-motion';
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
        'relative flex items-center bg-foreground/[0.03] border border-foreground/[0.08] backdrop-blur-xl p-1.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.1)]',
        isCompact ? 'rounded-[2rem] gap-1' : 'rounded-[2.5rem] gap-2'
      )}
    >
      {/* Background Active Slider */}
      <div className="absolute inset-1.5 grid grid-cols-3 gap-2 pointer-events-none">
        {sports.map((sport) => (
          <div key={sport} className="relative h-full w-full">
            {selectedSport === sport && (
              <motion.div
                layoutId="active-pill"
                className={cn(
                  "absolute inset-0 rounded-[1.6rem] shadow-2xl z-0 border border-white/10 overflow-hidden",
                  sport === 'football' ? "bg-primary" : sport === 'padel' ? "bg-cyan-500" : "bg-orange-500"
                )}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <div className="absolute inset-0 animate-shimmer opacity-30 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {sports.map((sport) => {
        const isSelected = selectedSport === sport;
        const meta = SPORT_META[sport];

        return (
          <button
            key={sport}
            onClick={() => onSelect(sport)}
            className={cn(
              'relative z-10 flex-1 flex items-center justify-center transition-all duration-500 outline-none group overflow-hidden',
              isCompact ? 'h-12 rounded-[1.5rem]' : 'h-14 rounded-[1.8rem]',
              isSelected ? 'text-background' : 'text-foreground/40 hover:text-foreground/70'
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className={cn(
                'leading-none transition-transform duration-500',
                isSelected ? 'text-[1.4rem] scale-110' : 'text-[1.2rem] scale-100 opacity-60 group-hover:opacity-100 group-hover:scale-105'
              )}>
                {meta.icon}
              </span>
              {!isCompact && (
                <span className={cn(
                  'font-black uppercase tracking-[0.15em] font-kanit italic text-[10px] transition-all duration-500',
                  isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                )}>
                  {meta.shortLabel}
                </span>
              )}
            </div>

            {/* Hover Indicator for non-selected */}
            {!isSelected && (
              <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full mx-1 my-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
