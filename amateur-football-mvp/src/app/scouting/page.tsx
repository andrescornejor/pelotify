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
    <div className="h-[100dvh] bg-black overflow-hidden relative selection:bg-primary/30 flex flex-col">
      
      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-primary text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_40px_rgba(44,252,125,0.4)] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {showFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] mix-blend-screen rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] mix-blend-screen rounded-full" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Compact Header */}
      <div className="relative z-50 px-5 pt-6 pb-2 flex items-center justify-between shrink-0">
        <Link href="/" className="p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center press-effect">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
            <h1 className="text-lg font-black italic tracking-tighter text-white font-kanit drop-shadow-lg leading-none">
              MERCADO
            </h1>
            <div className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/25">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">
                {Math.max(0, profiles.length - currentIndex)} / {profiles.length}
              </span>
            </div>
        </div>
        <div className="w-9" /> {/* Spacer to balance layout */}
      </div>

      {/* Card Area — fills available space between header and controls */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full max-w-sm mx-auto px-4 min-h-0">
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
              className="w-full relative"
            >
              {/* Profile Card Container — height clamped */}
              <div className="relative w-full rounded-[2rem] flex flex-col items-center justify-center glass-premium border border-white/10 shadow-2xl overflow-hidden group"
                style={{ aspectRatio: '3/4.2', maxHeight: 'calc(100dvh - 220px)' }}
              >
                
                {/* Glow behind the Fifa Card */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* The Model / Player */}
                <div className="relative z-10 scale-[0.85] sm:scale-[0.95] group-hover:scale-[0.9] sm:group-hover:scale-100 transition-transform duration-700 ease-out origin-bottom">
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

                {/* Swipe Direction Labels */}
                {direction === 'left' && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-6 right-6 z-30 px-4 py-1.5 rounded-xl bg-red-500/80 backdrop-blur-md border-2 border-red-300/40 shadow-xl rotate-12">
                    <span className="text-lg font-black text-white italic uppercase tracking-wider">NOPE</span>
                  </motion.div>
                )}
                {direction === 'right' && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-6 left-6 z-30 px-4 py-1.5 rounded-xl bg-primary/80 backdrop-blur-md border-2 border-emerald-300/40 shadow-xl -rotate-12">
                    <span className="text-lg font-black text-black italic uppercase tracking-wider">FICHAR</span>
                  </motion.div>
                )}

                {/* Bottom details overlay */}
                <div className="absolute bottom-0 inset-x-0 px-5 pb-5 pt-16 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col items-center z-20">
                    <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter drop-shadow-md text-center max-w-full truncate">
                        {currentProfile.name || 'Desconocido'}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 flex items-center gap-1.5">
                           <Trophy className="w-2.5 h-2.5 text-primary" />
                           <span className="text-[9px] font-black text-primary uppercase tracking-widest">{currentProfile.elo || 0} ELO</span>
                        </div>
                        <div className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 flex items-center gap-1.5">
                           <Target className="w-2.5 h-2.5 text-white/50" />
                           <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">{getRankByElo(currentProfile.elo || 0).name}</span>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center glass-premium border border-white/5 space-y-6"
              style={{ aspectRatio: '3/4', maxHeight: 'calc(100dvh - 200px)' }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                 <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                  <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">No hay más prospectos</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">Vuelve más tarde para ojear nuevas promesas.</p>
              </div>
              <Link href="/">
                 <button className="h-11 px-8 bg-primary rounded-xl text-black font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all mt-2">
                    Volver al Inicio
                 </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons — inline at the bottom, above BottomNav safe area */}
      {currentProfile && (
        <div className="relative z-50 flex justify-center items-center gap-5 py-4 pb-[calc(16px+env(safe-area-inset-bottom))] shrink-0 mb-20 lg:mb-0">
            <button 
              onClick={() => handleAction('pass')}
              disabled={!!direction}
              className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shadow-xl hover:bg-white/10 hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all group active:scale-90 backdrop-blur-md"
            >
               <X className="w-7 h-7 text-white/40 group-hover:text-red-500 transition-colors" />
            </button>
            <Link href={`/profile?id=${currentProfile.id}`}>
                <button className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shadow-lg hover:bg-white/10 hover:border-white/20 transition-all group active:scale-90 backdrop-blur-md">
                  <Info className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
            </Link>
            <button
              onClick={() => handleAction('like')}
              disabled={!!direction}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:scale-105 hover:bg-emerald-400 transition-all group active:scale-90 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <Heart className="w-7 h-7 text-black fill-transparent group-hover:fill-black transition-all relative z-10" />
            </button>
        </div>
      )}
    </div>
  );
}
