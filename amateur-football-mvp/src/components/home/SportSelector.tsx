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
    <div className="relative w-fit mx-auto p-1 bg-surface-elevated/40 backdrop-blur-xl rounded-[1.5rem] border border-foreground/[0.03] shadow-inner flex items-center gap-1">
      {sports.map((sport) => {
        const isSelected = selectedSport === sport;
        const meta = SPORT_META[sport];
        
        let activeColor = "bg-primary";
        let activeText = "text-black";
        let glowColor = "shadow-[0_8px_15px_rgba(44,252,125,0.3)]";

        if (sport === 'padel') {
          activeColor = "bg-cyan-400";
          activeText = "text-black";
          glowColor = "shadow-[0_8px_15px_rgba(34,211,238,0.3)]";
        } else if (sport === 'basket') {
          activeColor = "bg-orange-500";
          activeText = "text-white";
          glowColor = "shadow-[0_8px_15px_rgba(249,115,22,0.3)]";
        }

        return (
          <button
            key={sport}
            onClick={() => onSelect(sport)}
            className={cn(
              "relative px-4 py-2.5 rounded-xl transition-all duration-500 flex items-center gap-2 group outline-none",
              isSelected ? activeText : "text-foreground/40 hover:text-foreground/60"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="active-selector-pill"
                className={cn("absolute inset-0 rounded-xl z-0", activeColor, glowColor)}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            
            <span className={cn(
              "text-lg relative z-10 transition-transform duration-500",
              isSelected ? "scale-110" : "opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100"
            )}>
              {meta.icon}
            </span>
            
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.15em] italic font-kanit relative z-10 transition-colors duration-300",
              isSelected ? "" : "group-hover:text-foreground/70"
            )}>
              {meta.label}
            </span>

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/40"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
