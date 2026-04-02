'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Plus,
  Info,
  ChevronRight,
  Zap,
  Target,
  Trophy,
  X,
  Trash2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecruitmentMatches, useJoinRecruitmentSlot, useDeleteRecruitmentPosting } from '@/hooks/useRecruitmentQueries';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Simple helper to format date without date-fns
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', { 
      weekday: 'long', 
      day: '2-digit', 
      month: '2-digit' 
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

function TutorialModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const steps = [
    {
      title: "INTELIGENCIA DE PUESTO",
      desc: "Los equipos buscan perfiles específicos. Filtrá por tu posición ideal (🧤 Arquero, 🛡️ Defensa, etc.) para jugar donde más rindas.",
      icon: <Target className="text-primary w-8 h-8" />
    },
    {
      title: "FICHAJE INSTANTÁNEO",
      desc: "Al postularte, el sistema te suma automáticamente al roster del partido. Sin chats eternos ni vueltas.",
      icon: <Zap className="text-primary w-8 h-8" />
    },
    {
      title: "PRESTIGIO PELOTIFY",
      desc: "Cumplí con tus compromisos. Los equipos valoran a los cracks que llegan a tiempo y dan el 100%.",
      icon: <Trophy className="text-primary w-8 h-8" />
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              console.log('Backdrop clicked');
              onClose();
            }}
            className="absolute inset-0 bg-background/90 backdrop-blur-2xl cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl glass-premium rounded-[3rem] border border-primary/20 overflow-hidden shadow-[0_0_80px_rgba(44,252,125,0.2)] z-10"
          >
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black italic uppercase font-kanit tracking-tighter leading-none mb-1">GUÍA <span className="text-primary text-glow-primary">TÁCTICA</span></h2>
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">¿Cómo dominar el mercado?</p>
                </div>
                <button 
                  onClick={() => {
                    console.log('X clicked');
                    onClose();
                  }} 
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all border border-white/10"
                >
                  <X size={24} className="text-foreground/40" />
                </button>
              </div>

              <div className="space-y-8">
                {steps.map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/10 flex items-center justify-center shadow-glow-primary overflow-hidden">
                       <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                       {step.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black italic uppercase text-primary mb-1 tracking-widest">{step.title}</h4>
                      <p className="text-foreground/50 text-sm font-medium leading-relaxed italic">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => {
                  console.log('Understand clicked');
                  onClose();
                }}
                className="w-full py-6 rounded-[2rem] bg-primary text-black font-black text-xl font-kanit italic uppercase shadow-glow-primary hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 relative z-20"
              >
                ENTENDIDO, SOY UN CRACK
                <ChevronRight size={24} className="stroke-[3]" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function RecruitmentMarketplace() {
  const { user } = useAuth();
  const { data: matches, isLoading } = useRecruitmentMatches();
  const joinSlotMutation = useJoinRecruitmentSlot();
  const deleteMutation = useDeleteRecruitmentPosting();
  
  const [filterPos, setFilterPos] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('recruitment_tutorial_seen_v2');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setShowTutorial(true), 1500);
      localStorage.setItem('recruitment_tutorial_seen_v2', 'true');
      return () => clearTimeout(timer);
    }
  }, []);
  
  const positions = [
    { code: 'GK', label: 'Arqueros', icon: '🧤' },
    { code: 'DEF', label: 'Defensores', icon: '🛡️' },
    { code: 'MID', label: 'Volantes', icon: '🎯' },
    { code: 'FW', label: 'Delanteros', icon: '⚽' },
  ];

  const handleJoinSlot = async (slotId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para postularte.');
      return;
    }
    
    try {
      await joinSlotMutation.mutateAsync({ slotId, userId: user.id });
    } catch (err) {
      console.error(err);
      alert('Error al postularse. El cupo podría estar lleno.');
    }
  };

  const handleDeletePosting = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Tentativa de eliminar búsqueda ID:', id);
    if (!confirm('¿Estás seguro de que querés eliminar esta búsqueda?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      console.log('Búsqueda eliminada con éxito');
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar la búsqueda.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-outfit">
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      {/* Hero Section - Cinematic Glassmorphism */}
      <div className="relative overflow-hidden pt-24 pb-16 px-6">
        {/* Animated background glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[50%] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setShowTutorial(true)}
                className="w-10 h-10 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all text-foreground/40 group"
              >
                <Info size={20} className="stroke-[2.5]" />
              </button>
              <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter font-kanit uppercase leading-[0.9]">
                MERCADO DE <br/>
                <span className="text-primary text-glow-primary">FICHAJES</span>
              </h1>
            </div>
            <p className="text-foreground/50 text-lg md:text-2xl max-w-2xl font-medium italic">
              Conectamos la pasión con el juego. Encontrá tu lugar en la cancha o fichá a los mejores para tu equipo.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Modern Filter Dock */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-background/60 border-y border-white/5 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center gap-4">
          <div className="flex bg-surface-elevated p-1.5 rounded-2xl border border-white/5 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
            <button 
              onClick={() => setFilterPos(null)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase italic tracking-widest transition-all whitespace-nowrap",
                !filterPos ? "bg-primary text-black shadow-glow-primary" : "text-foreground/40 hover:text-foreground/70"
              )}
            >
              Todos
            </button>
            {positions.map((pos) => (
              <button
                key={pos.code}
                onClick={() => setFilterPos(pos.code)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase italic tracking-widest flex items-center gap-2 transition-all whitespace-nowrap",
                  filterPos === pos.code ? "bg-primary text-black shadow-glow-primary" : "text-foreground/40 hover:text-foreground/70"
                )}
              >
                <span className="text-lg grayscale-0">{pos.icon}</span>
                {pos.label}
              </button>
            ))}
          </div>
          
          <div className="ml-auto flex items-center">
             <Link href="/recruitment/create">
               <motion.button 
                 whileHover={{ scale: 1.05, y: -2 }}
                 whileTap={{ scale: 0.95 }}
                 className="bg-foreground text-background px-8 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] italic flex items-center gap-3 shadow-2xl transition-all"
               >
                 <Plus size={18} className="stroke-[3]" />
                 BUSCAR CRACKS
               </motion.button>
             </Link>
          </div>
        </div>
      </div>

      {/* Marketplace Grid */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        {isLoading ? (
          <div className="grid gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-surface-elevated rounded-[2.5rem] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid gap-10">
            <AnimatePresence mode="popLayout">
              {matches?.filter(m => !filterPos || m.slots.some(s => s.position === filterPos)).map((match) => (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative glass-premium rounded-[3rem] border border-white/10 overflow-hidden hover:border-primary/30 transition-all duration-500"
                >
                  {/* Subtle Background Badge */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all" />

                  <div className="p-10 flex flex-col lg:flex-row gap-12">
                    {/* Left: Tactical Info */}
                    <div className="flex-1 space-y-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="bg-primary/10 text-primary px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.25em] border border-primary/20">
                              {match.skill_level || 'Elite Pro'}
                            </span>
                          </div>
                          <h3 className="text-4xl md:text-5xl font-black italic font-kanit uppercase leading-tight group-hover:text-primary transition-colors">
                            REFUERZO <span className="text-primary/40 group-hover:text-primary/60 transition-colors">SOLICITADO</span>
                          </h3>
                        </div>
                        {user && match.creator_id === user.id && (
                          <button
                            type="button"
                            onClick={(e) => handleDeletePosting(e, match.id)}
                            disabled={deleteMutation.isPending}
                            className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 relative z-50 pointer-events-auto"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>

                      <p className="text-foreground/40 text-lg font-medium italic border-l-2 border-primary/20 pl-6 py-2 leading-relaxed max-w-xl">
                        "{match.description || 'Se busca completar el partido con gente de buena onda y nivel competitivo.'}"
                      </p>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
                          <Calendar className="text-primary w-5 h-5" />
                          <div>
                            <p className="text-[9px] uppercase font-black text-foreground/30 tracking-[0.2em] mb-0.5">Fecha</p>
                            <p className="font-bold text-sm uppercase italic">
                              {formatDate(match.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
                          <Clock className="text-primary w-5 h-5" />
                          <div>
                            <p className="text-[9px] uppercase font-black text-foreground/30 tracking-[0.2em] mb-0.5">Hora</p>
                            <p className="font-bold text-sm uppercase italic">
                                {match.time || '20:00'} HS
                            </p>
                          </div>
                        </div>
                        {match.venue && (
                          <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
                            <MapPin className="text-primary w-5 h-5" />
                            <div>
                              <p className="text-[9px] uppercase font-black text-foreground/30 tracking-[0.2em] mb-0.5">Sede</p>
                              <p className="font-bold text-sm uppercase italic truncate max-w-[120px]">
                                {match.venue.name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Tactical Lineup Slots */}
                    <div className="w-full lg:w-[350px] bg-surface-elevated/40 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-[11px] uppercase font-black text-foreground tracking-[0.3em] font-kanit italic">
                            POSICIONES LIBRES
                          </h4>
                          <span className="text-primary font-black text-sm">
                            {match.slots.filter(s => s.status === 'open').length} VACANTES
                          </span>
                        </div>

                        <div className="space-y-4">
                          {match.slots.map((slot) => (
                            <motion.div 
                              key={slot.id}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-2xl transition-all border",
                                slot.status === 'open' 
                                  ? "bg-foreground/[0.03] border-white/5 hover:border-primary/40 hover:bg-primary/5" 
                                  : "bg-primary/10 border-primary/20 opacity-80"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                                  slot.status === 'open' 
                                    ? "bg-surface-bright text-foreground/40 border border-white/5" 
                                    : "bg-primary text-black shadow-glow-primary"
                                )}>
                                  {slot.position}
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase font-black text-foreground/30 tracking-widest mb-0.5">VACANTE</p>
                                  <p className="text-sm font-black italic uppercase tracking-tighter">
                                    {slot.position === 'GK' ? 'Arquero' : 
                                     slot.position === 'DEF' ? 'Defensor' :
                                     slot.position === 'MID' ? 'Volante' : 
                                     slot.position === 'FW' ? 'Delantero' : 'Cualquiera'}
                                  </p>
                                </div>
                              </div>

                              {slot.status === 'open' ? (
                                <button
                                  onClick={() => handleJoinSlot(slot.id)}
                                  disabled={joinSlotMutation.isPending}
                                  className="w-10 h-10 bg-primary text-black rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-glow-primary"
                                >
                                  <Plus size={20} className="stroke-[3]" />
                                </button>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                  <CheckCircle2 size={18} />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {matches?.length === 0 && (
              <div className="text-center py-32 glass-premium rounded-[4rem] border-dashed border-2 border-white/10">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20 animate-pulse">
                  <AlertCircle className="text-primary" size={40} />
                </div>
                <h3 className="text-3xl font-black italic uppercase mb-2 font-kanit">Silencio en el vestuario</h3>
                <p className="text-foreground/40 font-medium italic text-lg mb-10">No hay búsquedas activas en este momento.</p>
                <Link href="/recruitment/create">
                  <button className="bg-primary text-black px-12 py-4 rounded-2xl font-black uppercase tracking-widest italic shadow-glow-primary hover:scale-105 transition-all">
                    INICIAR UNA BÚSQUEDA
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
