'use client';

import { memo } from 'react';
import { Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Sport, SPORT_META } from '@/lib/sports';

interface SportSelectorProps {
  selectedSport: Sport;
  onSelect: (sport: Sport) => void;
  variant?: 'default' | 'compact';
}

export const SportSelector = memo(function SportSelector({
  selectedSport,
  onSelect,
  variant = 'default',
}: SportSelectorProps) {
  const sports: Sport[] = ['football', 'padel', 'basket'];
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'relative w-full border border-foreground/10 bg-surface/40 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300',
        isCompact ? 'rounded-[1.5rem] p-1.5' : 'rounded-[2rem] p-2'
      )}
    >
      <div className="relative z-10 grid grid-cols-3 gap-1.5">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          const meta = SPORT_META[sport];
          
          const sportStyles = {
            padel: isSelected ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'hover:bg-cyan-500/5',
            basket: isSelected ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'hover:bg-orange-500/5',
            football: isSelected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'hover:bg-emerald-500/5',
          };

          return (
            <button
              key={sport}
              onClick={() => onSelect(sport)}
              className={cn(
                'group relative flex items-center justify-center transition-all duration-200 outline-none overflow-hidden border border-transparent',
                isCompact ? 'h-16 rounded-[1.2rem]' : 'h-20 rounded-[1.5rem]',
                isSelected 
                  ? cn('shadow-sm', sportStyles[sport])
                  : 'bg-foreground/[0.02] text-foreground/40 hover:text-foreground/70 hover:border-foreground/10'
              )}
            >
              <div className={cn(
                "flex flex-col items-center justify-center gap-1 transition-transform duration-300",
                isSelected && "scale-110"
              )}>
                <span className={cn(
                  "leading-none transition-all duration-300",
                  isCompact ? "text-[1.8rem]" : "text-[2.2rem]",
                  isSelected ? "drop-shadow-[0_0_10px_currentColor]" : "opacity-60"
                )}>
                  {meta.icon}
                </span>
                
                {!isCompact && (
                  <span className="text-[9px] font-black uppercase tracking-widest font-kanit">
                    {meta.shortLabel}
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});


