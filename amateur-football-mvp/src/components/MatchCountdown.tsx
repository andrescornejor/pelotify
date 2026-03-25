'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, Trophy, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchCountdownProps {
  targetDate: string; // "YYYY-MM-DD"
  targetTime: string; // "HH:MM"
  onComplete?: () => void;
  className?: string;
}

export function MatchCountdown({ targetDate, targetTime, onComplete, className }: MatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(`${targetDate}T${targetTime}:00`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        onComplete?.();
        return null;
      }

      return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (!left) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  if (!timeLeft) return null;

  const units = [
    { label: 'DÍAS', value: timeLeft.d },
    { label: 'HORAS', value: timeLeft.h },
    { label: 'MIN', value: timeLeft.m },
    { label: 'SEG', value: timeLeft.s },
  ];

  return (
    <div className={cn("relative p-6 rounded-[2rem] glass-premium border border-primary/20 bg-primary/5 overflow-hidden group", className)}>
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
        <div className="absolute top-0 right-0 p-4">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Timer className="w-5 h-5 text-primary animate-spin-slow" />
             </div>
        </div>

        <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Próximo Despliegue</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
                {units.map((unit, i) => (
                    <div key={unit.label} className="flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={unit.value}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                className="text-3xl font-black italic text-foreground font-kanit tracking-tighter"
                            >
                                {unit.value.toString().padStart(2, '0')}
                            </motion.span>
                        </AnimatePresence>
                        <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mt-1">{unit.label}</span>
                    </div>
                ))}
            </div>

            <div className="pt-2 flex items-center gap-4">
                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-primary shadow-[0_0_10px_rgba(44,252,125,0.6)]"
                    />
                </div>
                <span className="text-[8px] font-black text-primary uppercase animate-pulse">En Linea</span>
            </div>
        </div>

        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] animate-[shimmer_3s_infinite] pointer-events-none" />
    </div>
  );
}
