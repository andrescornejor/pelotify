'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, X } from 'lucide-react';
import { MatchParticipant } from '@/lib/matches';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

interface MatchIntroBroadcastProps {
  isOpen: boolean;
  onClose: () => void;
  teamA: MatchParticipant[];
  teamB: MatchParticipant[];
  teamAName: string;
  teamBName: string;
  venueName: string;
}

type IntroPhase = 'init' | 'vs' | 'teamA' | 'teamB' | 'end';

export function MatchIntroBroadcast({
  isOpen,
  onClose,
  teamA,
  teamB,
  teamAName,
  teamBName,
  venueName
}: MatchIntroBroadcastProps) {
  const [phase, setPhase] = useState<IntroPhase>('init');
  const { performanceMode } = useSettings();

  useEffect(() => {
    if (!isOpen) {
      setPhase('init');
      return;
    }

    if (performanceMode) {
      // Skip animation if performance mode is enabled
      onClose();
      return;
    }

    // Sequence timing
    let p1, p2, p3, p4;
    p1 = setTimeout(() => setPhase('vs'), 2500);
    p2 = setTimeout(() => setPhase('teamA'), 5500);
    p3 = setTimeout(() => setPhase('teamB'), 9500);
    p4 = setTimeout(() => {
      setPhase('end');
      onClose();
    }, 13500);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(p4);
    };
  }, [isOpen, onClose, performanceMode]);

  if (!isOpen || performanceMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1 } }}
        className="fixed inset-0 z-[100] bg-black text-white overflow-hidden font-kanit select-none flex items-center justify-center pointer-events-auto"
      >
        {/* Skip button wrapper z-[150] */}
        <div className="absolute top-6 right-6 z-[150]">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-black uppercase flex items-center gap-2 backdrop-blur-md transition-colors"
          >
            Skip <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient TV Static / Lines */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/tv-noise.png')] mix-blend-overlay" />
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-30" />

        <AnimatePresence mode="wait">
          {/* PHASE 1: INIT STADIUM */}
          {phase === 'init' && (
            <motion.div
              key="init"
              initial={{ scale: 1.2, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8 } }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center"
            >
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="px-6 py-2 border-2 border-primary bg-primary/20 backdrop-blur-md rounded-full mb-6"
                >
                  <span className="text-primary font-black uppercase tracking-[0.5em] text-sm">Transmisión Oficial</span>
                </motion.div>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="text-6xl md:text-8xl font-black italic uppercase text-center text-white drop-shadow-[0_0_30px_rgba(44,252,125,0.4)]"
                >
                  {venueName}
                </motion.h1>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: VS SCREEN */}
          {phase === 'vs' && (
             <motion.div
              key="vs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              className="absolute inset-0 flex items-center justify-center"
             >
               {/* Left Half (Team A) */}
               <motion.div 
                 initial={{ x: '-100%', skewX: -10 }}
                 animate={{ x: 0, skewX: 0 }}
                 transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                 className="absolute inset-y-0 left-0 w-1/2 bg-indigo-950 border-r-4 border-indigo-500 overflow-hidden flex items-center justify-center"
               >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.3)_0%,transparent_60%)]"
                  />
                  <h2 className="relative z-10 text-5xl md:text-7xl lg:text-9xl font-black uppercase italic text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-300 drop-shadow-[0_0_20px_rgba(79,70,229,0.8)] pr-12">
                    {teamAName}
                  </h2>
               </motion.div>
               
               {/* Right Half (Team B) */}
               <motion.div 
                 initial={{ x: '100%', skewX: 10 }}
                 animate={{ x: 0, skewX: 0 }}
                 transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                 className="absolute inset-y-0 right-0 w-1/2 bg-rose-950 border-l-4 border-rose-500 overflow-hidden flex items-center justify-center"
               >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.3)_0%,transparent_60%)]"
                  />
                  <h2 className="relative z-10 text-5xl md:text-7xl lg:text-9xl font-black uppercase italic text-transparent bg-clip-text bg-gradient-to-br from-white to-rose-300 drop-shadow-[0_0_20px_rgba(225,29,72,0.8)] pl-12">
                     {teamBName}
                  </h2>
               </motion.div>

               {/* Center VS */}
               <motion.div
                 initial={{ scale: 0, rotate: -180 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.5 }}
                 className="relative z-20 w-32 h-32 md:w-48 md:h-48 rounded-full bg-black border-4 border-primary shadow-[0_0_50px_rgba(44,252,125,0.6)] flex items-center justify-center"
               >
                 <Zap className="absolute inset-0 w-full h-full text-primary/30 p-4" />
                 <span className="text-5xl md:text-7xl font-black italic text-primary">VS</span>
               </motion.div>
             </motion.div>
          )}

          {/* PHASE 3: TEAM A LINEUP */}
          {phase === 'teamA' && (
            <motion.div
              key="teamA"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0, transition: { duration: 0.5 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="absolute inset-0 bg-indigo-950 flex flex-col pt-20 px-10"
            >
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
               <div className="relative z-10 max-w-7xl mx-auto w-full">
                  <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-between items-end border-b-4 border-indigo-500 pb-4 mb-10"
                  >
                     <h2 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter">
                       ALINEACIÓN
                     </h2>
                     <span className="text-3xl md:text-5xl font-black uppercase text-indigo-400">
                       {teamAName}
                     </span>
                  </motion.div>
                  
                  <div className="flex flex-col gap-4">
                     {teamA.map((player, idx) => (
                       <motion.div
                          key={player.user_id}
                          initial={{ x: -100, opacity: 0, skewX: -20 }}
                          animate={{ x: 0, opacity: 1, skewX: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.15), type: 'spring' }}
                          className="flex items-center gap-6 bg-gradient-to-r from-indigo-600/40 to-transparent p-4 border-l-8 border-indigo-400"
                       >
                         <div className="w-16 h-16 rounded-full bg-indigo-900 border-2 border-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                            <Shield className="w-8 h-8 text-indigo-300" />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-3xl font-black uppercase text-white shadow-xl">{player.profiles?.name || `Jugador ${idx + 1}`}</span>
                         </div>
                       </motion.div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {/* PHASE 4: TEAM B LINEUP */}
          {phase === 'teamB' && (
            <motion.div
              key="teamB"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)', transition: { duration: 1 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="absolute inset-0 bg-rose-950 flex flex-col pt-20 px-10"
            >
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
               <div className="relative z-10 max-w-7xl mx-auto w-full">
                  <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-between items-end border-b-4 border-rose-500 pb-4 mb-10 flex-row-reverse"
                  >
                     <h2 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter">
                       ALINEACIÓN
                     </h2>
                     <span className="text-3xl md:text-5xl font-black uppercase text-rose-400">
                       {teamBName}
                     </span>
                  </motion.div>
                  
                  <div className="flex flex-col items-end gap-4">
                     {teamB.map((player, idx) => (
                       <motion.div
                          key={player.user_id}
                          initial={{ x: 100, opacity: 0, skewX: 20 }}
                          animate={{ x: 0, opacity: 1, skewX: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.15), type: 'spring' }}
                          className="flex items-center gap-6 bg-gradient-to-l from-rose-600/40 to-transparent p-4 border-r-8 border-rose-400 flex-row-reverse w-full justify-start"
                       >
                         <div className="w-16 h-16 rounded-full bg-rose-900 border-2 border-rose-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.5)]">
                            <Shield className="w-8 h-8 text-rose-300" />
                         </div>
                         <div className="flex flex-col items-end">
                           <span className="text-3xl font-black uppercase text-white shadow-xl">{player.profiles?.name || `Jugador ${idx + 1}`}</span>
                         </div>
                       </motion.div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
