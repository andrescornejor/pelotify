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
    <div className="relative w-fit flex items-center p-1 bg-foreground/[0.03] backdrop-blur-3xl rounded-[1.25rem] border border-foreground/[0.08] shadow-2xl overflow-hidden">
      {/* Moving Background Pill */}
      <motion.div
        layoutId="active-sport-pill"
        className="absolute h-[calc(100%-8px)] rounded-xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-0"
        initial={false}
        animate={{
          width: 'calc(33.33% - 4px)',
          x: sports.indexOf(selectedSport) * 100 + '%'
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
           left: '4px',
           width: 'calc(33.33% - 4px)',
           transform: `translateX(${sports.indexOf(selectedSport) * (100 / sports.length)}%)`
        } as any}
      />

      <div className="flex relative z-10 w-full min-w-[280px]">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          const meta = SPORT_META[sport];
          
          let activeColor = "text-emerald-600";
          if (sport === 'padel') activeColor = "text-cyan-600";
          if (sport === 'basket') activeColor = "text-orange-600";

          return (
            <button
              key={sport}
              onClick={() => onSelect(sport)}
              className={cn(
                "flex-1 px-4 py-2.5 flex items-center justify-center gap-2.5 transition-all duration-300 outline-none",
                isSelected ? activeColor : "text-foreground/40 hover:text-foreground/60"
              )}
            >
              <motion.span 
                animate={isSelected ? { scale: 1.2, rotate: [0, -10, 10, 0] } : { scale: 1, rotate: 0 }}
                className="text-lg leading-none"
              >
                {meta.icon}
              </motion.span>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] font-kanit italic">
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
