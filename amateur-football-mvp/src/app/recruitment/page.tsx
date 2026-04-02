'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Zap, 
  X, 
  Check, 
  ArrowRight,
  Shield,
  Activity,
  Award,
  User2,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Match, joinMatch } from '@/lib/matches';
import { cn } from '@/lib/utils';

export default function RecruitmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // Swipe logic
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const colorJoin = useTransform(x, [0, 150], ["rgba(255,255,255,0)", "rgba(44,252,125,0.6)"]);
  const colorPass = useTransform(x, [0, -150], ["rgba(255,255,255,0)", "rgba(239,68,68,0.6)"]);

  useEffect(() => {
    async function fetchEmergencies() {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*, profiles:creator_id(name, avatar_url), participants:match_participants(count)')
          .eq('is_recruitment', true)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) throw error;
        // Filter out matches user is already in (best effort)
        setMatches(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEmergencies();
  }, []);

  const handleJoin = async (matchId: string) => {
    if (!user) return;
    try {
      await joinMatch(matchId, user.id);
      setDirection('right');
      setTimeout(() => {
        setMatches(prev => prev.filter(m => m.id !== matchId));
        setDirection(null);
        x.set(0);
      }, 300);
    } catch (err) {
      console.error(err);
      alert('Error uniéndose al partido.');
    }
  };

  const handlePass = () => {
    setDirection('left');
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      x.set(0);
    }, 300);
  };

  const currentMatch = matches[currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-primary/20 animate-pulse border border-primary/20 flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary animate-bounce shadow-primary/20" />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 animate-pulse">Escaneando Emergencias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(44,252,125,0.03)_0%,transparent_70%)]" />
      </div>

      {/* Header */}
      <div className="absolute top-10 left-0 right-0 px-6 max-w-lg mx-auto flex flex-col items-center gap-2 text-center pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Modo Emergencia</span>
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-foreground font-kanit">
          Explorador de <span className="text-primary italic">Fichajes</span>
        </h1>
        <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
          Equipos que buscan refuerzos inmediatos cerca de vos
        </p>
      </div>

      <div className="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center">
        <AnimatePresence>
          {currentMatch ? (
            <motion.div
              key={currentMatch.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              style={{ x, rotate, opacity }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) handleJoin(currentMatch.id);
                else if (info.offset.x < -100) handlePass();
              }}
              className="absolute w-full h-full glass-premium rounded-[3rem] border border-white/10 shadow-2xl p-8 flex flex-col cursor-grab active:cursor-grabbing overflow-hidden group"
            >
              {/* Swipe Overlays */}
              <motion.div style={{ backgroundColor: colorJoin }} className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <Check className="w-24 h-24 text-white opacity-40" />
              </motion.div>
              <motion.div style={{ backgroundColor: colorPass }} className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <X className="w-24 h-24 text-white opacity-40" />
              </motion.div>

              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4" />

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex flex-col gap-1">
                      <div className="px-3 py-1 rounded-lg bg-foreground/5 border border-white/5 w-fit">
                        <span className="text-[10px] font-black text-primary italic uppercase tracking-widest">{currentMatch.type}</span>
                      </div>
                      <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.3em]">Formato de Match</span>
                   </div>
                   <div className="flex items-center gap-2 group/alert">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">URGENTE</span>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      {/* Match Context & Urgent Status */}
                      <div className="flex flex-col gap-1 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                           <div className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest italic animate-pulse">
                              PARTIDO YA ARMADO
                           </div>
                        </div>
                        <h2 className="text-[clamp(1.5rem,5vw,2.2rem)] font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none">
                          {currentMatch.location}
                        </h2>
                        <div className="flex items-center justify-center gap-2 opacity-40">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">En {currentMatch.location.split(',')[0]}</span>
                        </div>
                      </div>
                      
                      {/* Key Emergency Stats */}
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 flex flex-col gap-1 items-center group/info">
                            <Clock className="w-5 h-5 text-amber-500 group-hover/info:scale-110 transition-transform" />
                            <span className="text-[11px] font-black text-foreground mt-1 uppercase">{currentMatch.time} HS</span>
                            <span className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">Kickoff</span>
                         </div>
                         <div className="p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 flex flex-col gap-1 items-center group/info">
                            <DollarSign className="w-5 h-5 text-emerald-400 group-hover/info:scale-110 transition-transform" />
                            <span className="text-[11px] font-black text-foreground mt-1 uppercase">${currentMatch.price || 0}</span>
                            <span className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">Por Jugador</span>
                         </div>
                      </div>
                   </div>

                   {/* The "Emergency Call" Section */}
                   <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 text-center space-y-3 relative overflow-hidden group/slots">
                      <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover/slots:opacity-100 transition-opacity" />
                      
                      <div className="relative flex flex-col items-center">
                         <div className="flex -space-x-3 mb-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                               <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-surface flex items-center justify-center">
                                  <User2 className="w-5 h-5 text-foreground/20" />
                               </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-background bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                               <span className="text-xs font-black text-black">+{currentMatch.missing_players}</span>
                            </div>
                         </div>
                         
                         <h4 className="text-4xl font-black italic font-kanit text-amber-500 leading-none tracking-tighter uppercase whitespace-nowrap">
                            NECESITAMOS {currentMatch.missing_players} {currentMatch.missing_players === 1 ? 'MÁS' : 'MÁS'}
                         </h4>
                         <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-2 italic">
                            Partido de {currentMatch.type} casi lleno
                         </p>
                      </div>
                   </div>
                   
                   {/* Organizer / Reputation */}
                   <div className="flex items-center justify-center gap-6 py-2">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center shrink-0">
                             <User2 className="w-4 h-4 text-primary/40" />
                          </div>
                          <div className="flex flex-col text-left">
                             <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest leading-none">Organiza</span>
                             <span className="text-[10px] font-black text-foreground/60 italic uppercase truncate max-w-[80px]">{(currentMatch as any).profiles?.name || 'Veterano'}</span>
                          </div>
                       </div>
                       
                       <div className="h-4 w-px bg-white/5" />
                       
                       <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-primary/40" />
                          <span className="text-[9px] font-black text-foreground/50 uppercase tracking-tighter italic">Vía Pelotify ✅</span>
                       </div>
                   </div>
                </div>

                <div className="mt-auto pt-8 flex items-center justify-center gap-6">
                   <div className="flex flex-col items-center gap-2">
                       <span className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">Descartar</span>
                       <div className="w-10 h-px bg-foreground/5" />
                   </div>
                   <div className="flex flex-col items-center gap-2">
                       <span className="text-[7px] font-black text-primary/40 uppercase tracking-widest">Postularse</span>
                       <div className="w-10 h-px bg-primary/20" />
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-full bg-surface border border-white/5 flex items-center justify-center mx-auto relative group">
                 <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000 opacity-20" />
                 <Activity className="w-10 h-10 text-foreground/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none">Todo en Calma</h3>
                <p className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
                  No hay búsquedas de emergencia activas en este momento.
                </p>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="px-8 h-12 rounded-2xl bg-foreground/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
              >
                 Volver al Inicio
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Indicators - Sticky at bottom */}
      <div className="fixed bottom-12 flex items-center gap-20">
         <button 
           onClick={handlePass}
           className="w-16 h-16 rounded-full bg-background border border-red-500/20 flex items-center justify-center shadow-xl shadow-red-500/5 hover:scale-110 active:scale-95 transition-all text-red-500/40 hover:text-red-500 hover:border-red-500/50"
         >
            <X className="w-8 h-8" />
         </button>
         <button 
           onClick={() => currentMatch && handleJoin(currentMatch.id)}
           className="w-20 h-20 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_15px_40px_rgba(44,252,125,0.3)] hover:scale-110 active:scale-95 transition-all"
         >
            <Check className="w-10 h-10" />
         </button>
      </div>
    </div>
  );
}
