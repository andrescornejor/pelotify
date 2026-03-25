'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sendFriendRequest } from '@/lib/friends';
import { X, Heart, Sparkles, Target, Trophy, Info, ArrowLeft, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    async function fetchProfiles() {
      if (!user) return;
      // Get random profiles for scouting
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('elo', { ascending: false }) // highest rated first
        .limit(10);
      
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
    }, 400); // Wait for exit animation
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
        <Link href="/" className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center">
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
        <div className="w-11 h-11" /> {/* Spacer */}
      </div>

      {/* Main Tinder-like Card Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full max-w-md mx-auto px-6">
        <AnimatePresence mode="popLayout">
          {currentProfile ? (
            <motion.div
              key={currentProfile.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={direction === 'left' 
                ? { x: -300, opacity: 0, rotate: -20, scale: 0.8 } 
                : direction === 'right' 
                  ? { x: 300, opacity: 0, rotate: 20, scale: 0.8 } 
                  : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full relative feel-premium"
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

      {/* Controls */}
      {currentProfile && (
        <div className="fixed bottom-10 left-0 right-0 flex justify-center items-center gap-6 z-50">
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
