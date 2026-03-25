'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star, Award, Shield, Zap, Crown, Activity, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface Rank {
  name: string;
  minElo: number;
  color: string;
  icon: any;
}

const RANKS: Rank[] = [
  { name: 'HIERRO', minElo: 0, color: '#94a3b8', icon: Shield },
  { name: 'BRONCE', minElo: 500, color: '#d97706', icon: Activity },
  { name: 'PLATA', minElo: 1000, color: '#94a3b8', icon: Target },
  { name: 'ORO', minElo: 1500, color: '#fbbf24', icon: Trophy },
  { name: 'PLATINO', minElo: 2000, color: '#2dd4bf', icon: Award },
  { name: 'DIAMANTE', minElo: 2500, color: '#3b82f6', icon: Sparkles },
  { name: 'ELITE', minElo: 3000, color: '#8b5cf6', icon: Star },
  { name: 'MAESTRO', minElo: 3500, color: '#f43f5e', icon: Crown },
  { name: 'PELOTIFY', minElo: 4000, color: '#2cfc7d', icon: Zap },
];

interface RankUpCelebrationProps {
  newRankName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RankUpCelebration({ newRankName, isOpen, onClose }: RankUpCelebrationProps) {
  const rank = RANKS.find(r => r.name === newRankName) || RANKS[0];
  const Icon = rank.icon;

  useEffect(() => {
    if (isOpen) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: [rank.color, '#ffffff', '#2cfc7d']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: [rank.color, '#ffffff', '#2cfc7d']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, rank.color]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
        >
          {/* Ambient Glow */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle at center, ${rank.color} 0%, transparent 70%)` 
            }}
          />

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.1, y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg text-center space-y-8"
          >
            {/* Rank Evolution Visual */}
            <div className="relative flex justify-center py-10">
               {/* Background light rays */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                 className="absolute inset-0 flex items-center justify-center opacity-30"
               >
                 <div className="w-[400px] h-[400px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-3xl rotate-45" />
                 <div className="w-[400px] h-[400px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-3xl -rotate-45" />
               </motion.div>

               {/* Main Badge */}
               <div className="relative group">
                  <motion.div 
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                    className="w-48 h-48 rounded-[3.5rem] bg-zinc-900 border-4 flex items-center justify-center shadow-[0_0_80px_rgba(44,252,125,0.4)] relative z-10"
                    style={{ borderColor: rank.color }}
                  >
                    <Icon className="w-24 h-24" style={{ color: rank.color }} />
                  </motion.div>

                  {/* Ring 1 */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-[-10px] border border-dashed border-white/20 rounded-full"
                  />
                  {/* Ring 2 */}
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-[-30px] border border-dotted border-white/10 rounded-full"
                  />

                  {/* Floating Particles */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [0, -100], 
                        x: [0, (i % 2 === 0 ? 50 : -50)],
                        opacity: [0, 1, 0] 
                      }}
                      transition={{ 
                        duration: 2 + Math.random() * 2, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                      className="absolute left-1/2 top-1/2 bg-white/20 w-1 h-1 rounded-full"
                    />
                  ))}
               </div>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-2">
                  ¡Logro Legendario Desbloqueado!
                </h4>
                <h2 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter font-kanit drop-shadow-2xl">
                  {rank.name}
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-foreground/60 text-sm font-medium uppercase tracking-widest max-w-[280px] mx-auto"
              >
                Has demostrado dominio absoluto en la cancha. Sigue así para llegar a PELOTIFY.
              </motion.p>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onClose}
              className="px-12 h-16 bg-white text-black font-black uppercase text-[12px] tracking-[0.4em] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              <span className="relative z-10">CONTINUAR DOMINANDO</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
