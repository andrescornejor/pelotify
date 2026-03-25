'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sendFriendRequest } from '@/lib/friends';
import { X, Heart, Sparkles, Target, Trophy, Info, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { FifaCard } from '@/components/FifaCard';
import { cn } from '@/lib/utils';
import { getRankByElo } from '@/lib/ranks';

export default function ScoutingPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  // Drag state
  const dragX = useMotionValue(0);
  const dragRotation = useTransform(dragX, [-200, 0, 200], [-15, 0, 15]);
  const dragOpacityLeft = useTransform(dragX, [-150, -50, 0], [1, 0.5, 0]);
  const dragOpacityRight = useTransform(dragX, [0, 50, 150], [0, 0.5, 1]);

  useEffect(() => {
    async function fetchProfiles() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('elo', { ascending: false })
        .limit(20);
      
      if (data) setProfiles(data);
      setLoading(false);
    }
    fetchProfiles();
  }, [user]);

  const handleAction = async (type: 'like' | 'pass') => {
    if (currentIndex >= profiles.length || !user) return;
    
    setDirection(type === 'like' ? 'right' : 'left');
    
    if (type === 'like') {
      try {
        await sendFriendRequest(user.id, currentProfile.id);
        setShowFeedback('¡Interés de Fichaje Enviado!');
        setTimeout(() => setShowFeedback(null), 1500);
      } catch (err) {
        console.error('Error enviando solicitud:', err);
      }
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      dragX.set(0);
    }, 400);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleAction('like');
    } else if (info.offset.x < -threshold) {
      handleAction('pass');
    } else {
      // Snap back
      dragX.set(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
         <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
         <p className="text-primary font-black uppercase tracking-widest animate-pulse">Buscando Talentos...</p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-[100dvh] bg-black overflow-hidden relative selection:bg-primary/30">
      
      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-primary text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_40px_rgba(44,252,125,0.4)] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {showFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/20 blur-[200px] mix-blend-screen pointer-events-none rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[180px] mix-blend-screen pointer-events-none rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-50 px-6 pt-12 pb-6 flex items-center justify-between">
        <Link href="/" className="w-12 h-12 glass transition-all flex items-center justify-center rounded-2xl border border-white/10 hover:border-primary/40 hover:bg-white/5 active:scale-95 group">
          <ArrowLeft className="w-5 h-5 group-hover:text-primary transition-colors" />
        </Link>
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-black italic tracking-[-0.05em] text-white font-kanit drop-shadow-2xl leading-none uppercase">
              MERCADO
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary/70 uppercase tracking-[0.4em] italic">
                  Draft Elite
                </span>
            </div>
        </div>
        <div className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-2xl glass-premium border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all">
            <span className="text-xl font-black text-primary font-kanit italic">{Math.max(0, profiles.length - currentIndex)}</span>
          </div>
          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-white/40">PROSPECTOS</span>
        </div>
      </div>

      {/* Main Discover Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center h-[calc(100dvh-220px)] w-full max-w-xl mx-auto px-6">
        <AnimatePresence mode="popLayout">
          {currentProfile ? (
            <motion.div
              key={currentProfile.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDragEnd={handleDragEnd}
              style={{ x: direction ? undefined : dragX, rotate: direction ? undefined : dragRotation }}
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={direction === 'left' 
                ? { x: -600, opacity: 0, rotate: -35, scale: 0.6 } 
                : direction === 'right' 
                  ? { x: 600, opacity: 0, rotate: 35, scale: 0.6 } 
                  : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }
              }
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full relative cursor-grab active:cursor-grabbing touch-pan-y"
            >
              {/* Profile Card Container with Glow */}
              <div className="relative w-full aspect-[4/5] rounded-[3.5rem] p-4 flex flex-col items-center justify-center glass-premium border border-white/5 shadow-2xl overflow-hidden group">
                
                {/* Background Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                
                {/* Dynamic Surface Highlight */}
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

                <div className="relative z-10 scale-[1.08] group-hover:scale-110 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] mt-[-40px]">
                    <FifaCard 
                      player={{
                        name: currentProfile.name || 'Jugador',
                        position: currentProfile.position || 'MC',
                        overall: currentProfile.elo ? Math.max(10, Math.min(99, Math.floor(currentProfile.elo / 40))) : 50,
                        image: currentProfile.avatar_url,
                        stats: currentProfile.stats || { pac: 70, sho: 70, pas: 70, dri: 70, def: 70, phy: 70 },
                        mvpTrophies: currentProfile.mvp_count || 0,
                        badges: []
                      }}
                    />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center pt-32 z-20">
                    <h2 className="text-3xl sm:text-4xl font-black italic uppercase text-white tracking-[-0.03em] drop-shadow-2xl text-center font-kanit">
                        {currentProfile.name || 'Agente Libre'}
                    </h2>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="px-4 py-1.5 rounded-2xl bg-primary/15 border border-primary/20 backdrop-blur-md flex items-center gap-2 shadow-inner">
                           <Trophy className="w-4 h-4 text-primary" />
                           <span className="text-[12px] font-black text-primary uppercase tracking-[0.1em]">{currentProfile.elo || 0} PTS</span>
                        </div>
                        <div className="px-4 py-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md flex items-center gap-2">
                           <Target className="w-4 h-4 text-white/40" />
                           <span className="text-[12px] font-black text-white/60 uppercase tracking-[0.1em]">{getRankByElo(currentProfile.elo || 0).name}</span>
                        </div>
                    </div>
                </div>

                <motion.div 
                  style={{ opacity: dragOpacityLeft }}
                  className="absolute top-10 right-10 z-30 px-6 py-3 rounded-[2rem] bg-red-600/90 backdrop-blur-xl border border-red-400/20 shadow-2xl pointer-events-none"
                >
                  <span className="text-2xl font-black text-white italic uppercase tracking-widest">DESCARTAR</span>
                </motion.div>
                <motion.div 
                  style={{ opacity: dragOpacityRight }}
                  className="absolute top-10 left-10 z-30 px-6 py-3 rounded-[2rem] bg-primary/90 backdrop-blur-xl border border-emerald-400/20 shadow-2xl pointer-events-none"
                >
                  <span className="text-2xl font-black text-black italic uppercase tracking-widest leading-none">FICHAR</span>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full aspect-[4/5] rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center glass-premium border border-white/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />
              <div className="relative z-10 space-y-8">
                <div className="w-28 h-28 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(44,252,125,0.2)] mx-auto">
                   <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <div>
                    <h3 className="text-4xl font-black italic text-white uppercase tracking-[-0.05em] font-kanit">EL MERCADO ESTÁ CERRADO</h3>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.3em] mt-3">Vuelve mañana para ver el nuevo draft de prospectos.</p>
                </div>
                <Link href="/">
                   <button className="h-16 px-12 bg-primary rounded-[2rem] text-background font-black text-[12px] uppercase tracking-[0.4em] hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/20 italic">
                      Volver a la Central
                   </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Hints Section */}
      {currentProfile && (
        <div className="fixed bottom-12 left-0 right-0 z-50">
          <div className="flex flex-col items-center gap-6 px-10">
            {/* Action Bar (Desktop Optimized) */}
            <div className="flex items-center justify-center gap-8 w-full max-w-sm">
               <button 
                  onClick={() => handleAction('pass')}
                  disabled={!!direction}
                  className="w-16 h-16 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all active:scale-90 group"
               >
                  <X className="w-6 h-6 text-white/30 group-hover:text-red-500" />
               </button>
               
               <Link href={`/profile?id=${currentProfile.id}`}>
                   <button className="w-14 h-14 rounded-full glass border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 opacity-60 hover:opacity-100">
                    <Info className="w-5 h-5 text-white/50" />
                   </button>
               </Link>

               <button
                  onClick={() => handleAction('like')}
                  disabled={!!direction}
                  className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_15px_30px_rgba(44,252,125,0.3)] hover:scale-110 hover:shadow-[0_20px_40px_rgba(44,252,125,0.4)] transition-all active:scale-90"
               >
                  <Heart className="w-6 h-6 text-background fill-background" />
               </button>
            </div>

            {/* Gesture Hints for Mobile */}
            <div className="flex items-center gap-10 opacity-30 select-none">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic font-kanit">Draft</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest italic font-kanit">Scout</span>
                    <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-white" />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
