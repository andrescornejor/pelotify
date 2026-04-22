'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type Sport, SPORT_META } from '@/lib/sports';

interface SportSelectorProps {
  selectedSport: Sport;
  onSelect: (sport: Sport) => void;
}

export function SportSelector({ selectedSport, onSelect }: SportSelectorProps) {
  const sports: Sport[] = ['football', 'padel', 'basket'];

  return (
    <div className="relative w-full max-w-md mx-auto h-12 flex items-center p-1 bg-foreground/[0.03] backdrop-blur-md rounded-2xl border border-foreground/[0.05]">
      {/* Background Track / Shared Layout */}
      <div className="absolute inset-1 flex gap-1 pointer-events-none">
        {sports.map((sport) => (
          <div key={sport} className="flex-1 relative">
            {selectedSport === sport && (
              <motion.div
                layoutId="sport-selector-active"
                className="absolute inset-0 bg-surface shadow-sm rounded-xl border border-foreground/[0.05]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex w-full relative z-10 h-full">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          const meta = SPORT_META[sport];
          
          let accentColor = "text-primary";
          let glowColor = "rgba(44,252,125,0.15)";
          if (sport === 'padel') {
            accentColor = "text-cyan-500";
            glowColor = "rgba(34,211,238,0.15)";
          }
          if (sport === 'basket') {
            accentColor = "text-orange-500";
            glowColor = "rgba(249,115,22,0.15)";
          }

          return (
            <button
              key={sport}
              onClick={() => onSelect(sport)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 transition-all duration-300 outline-none relative z-10",
                isSelected ? accentColor : "text-foreground/30 hover:text-foreground/50"
              )}
            >
              <span className={cn(
                "text-base transition-transform duration-500",
                isSelected ? "scale-110" : "grayscale opacity-50"
              )}>
                {meta.icon}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest italic font-kanit">
                {meta.label}
              </span>
              
              {isSelected && (
                <motion.div
                  layoutId="sport-glow"
                  className="absolute inset-0 -z-10 blur-xl opacity-50"
                  style={{ backgroundColor: glowColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
