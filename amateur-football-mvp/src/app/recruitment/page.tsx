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
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useJoinEmergencyMatch } from '@/hooks/useEmergencyQueries';
import { Match } from '@/lib/matches';
import { cn } from '@/lib/utils';

export default function RecruitmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const joinMutation = useJoinEmergencyMatch();
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
          .select('*, participants:match_participants(count)')
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
      await joinMutation.mutateAsync({ matchId, userId: user.id });
      setDirection('right');
      setTimeout(() => {
        router.push(`/match/emergency?id=${matchId}`);
      }, 300);
    } catch (err) {
      console.error(err);
      alert('Error uniéndose al partido.');
    }
  };

  const handleViewDetails = (matchId: string) => {
    router.push(`/match/emergency?id=${matchId}`);
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 animate-pulse border border-amber-500/20 flex items-center justify-center shadow-2xl">
            <Zap className="w-8 h-8 text-amber-500 animate-bounce shadow-amber-500/20 shadow-xl" />
          </div>
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 animate-pulse">Escaneando Emergencias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />
      </div>

      {/* Header */}
      <div className="absolute top-10 left-0 right-0 px-6 max-w-lg mx-auto flex flex-col items-center gap-2 text-center pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Misiones Activas</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white font-kanit">
          Explorador de <span className="text-amber-500 italic">Fichajes</span>
        </h1>
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
          Equipos que buscan refuerzos inmediatos cerca de vos
        </p>
      </div>

      <div className="relative w-full max-w-sm aspect-[3/4.5] flex items-center justify-center">
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
              onClick={() => handleViewDetails(currentMatch.id)}
              className="absolute w-full h-full bg-[#111] glass-premium rounded-[3rem] border border-white/10 shadow-2xl p-8 flex flex-col cursor-grab active:cursor-grabbing overflow-hidden group border-amber-500/10"
            >
              {/* Swipe Overlays */}
              <motion.div style={{ backgroundColor: colorJoin }} className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <Check className="w-24 h-24 text-black opacity-60" />
              </motion.div>
              <motion.div style={{ backgroundColor: colorPass }} className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <X className="w-24 h-24 text-white opacity-40" />
              </motion.div>

              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4" />

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex flex-col gap-1">
                      <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 w-fit">
                        <span className="text-[10px] font-black text-amber-500 italic uppercase tracking-widest">{currentMatch.type}</span>
                      </div>
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Formato de Match</span>
                   </div>
                   <div className="flex items-center gap-2 group/alert">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">URGENTE</span>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="flex flex-col gap-1 text-center">
                        <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] font-black italic uppercase tracking-tighter text-white font-kanit leading-none">
                          {currentMatch.location}
                        </h2>
                        <div className="flex items-center justify-center gap-2 opacity-40">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white">Cancha Localizada</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-1 items-center">
                            <Calendar className="w-4 h-4 text-amber-500/40" />
                            <span className="text-[10px] font-black text-white">{new Date(currentMatch.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                         </div>
                         <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-1 items-center">
                            <Clock className="w-4 h-4 text-amber-500/40" />
                            <span className="text-[10px] font-black text-white">{currentMatch.time} HS</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 text-center space-y-3 relative overflow-hidden group/slots">
                      <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover/slots:opacity-100 transition-opacity" />
                      <Users className="w-8 h-8 text-amber-500/40 mx-auto mb-1" />
                      <h4 className="text-4xl font-black italic font-kanit text-amber-500 leading-none shadow-amber-500/20">FALTAN {currentMatch.missing_players}</h4>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">PUESTOS VACANTES</p>
                   </div>
                   
                   <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <Award className="w-4 h-4 text-amber-500/40" />
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{currentMatch.level || 'Amateur'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <Shield className="w-4 h-4 text-amber-500/40" />
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Refuerzo</span>
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-8 flex items-center justify-center gap-6">
                   <div className="flex flex-col items-center gap-2">
                       <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Desliza para descartar</span>
                       <div className="w-10 h-px bg-white/5" />
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
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto relative group">
                 <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000 opacity-20" />
                 <Activity className="w-10 h-10 text-white/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white font-kanit leading-none">Todo en Calma</h3>
                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
                  No hay misiones de reclutamiento activas en este momento.
                </p>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="px-8 h-12 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all shadow-xl"
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
           className="w-16 h-16 rounded-full bg-black border border-red-500/20 flex items-center justify-center shadow-xl shadow-red-500/5 hover:scale-110 active:scale-95 transition-all text-red-500/40 hover:text-red-500 hover:border-red-500/50"
         >
            <X className="w-8 h-8" />
         </button>
         <button 
           onClick={() => currentMatch && handleJoin(currentMatch.id)}
           className="w-20 h-20 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-[0_15px_40px_rgba(245,158,11,0.3)] hover:scale-110 active:scale-95 transition-all"
         >
            <Zap className="w-10 h-10 fill-current" />
         </button>
      </div>
    </div>
  );
}
