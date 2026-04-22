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
    <div className="relative w-fit flex items-center p-1 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
      {/* Background Track */}
      <div className="absolute inset-1 flex gap-1 pointer-events-none">
        {sports.map((sport) => (
          <div key={sport} className="flex-1 relative">
            {selectedSport === sport && (
              <motion.div
                layoutId="sport-selector-active"
                className="absolute inset-0 bg-white shadow-xl rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Actual Buttons */}
      <div className="flex relative z-10 h-full">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          const meta = SPORT_META[sport];
          
          let accentText = "text-black";
          let inactiveText = "text-white/40 hover:text-white/70";

          return (
            <button
              key={sport}
              onClick={() => onSelect(sport)}
              className={cn(
                "px-4 py-2 flex items-center justify-center gap-2 transition-all duration-300 outline-none relative z-10 whitespace-nowrap",
                isSelected ? accentText : inactiveText
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
