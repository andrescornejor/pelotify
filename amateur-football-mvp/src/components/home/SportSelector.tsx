'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type Sport, SPORT_META } from '@/lib/sports';
import { Trophy, Target, Activity } from 'lucide-react';

interface SportSelectorProps {
  selectedSport: Sport;
  onSelect: (sport: Sport) => void;
}

export function SportSelector({ selectedSport, onSelect }: SportSelectorProps) {
  const sports: Sport[] = ['football', 'padel', 'basket'];

  return (
    <div className="relative w-full max-w-full overflow-x-auto no-scrollbar pb-2">
      <div className="flex items-center gap-2 px-1">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          const meta = SPORT_META[sport];
          
          let colorClass = "text-primary";
          let bgClass = "bg-primary/10";
          let borderClass = "border-primary/20";
          let glowClass = "shadow-[0_0_15px_rgba(44,252,125,0.2)]";

          if (sport === 'padel') {
            colorClass = "text-cyan-400";
            bgClass = "bg_cyan-400/10";
            borderClass = "border-cyan-400/20";
            glowClass = "shadow-[0_0_15px_rgba(34,211,238,0.2)]";
          } else if (sport === 'basket') {
            colorClass = "text-orange-400";
            bgClass = "bg-orange-400/10";
            borderClass = "border-orange-400/20";
            glowClass = "shadow-[0_0_15px_rgba(251,146,60,0.2)]";
          }

          return (
            <motion.button
              key={sport}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(sport)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-300 whitespace-nowrap",
                isSelected 
                  ? cn("bg-surface border-transparent", glowClass) 
                  : "bg-surface-elevated/30 border-foreground/[0.03] text-foreground/40 hover:border-foreground/10"
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="sport-pill"
                  className={cn("absolute inset-0 rounded-2xl border-2 pointer-events-none", borderClass)}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <span className={cn(
                "text-base leading-none transition-transform duration-500",
                isSelected ? "scale-110" : "opacity-40 grayscale"
              )}>
                {meta.icon}
              </span>
              
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] italic font-kanit transition-colors duration-300",
                isSelected ? colorClass : "text-foreground/40"
              )}>
                {meta.label}
              </span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn("w-1 h-1 rounded-full", sport === 'football' ? "bg-primary" : sport === 'padel' ? "bg-cyan-400" : "bg-orange-400")}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
