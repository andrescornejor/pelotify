'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Zap, Crown, Sparkles, Shield, Activity, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

export interface Rank {
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

interface RankUpAnimationProps {
  newRankName: string;
  onClose: () => void;
}

export function RankUpAnimation({ newRankName, onClose }: RankUpAnimationProps) {
  const rank = RANKS.find(r => r.name === newRankName) || RANKS[0];
  const Icon = rank.icon;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti after a short delay
    const timer = setTimeout(() => {
      setShowContent(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [rank.color, '#ffffff', '#2cfc7d'],
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [rank.color]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-hidden">
      {/* Dynamic Background Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.4, scale: 1.5 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none"
        style={{ backgroundColor: rank.color }}
      />

      <div className="relative z-10 text-center px-6">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Cinematic Rank Reveal */}
              <div className="relative group">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.2 
                  }}
                  className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto flex items-center justify-center"
                >
                  {/* Rotating Rings */}
                  <div 
                    className="absolute inset-0 rounded-[3rem] border-4 border-white/5 animate-spin-slow" 
                    style={{ borderTopColor: rank.color }}
                  />
                  <div 
                    className="absolute inset-4 rounded-[2.5rem] border-2 border-white/5 animate-spin-slow-reverse" 
                    style={{ borderBottomColor: rank.color, animationDuration: '4s' }}
                  />
                  
                  {/* Central Icon */}
                  <div 
                    className="w-32 h-32 sm:w-44 sm:h-44 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-700"
                  >
                     <div 
                        className="absolute inset-0 blur-2xl opacity-40 animate-pulse" 
                        style={{ backgroundColor: rank.color }}
                     />
                     <Icon 
                        className="w-16 h-16 sm:w-24 sm:h-24 sm:w-24 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" 
                        style={{ color: rank.color }} 
                     />
                  </div>
                </motion.div>

                {/* Floating Sparlkes */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ 
                                y: [-20, 20], 
                                x: [-20, 20],
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0]
                            }}
                            transition={{ 
                                duration: 2 + Math.random(), 
                                repeat: Infinity, 
                                delay: Math.random() * 2 
                            }}
                            className="absolute"
                            style={{ 
                                top: `${Math.random() * 100}%`, 
                                left: `${Math.random() * 100}%`,
                                color: rank.color 
                            }}
                        >
                            <Sparkles className="w-4 h-4" />
                        </motion.div>
                    ))}
                </div>
              </div>

              {/* Text Animation */}
              <div className="space-y-4">
                <motion.p
                  initial={{ letterSpacing: "1em", opacity: 0 }}
                  animate={{ letterSpacing: "0.4em", opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-[10px] sm:text-xs font-black uppercase text-white/40 tracking-[0.4em]"
                >
                  NUEVO RANGO DESBLOQUEADO
                </motion.p>
                <motion.h2
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.7 }}
                  className="text-6xl sm:text-8xl font-black italic uppercase italic text-white tracking-tighter font-kanit drop-shadow-[0_0_30px_rgba(44,252,125,0.3)]"
                >
                  {rank.name}
                </motion.h2>
              </div>

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={onClose}
                className="px-12 h-16 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
              >
                CONTINUAR LEYENDA
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
