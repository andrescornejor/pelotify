'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type Sport, SPORT_META } from '@/lib/sports';

interface SportSelectorProps {
  selectedSport: Sport;
  onSelect: (sport: Sport) => void;
  className?: string;
  variant?: 'app' | 'default';
}

export function SportSelector({ selectedSport, onSelect, className, variant = 'default' }: SportSelectorProps) {
  const sports: Sport[] = ['football', 'padel', 'basket'];

  return (
    <div className={cn(
      "relative flex items-center p-1 bg-white/10 backdrop-blur-3xl rounded-[1.25rem] border border-white/20 shadow-2xl overflow-hidden",
      variant === 'app' && "bg-foreground/[0.04] border-foreground/[0.08] backdrop-blur-xl shadow-none",
      className
    )}>
      {/* Background Track Slider */}
      <div className="absolute inset-1 flex gap-1 pointer-events-none">
        {sports.map((sport) => (
          <div key={sport} className="flex-1 relative">
            {selectedSport === sport && (
              <motion.div
                layoutId="sport-pill-bg"
                className={cn(
                  "absolute inset-0 bg-white shadow-xl rounded-[0.9rem]",
                  variant === 'app' && "bg-background shadow-md border border-foreground/[0.05]"
                )}
                transition={{ type: "spring", stiffness: 440, damping: 32 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex w-full relative z-10 h-full">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          const meta = SPORT_META[sport];
          
          return (
            <button
              key={sport}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(sport);
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1 transition-all duration-300 relative group active:scale-95 touch-manipulation",
                isSelected ? "text-slate-900" : "text-white/40 hover:text-white/70",
                variant === 'app' && (isSelected ? "text-primary" : "text-foreground/30")
              )}
            >
              <span className={cn(
                "text-lg mb-0.5 transition-all duration-500",
                isSelected ? "scale-110 grayscale-0" : "grayscale opacity-60"
              )}>
                {meta.icon}
              </span>
              <span className={cn(
                "text-[7px] font-extrabold uppercase tracking-[0.1em] transition-all duration-300",
                isSelected ? "opacity-100" : "opacity-0 translate-y-1"
              )}>
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
