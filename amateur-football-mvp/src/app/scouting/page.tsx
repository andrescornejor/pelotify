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
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] mix-blend-screen pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] mix-blend-screen pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      </div>

      {/* Header */}
      <div className="relative z-50 px-6 pt-10 pb-4 flex items-center justify-between">
        <Link href="/" className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center press-effect">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-black italic tracking-tighter text-white font-kanit drop-shadow-lg leading-none">
              MERCADO
            </h1>
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mt-1">
              Agente Libre
            </span>
        </div>
        {/* Profile counter */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
            <span className="text-sm font-black text-white/80 italic">{Math.max(0, profiles.length - currentIndex)}</span>
          </div>
          <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">restantes</span>
        </div>
      </div>

      {/* Main Tinder-like Card Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center h-[calc(100dvh-200px)] w-full max-w-md mx-auto px-6">
        <AnimatePresence mode="popLayout">
          {currentProfile ? (
            <motion.div
              key={currentProfile.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDragEnd={handleDragEnd}
              style={{ x: direction ? undefined : dragX, rotate: direction ? undefined : dragRotation }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={direction === 'left' 
                ? { x: -400, opacity: 0, rotate: -25, scale: 0.7 } 
                : direction === 'right' 
                  ? { x: 400, opacity: 0, rotate: 25, scale: 0.7 } 
                  : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full relative cursor-grab active:cursor-grabbing touch-pan-y"
            >
              {/* Profile Card Container */}
              <div className="relative w-full aspect-[3/4] rounded-[2.5rem] p-6 flex flex-col items-center justify-center glass-premium border border-white/10 shadow-2xl overflow-hidden group">
                
                {/* Glow behind the Fifa Card */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* The Model / Player */}
                <div className="relative z-10 scale-[1.05] group-hover:scale-110 transition-transform duration-700 ease-out origin-bottom mt-[-20px]">
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

                {/* Dynamic Swipe Labels – appear during drag */}
                <motion.div 
                  style={{ opacity: dragOpacityLeft }}
                  className="absolute top-8 right-8 z-30 px-5 py-2.5 rounded-2xl bg-red-500/90 backdrop-blur-md border border-red-300/30 shadow-2xl pointer-events-none"
                >
                  <span className="text-xl font-black text-white italic uppercase tracking-wider drop-shadow-md">NOPE</span>
                </motion.div>
                <motion.div 
                  style={{ opacity: dragOpacityRight }}
                  className="absolute top-8 left-8 z-30 px-5 py-2.5 rounded-2xl bg-primary/90 backdrop-blur-md border border-emerald-300/30 shadow-2xl pointer-events-none"
                >
                  <span className="text-xl font-black text-black italic uppercase tracking-wider">FICHAR</span>
                </motion.div>

                {/* Animated direction labels on final swipe */}
                {direction === 'left' && (
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-8 right-8 z-30 px-5 py-2.5 rounded-2xl bg-red-500/90 backdrop-blur-md border border-red-300/30 shadow-2xl">
                    <span className="text-xl font-black text-white italic uppercase tracking-wider">NOPE</span>
                  </motion.div>
                )}
                {direction === 'right' && (
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-8 left-8 z-30 px-5 py-2.5 rounded-2xl bg-primary/90 backdrop-blur-md border border-emerald-300/30 shadow-2xl">
                    <span className="text-xl font-black text-black italic uppercase tracking-wider">FICHAR</span>
                  </motion.div>
                )}

                {/* Additional Details Overlay at bottom of the card */}
                <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col items-center pt-24 z-20">
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter drop-shadow-md text-center max-w-full truncate px-4">
                        {currentProfile.name || 'Desconocido'}
                    </h2>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 flex items-center gap-2">
                           <Trophy className="w-3 h-3 text-primary" />
                           <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currentProfile.elo || 0} ELO</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 flex items-center gap-2">
                           <Target className="w-3 h-3 text-white/50" />
                           <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{getRankByElo(currentProfile.elo || 0).name}</span>
                        </div>
                    </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full aspect-[3/4] rounded-[3rem] p-10 flex flex-col items-center justify-center text-center glass-premium border border-white/5 space-y-6"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                 <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div>
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">No hay más prospectos</h3>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2">Vuelve más tarde para ojear a nuevas promesas.</p>
              </div>
              <Link href="/">
                 <button className="h-12 px-8 bg-primary rounded-xl text-black font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all mt-4">
                    Volver al Inicio
                 </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: Swipe Hints (replaces buttons) */}
      {currentProfile && (
        <div className="fixed bottom-8 left-0 right-0 z-50 lg:hidden">
          <div className="flex items-center justify-center gap-4 px-8">
            {/* Left hint */}
            <div className="flex items-center gap-2 opacity-40">
              <ChevronLeft className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] italic">Pasar</span>
            </div>

            {/* Center: Swipe instruction */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-gradient-to-r from-red-500/60 to-transparent rounded-full" />
                <div className="px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.25em]">
                    Deslizá la carta
                  </span>
                </div>
                <div className="w-8 h-[2px] bg-gradient-to-l from-primary/60 to-transparent rounded-full" />
              </div>
              
              {/* Profile link */}
              <Link href={`/profile?id=${currentProfile.id}`} className="group">
                <span className="text-[8px] font-black text-white/25 uppercase tracking-[0.3em] group-hover:text-primary transition-colors">
                  Tocar para ver perfil completo
                </span>
              </Link>
            </div>

            {/* Right hint */}
            <div className="flex items-center gap-2 opacity-40">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">Fichar</span>
              <ChevronRight className="w-4 h-4 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Button Controls (hidden on mobile) */}
      {currentProfile && (
        <div className="fixed bottom-10 left-0 right-0 hidden lg:flex justify-center items-center gap-6 z-50">
            <button 
              onClick={() => handleAction('pass')}
              disabled={!!direction}
              className="w-20 h-20 rounded-full bg-surface border border-white/5 flex items-center justify-center shadow-xl hover:bg-white/5 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all group active:scale-90"
            >
               <X className="w-8 h-8 text-white/40 group-hover:text-red-500 transition-colors" />
            </button>
            <Link href={`/profile?id=${currentProfile.id}`}>
                <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg hover:bg-white/10 hover:border-white/20 transition-all group active:scale-90">
                <Info className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                </button>
            </Link>
            <button
              onClick={() => handleAction('like')}
              disabled={!!direction}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:scale-105 hover:bg-emerald-400 transition-all group active:scale-90 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <Heart className="w-8 h-8 text-black fill-transparent group-hover:fill-black transition-all relative z-10" />
            </button>
        </div>
      )}
    </div>
  );
}
