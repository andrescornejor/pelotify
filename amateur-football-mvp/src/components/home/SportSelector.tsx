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

  return (
    <div className="w-full flex justify-center">
      <div
        className={cn(
          'relative flex items-center p-1.5 bg-surface/30 backdrop-blur-[24px] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden',
          variant === 'compact' ? 'rounded-full' : 'rounded-full max-w-[400px] w-full'
        )}
      >
        {/* Subtle inner highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          const meta = SPORT_META[sport];
          const accent =
            sport === 'padel'
              ? 'from-cyan-400 to-sky-500'
              : sport === 'basket'
                ? 'from-orange-400 to-amber-500'
                : 'from-emerald-400 to-green-500';

          return (
            <button
              key={sport}
              onClick={() => onSelect(sport)}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 outline-none rounded-full transition-colors duration-300 z-10 group min-w-0',
                isSelected ? 'text-white' : 'text-foreground/50 hover:text-foreground/80'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-sport-pill"
                  className={cn("absolute inset-0 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.2)] bg-gradient-to-br", accent)}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span className={cn("relative z-10 text-xl leading-none transition-transform group-hover:scale-110 duration-300", isSelected && "drop-shadow-md")}>
                {meta.icon}
              </span>
              
              {/* Only show text on desktop if not incredibly compact, or always show if default */}
              <span
                className={cn(
                  'relative z-10 font-black uppercase tracking-[0.15em] font-kanit italic text-[11px] truncate',
                  isSelected ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 w-0 md:w-auto hidden md:block'
                )}
              >
                {meta.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
