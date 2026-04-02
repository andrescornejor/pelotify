'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getRecruitmentMatches, 
  applyToSlot, 
  Match, 
  MatchSlot 
} from '@/lib/matches';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Shield, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  Trophy,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const POSITIONS = [
    { id: 'GK', label: 'Porteros', short: 'POR', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'DF', label: 'Defensas', short: 'DEF', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'MF', label: 'Mediocampistas', short: 'MED', color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'FW', label: 'Delanteros', short: 'DEL', color: 'text-red-400', bg: 'bg-red-400/10' },
];

export default function RecruitmentMarketplace() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<(Match & { open_slots: MatchSlot[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [selectedPosition]);

  async function fetchMatches() {
    setLoading(true);
    try {
      const data = await getRecruitmentMatches();
      
      // Filter by position if selected
      let filtered = data;
      if (selectedPosition) {
        filtered = data.filter(m => 
            m.open_slots.some(s => s.position === selectedPosition)
        );
      }
      
      setMatches(filtered);
    } catch (err) {
      console.error('Error fetching recruitment matches:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApply = async (slotId: string) => {
    if (!user) return;
    setApplying(true);
    try {
      await applyToSlot(slotId, user.id);
      setFeedback('¡Solicitud enviada al organizador!');
      setTimeout(() => setFeedback(null), 3000);
      fetchMatches();
    } catch (err) {
      console.error('Error applying to slot:', err);
    } finally {
      setApplying(false);
      setActiveSlotId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 pb-24">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-8">
            <Link href="/" className="w-12 h-12 glass transition-all flex items-center justify-center rounded-2xl border border-white/10 hover:border-primary/40 active:scale-95">
                <ArrowLeft className="w-5 h-5 text-white/70" />
            </Link>
            <div className="flex flex-col items-center">
                <h1 className="text-2xl font-black italic tracking-tight font-kanit uppercase leading-none">
                    Marketplace <span className="text-primary italic">Pro</span>
                </h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mt-1">Busca Jugadores / Equipo</p>
            </div>
            <div className="w-12 h-12" />
        </div>

        {/* Position Filter */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
            <button 
                onClick={() => setSelectedPosition(null)}
                className={cn(
                    "flex-shrink-0 px-6 py-3 rounded-2xl border transition-all font-black uppercase text-[10px] tracking-widest italic",
                    !selectedPosition 
                        ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(44,252,125,0.3)]" 
                        : "glass border-white/10 text-white/40 hover:border-white/20"
                )}
            >
                Todos
            </button>
            {POSITIONS.map(pos => (
                <button 
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos.id)}
                    className={cn(
                        "flex-shrink-0 px-6 py-3 rounded-2xl border transition-all font-black uppercase text-[10px] tracking-widest italic flex items-center gap-2",
                        selectedPosition === pos.id
                            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                            : "glass border-white/10 text-white/40 hover:border-white/20"
                    )}
                >
                    <span className={cn("w-2 h-2 rounded-full", pos.bg.replace('/10', ''), selectedPosition === pos.id ? "opacity-100" : "opacity-30")} />
                    {pos.label}
                </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-white/40 font-black uppercase tracking-widest text-[10px] animate-pulse">Escaneando Canchas...</p>
             </div>
        ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 glass rounded-[3rem] border border-white/5 p-12">
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center">
                    <Users className="w-10 h-10 text-white/20" />
                </div>
                <div>
                    <h3 className="text-2xl font-black italic uppercase font-kanit">No hay vacantes</h3>
                    <p className="text-white/30 text-[11px] font-medium mt-2 max-w-[200px] mx-auto">Actualmente no hay partidos buscando jugadores de tu posición.</p>
                </div>
                <button 
                    onClick={() => setSelectedPosition(null)}
                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    Ver Todo el Mercado
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                {matches.map((match) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={match.id}
                        className="glass relative overflow-hidden rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all group"
                    >
                        {/* Background Visual */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all" />
                        
                        <div className="p-8">
                             {/* Header Post */}
                             <div className="flex justify-between items-start mb-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary uppercase tracking-widest">
                                            {match.type}
                                        </span>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                            {match.level || 'Semipro'}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase font-kanit tracking-tight leading-none">
                                        {match.recruitment_title || `Partido ${match.type} en ${match.location}`}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black italic text-primary font-kanit">${match.price}</span>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Por Persona</p>
                                </div>
                             </div>

                             {/* Description */}
                             {match.recruitment_description && (
                                <p className="text-[10px] text-white/50 leading-relaxed mb-6 font-medium">
                                    {match.recruitment_description}
                                </p>
                             )}

                             {/* Match Details */}
                             <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <Calendar className="w-4 h-4 text-white/30" />
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Día</p>
                                        <p className="text-[10px] font-black">{match.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <Clock className="w-4 h-4 text-white/30" />
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Hora</p>
                                        <p className="text-[10px] font-black">{match.time}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <MapPin className="w-4 h-4 text-white/30" />
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Ubicación</p>
                                        <p className="text-[10px] font-black">{match.location}</p>
                                    </div>
                                </div>
                             </div>

                             {/* Available Slots */}
                             <div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Vacantes Disponibles</p>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {match.open_slots.map(slot => (
                                        <div 
                                            key={slot.id}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                                activeSlotId === slot.id ? "bg-white/10 border-white/20" : "bg-black/40 border-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-black italic",
                                                    POSITIONS.find(p => p.id === slot.position)?.bg || 'bg-white/5',
                                                    POSITIONS.find(p => p.id === slot.position)?.color || 'text-white'
                                                )}>
                                                    {POSITIONS.find(p => p.id === slot.position)?.short}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-tight">
                                                        {POSITIONS.find(p => p.id === slot.position)?.label.slice(0, -1)}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-white/30 uppercase">Equipo {slot.team}</p>
                                                </div>
                                            </div>

                                            {activeSlotId === slot.id ? (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setActiveSlotId(null)}
                                                        className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApply(slot.id)}
                                                        disabled={applying}
                                                        className="px-4 py-2 rounded-xl bg-primary text-black text-[10px] font-black uppercase shadow-[0_0_20px_rgba(44,252,125,0.4)] disabled:opacity-50"
                                                    >
                                                        {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setActiveSlotId(slot.id)}
                                                    className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all active:scale-90"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                             </div>

                             {/* Footer Action */}
                             <Link href={`/match/${match.id}`} className="block mt-6">
                                <button className="w-full h-14 rounded-2xl glass border border-white/5 flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80">
                                    Ver Detalle del Partido
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                             </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>

      {/* Floating Feedback Toast */}
      <AnimatePresence>
        {feedback && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-28 left-6 right-6 z-[100] p-4 bg-primary rounded-2xl flex items-center gap-3 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
                <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-black" />
                </div>
                <p className="text-[11px] font-black text-black uppercase tracking-tight">{feedback}</p>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Spacer */}
    </div>
  );
}
