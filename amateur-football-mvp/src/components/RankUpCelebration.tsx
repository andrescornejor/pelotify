'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star, Zap, Award, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface RankUpCelebrationProps {
  oldRank: string;
  newRank: string;
  newRankColor: string;
  newRankIcon: any;
  isOpen: boolean;
  onClose: () => void;
}

export function RankUpCelebration({
  oldRank,
  newRank,
  newRankColor,
  newRankIcon: Icon,
  isOpen,
  onClose
}: RankUpCelebrationProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 500);
      
      // Blast confetti
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-2xl"
        >
          {/* Ambient Glow */}
          <div 
            className="absolute inset-0 opacity-20 blur-[150px] animate-pulse"
            style={{ background: `radial-gradient(circle at center, ${newRankColor}, transparent 70%)` }}
          />

          <motion.div 
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative z-10 w-full max-w-2xl px-6 text-center space-y-12"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20"
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Nivel Leyenda Alcanzado</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white font-kanit leading-[0.8]"
              >
                NUEVO <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-primary-dark animate-gradient">RANGO</span>
              </motion.h1>
            </div>

            {/* Icon Explosion */}
            <div className="relative flex justify-center py-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.8 }}
                className="relative z-20 w-48 h-48 md:w-64 md:h-64 rounded-[4rem] bg-gradient-to-br from-white/10 to-transparent border-4 border-white/20 flex items-center justify-center shadow-[0_0_100px_rgba(44,252,125,0.4)] backdrop-blur-xl group"
              >
                 <Icon className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" style={{ color: newRankColor }} />
                 
                 {/* Decorative Rings */}
                 <div className="absolute inset-[-20px] border-2 border-white/5 rounded-[5rem] animate-spin-slow opacity-30" />
                 <div className="absolute inset-[-40px] border border-white/5 rounded-[6rem] animate-spin-slow-reverse opacity-10" />
              </motion.div>

              {/* Particle Burst */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: [0, 1.5, 0], x: (i % 2 === 0 ? 1 : -1) * 200, y: (i < 3 ? 1 : -1) * 200 }}
                  transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-primary/40 blur-sm"
                />
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] mb-4">De {oldRank} a</p>
                <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white font-kanit leading-none" style={{ color: newRankColor }}>
                  {newRank}
                </h2>
              </div>

              <div className="pt-10">
                <button
                  onClick={onClose}
                  className="px-12 h-16 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.2)] italic"
                >
                  Continuar Gloria
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Background Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
             <h4 className="text-[30vw] font-black italic font-kanit leading-none whitespace-nowrap">ASCENSO</h4>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
