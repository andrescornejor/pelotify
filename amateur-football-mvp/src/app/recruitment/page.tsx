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
  Trash2,
  Shield,
  ZapIcon,
  Star,
  Users2,
  ArrowRight,
  Skull,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecruitmentMatches, useJoinRecruitmentSlot, useDeleteRecruitmentPosting } from '@/hooks/useRecruitmentQueries';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ChatModal from '@/components/ChatModal';
import { queryKeys } from '@/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

// Simple helper to format date
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

const POSITIONS = [
  { code: 'GK', label: 'Arqueros', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { code: 'DEF', label: 'Defensores', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { code: 'MID', label: 'Volantes', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { code: 'FW', label: 'Delanteros', icon: ZapIcon, color: 'text-red-400', bg: 'bg-red-400/10' },
  { code: 'ANY', label: 'Cualquiera', icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
];

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
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl glass-premium rounded-[4rem] border border-primary/20 overflow-hidden shadow-2xl z-10"
          >
            <div className="p-10 md:p-14 space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black italic uppercase font-kanit tracking-tighter leading-none mb-1">GUÍA <span className="text-primary text-glow-primary">TÁCTICA</span></h2>
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">¿Cómo dominar el mercado?</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all border border-white/10"
                >
                  <X size={24} className="text-foreground/40" />
                </button>
              </div>

              <div className="space-y-10">
                {steps.map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <div className="flex-shrink-0 w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/10 flex items-center justify-center shadow-glow-primary overflow-hidden transition-transform group-hover:scale-110">
                       <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                       {step.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black italic uppercase text-primary mb-2 tracking-widest leading-none">{step.title}</h4>
                      <p className="text-foreground/60 text-base font-medium leading-relaxed italic">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={onClose}
                className="group w-full py-8 rounded-[2.5rem] bg-primary text-black font-black text-2xl font-kanit italic uppercase shadow-glow-primary hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 relative z-20"
              >
                ENTENDIDO, SOY UN CRACK
                <ChevronRight size={32} className="stroke-[3] group-hover:translate-x-2 transition-transform" />
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
  const queryClient = useQueryClient();
  const { data: matches, isLoading } = useRecruitmentMatches();
  const joinSlotMutation = useJoinRecruitmentSlot();
  const deleteMutation = useDeleteRecruitmentPosting();
  
  const [filterPos, setFilterPos] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'market' | 'my-posts'>('market');

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('recruitment_tutorial_seen_v3');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setShowTutorial(true), 1500);
      localStorage.setItem('recruitment_tutorial_seen_v3', 'true');
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleJoinSlot = async (slotId: string, matchId: string, creatorId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para postularte.');
      return;
    }

    if (user.id === creatorId) {
      alert('⚠️ No podés unirte a tu propia búsqueda. ¡Ya sos parte de este partido!');
      return;
    }
    
    // --- POSITIONS RESTRICTION ---
    const match = matches?.find(m => m.id === matchId);
    const slot = match?.slots?.find((s: any) => s.id === slotId);

    if (slot && slot.position !== 'ANY') {
      const userPos = (user.user_metadata?.position || 'ANY').toUpperCase();
      const reqPos = slot.position.toUpperCase();

      const positionGroups: Record<string, string[]> = {
        'GK': ['PO', 'POR', 'ARQUERO', 'GK'],
        'DEF': ['DF', 'DEFENSA', 'DEF', 'LI', 'LD', 'DFC', 'LB', 'RB', 'CB', 'LTD', 'LTI'],
        'MID': ['MC', 'MCD', 'MCO', 'MEDIOCAMPISTA', 'MID', 'MI', 'MD', 'CDM', 'CAM', 'LM', 'RM'],
        'FW': ['DC', 'ED', 'EI', 'DELANTERO', 'FW', 'ST', 'LW', 'RW', 'CF', 'SD'],
      };

      const isMatch = positionGroups[reqPos]?.includes(userPos) || userPos === reqPos;

      if (!isMatch) {
         alert(`⚠️ Esta búsqueda es para la posición: ${reqPos}.\nTu perfil indica que sos: ${userPos}.\n\nActualizá tu posición en tu Perfil si querés postularte.`);
         return;
      }
    }
    // ----------------------------

    try {
      const result = await joinSlotMutation.mutateAsync({ slotId, userId: user.id });
      if (result) {
        alert('✅ ¡FICHAJE CONFIRMADO! Ya estás en el roster del partido.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al postularse. El cupo podría estar lleno.');
    }
  };

  const handleDeletePosting = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que querés eliminar esta búsqueda?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      alert('🚀 Búsqueda eliminada con éxito.');
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar la búsqueda. Verificá tus permisos.');
    }
  };

  const filteredMatches = matches?.filter(m => {
    // Tab logic
    if (activeTab === 'my-posts') {
      if (m.creator_id !== user?.id) return false;
    } else {
      // Global market: everyone else's posts
      if (m.creator_id === user?.id) return false;
    }

    // Position filter logic
    if (!filterPos) return true;
    return m.slots?.some(s => s.position === filterPos && s.status === 'open');
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-outfit">
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      
      {/* Background Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden overflow-x-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-primary/5 blur-[150px] rounded-full opacity-40 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full opacity-30" />
      </div>

      {/* Hero Section */}
      <div className="relative pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowTutorial(true)}
                  className="w-10 h-10 rounded-xl bg-surface-elevated border border-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-foreground/40 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/5 group-hover:animate-pulse" />
                  <Info size={20} className="stroke-[2.5]" />
                </button>
                <div className="h-0.5 w-8 bg-primary/20 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">v.03</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter font-kanit uppercase leading-[0.85] select-none">
                MERCADO DE <br/>
                <span className="text-primary text-glow-primary">FICHAJES</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-lg max-w-2xl font-medium italic leading-relaxed">
                El lugar donde los cracks encuentran su destino. Buscamos refuerzos para completar la gloria.
              </p>

              {/* TAB SELECTOR */}
              <div className="flex items-center p-1 bg-surface-elevated border border-white/5 rounded-2xl shadow-2xl mt-4 w-fit">
                 <button 
                  onClick={() => setActiveTab('market')}
                  className={cn(
                    "px-6 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'market' ? "bg-primary text-black shadow-glow-primary" : "text-foreground/40 hover:text-foreground/70"
                  )}
                 >
                   Mercado Global
                 </button>
                 <button 
                  onClick={() => setActiveTab('my-posts')}
                  className={cn(
                    "px-6 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'my-posts' ? "bg-primary text-black shadow-glow-primary" : "text-foreground/40 hover:text-foreground/70"
                  )}
                 >
                   Mis Búsquedas
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Filter Dock */}
      <div className="sticky top-0 z-40 backdrop-blur-3xl bg-background/60 border-y border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mr-2">FILTRAR POR PUESTO</h4>
            <div className="flex bg-surface-elevated/50 p-2 rounded-3xl border border-white/5 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
              <button 
                onClick={() => setFilterPos(null)}
                className={cn(
                  "px-8 py-3 rounded-2xl text-[12px] font-black uppercase italic tracking-widest transition-all whitespace-nowrap",
                  !filterPos ? "bg-primary text-black shadow-glow-primary" : "text-foreground/40 hover:text-foreground/70"
                )}
              >
                Todos
              </button>
              {POSITIONS.map((pos) => (
                <button
                  key={pos.code}
                  onClick={() => setFilterPos(pos.code)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[12px] font-black uppercase italic tracking-widest flex items-center gap-3 transition-all whitespace-nowrap",
                    filterPos === pos.code ? "bg-primary text-black shadow-glow-primary" : "text-foreground/40 hover:text-foreground"
                  )}
                >
                  <pos.icon size={18} className={cn("transition-colors", filterPos === pos.code ? "text-black" : pos.color)} />
                  {pos.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-6">
                <div className="hidden xl:flex items-center gap-4 text-[9px] font-bold text-foreground/30 italic uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {filteredMatches?.length || 0} BÚSQUEDAS ACTIVAS
                  </span>
                </div>
                
                <Link href="/recruitment/create">
                  <button className="h-12 px-6 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-glow-primary/20">
                    <Plus size={16} /> Publicar
                  </button>
                </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mercado Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[350px] bg-surface-elevated rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                 <div className="space-y-4">
                    <div className="w-48 h-8 bg-white/5 rounded-lg" />
                    <div className="w-full h-12 bg-white/5 rounded-xl" />
                    <div className="flex gap-4">
                       <div className="flex-1 h-16 bg-white/5 rounded-2xl" />
                       <div className="flex-1 h-16 bg-white/5 rounded-2xl" />
                    </div>
                    <div className="w-full h-24 bg-white/5 rounded-2xl" />
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredMatches?.map((match) => (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative glass-premium rounded-[4rem] border border-white/10 overflow-hidden hover:border-primary/40 transition-all duration-700 hover:shadow-[0_0_60px_rgba(44,252,125,0.05)]"
                >
                {/* Skill Badge Floating */}
                <div className="absolute top-8 right-8 z-10 flex items-center gap-4">
                  {/* Coordination Actions */}
                  {user?.id !== match.creator_id && (user?.id === match.creator_id || match.slots?.some(s => s.user_id === user?.id)) && (
                    <div className="flex items-center gap-2">
                       <Link 
                         href={`/profile?id=${match.creator_id}`}
                         className="px-4 h-14 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center italic"
                       >
                         Ver Perfil
                       </Link>
                       <button 
                         onClick={() => setActiveChat({ id: match.creator_id, name: match.creator?.name || 'Organizador' })}
                         className="w-14 h-14 rounded-2xl bg-primary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-primary/20"
                       >
                         <MessageSquare size={22} />
                       </button>
                    </div>
                  )}

                  <span className="bg-white/5 backdrop-blur-md text-foreground/60 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">
                    {match.required_skill_level?.replace('-', ' ') || 'PRO VIBE'}
                  </span>
                  
                  {user && match.creator_id === user.id && (
                    <button
                      onClick={(e) => handleDeletePosting(e, match.id)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                  <div className="p-6 md:p-8 space-y-8 h-full flex flex-col">
                    {/* Top Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-primary rounded-full shadow-glow-primary" />
                        <h3 className="text-2xl md:text-3xl font-black italic font-kanit uppercase leading-[0.9] tracking-tighter">
                          RECLUTAMIENTO <br/>
                          <span className="text-primary/40 group-hover:text-primary transition-colors duration-500">TACTICO</span>
                        </h3>
                      </div>
                      
                      <p className="text-foreground/50 text-base font-medium italic border-l-2 border-white/10 pl-6 py-1 leading-relaxed">
                        "{match.description || 'Se busca completar el partido con cracks de buen nivel.'}"
                      </p>
                    </div>

                    {/* Logistics Row */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[140px] bg-white/5 p-5 rounded-[2.5rem] border border-white/5 flex flex-col gap-2">
                        <Calendar className="text-primary opacity-50" size={20} />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-foreground/20">FECHA</p>
                          <p className="text-lg font-black italic font-kanit uppercase">{formatDate(match.date)}</p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-[140px] bg-white/5 p-5 rounded-[2.5rem] border border-white/5 flex flex-col gap-2">
                        <Clock className="text-primary opacity-50" size={20} />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-foreground/20">HORA</p>
                          <p className="text-lg font-black italic font-kanit uppercase">{match.time?.slice(0, 5)} HS</p>
                        </div>
                      </div>
                      {match.venue && (
                        <div className="flex-[1.5] min-w-[200px] bg-white/5 p-5 rounded-[2.5rem] border border-white/5 flex flex-col gap-2">
                          <MapPin className="text-primary opacity-50" size={20} />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/20">CANCHA</p>
                            <p className="text-lg font-black italic font-kanit uppercase truncate">{match.venue.name}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Slots Area */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">PUESTOS DISPONIBLES</h4>
                        <span className="text-[10px] font-bold text-primary italic uppercase tracking-widest">
                           {match.slots.filter(s => s.status === 'open').length} VACANTES
                        </span>
                      </div>

                      <div className="space-y-4">
                        {match.slots.map((slot) => {
                          const posConfig = POSITIONS.find(p => p.code === slot.position) || POSITIONS[4];
                          const isOpen = slot.status === 'open';
                          return (
                            <motion.div 
                              key={slot.id}
                              whileHover={isOpen ? { x: 10 } : {}}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-[2rem] border transition-all duration-300",
                                isOpen 
                                  ? "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-primary/5" 
                                  : "bg-surface-elevated border-transparent opacity-40 grayscale"
                              )}
                            >
                              <div className="flex items-center gap-6">
                                <div className={cn(
                                  "w-12 h-12 rounded-[1.2rem] flex items-center justify-center border transition-all",
                                  isOpen ? "bg-black/40 border-white/5" : "bg-white/5 border-white/5"
                                )}>
                                  <posConfig.icon size={20} className={isOpen ? posConfig.color : "text-foreground/40"} />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-foreground/20 tracking-widest uppercase leading-none mb-1">
                                    {isOpen ? 'RECLUTANDO' : 'FICHAJE CERRADO'}
                                  </p>
                                  <p className="text-base font-black italic uppercase font-kanit">
                                    {posConfig.label}
                                  </p>
                                </div>
                              </div>

                              {isOpen ? (
                                <button
                                  onClick={() => handleJoinSlot(slot.id, match.id, match.creator_id)}
                                  disabled={joinSlotMutation.isPending || user?.id === match.creator_id}
                                  className={cn(
                                    "group w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all shadow-glow-primary relative overflow-hidden",
                                    user?.id === match.creator_id 
                                      ? "bg-white/5 border border-white/10 opacity-30 cursor-not-allowed" 
                                      : "bg-primary text-black hover:scale-110 active:scale-95"
                                  )}
                                >
                                  {user?.id === match.creator_id ? (
                                    <Shield size={20} className="text-foreground/20" />
                                  ) : (
                                    <>
                                      <div className="absolute inset-0 bg-white/20 -translate-y-full group-hover:translate-y-0 transition-transform" />
                                      <Plus size={28} className="relative z-10 stroke-[3]" />
                                    </>
                                  )}
                                </button>
                              ) : (
                                <div className="w-14 h-14 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-foreground/20 border border-white/5">
                                  <CheckCircle2 size={24} />
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* CTA Footer inside card */}
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-surface-bright border-2 border-background flex items-center justify-center overflow-hidden">
                               <Users2 size={14} className="text-foreground/20" />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                             <span className="text-[8px] font-black text-primary">+</span>
                          </div>
                       </div>
                       <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] italic">Postulate ahora y jugá hoy</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredMatches?.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-32 text-center glass-premium rounded-[4rem] border-dashed border-2 border-white/10"
              >
                <div className="relative w-32 h-32 mx-auto mb-12">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                   <div className="relative w-full h-full bg-surface-elevated rounded-full flex items-center justify-center border border-primary/20">
                      <Skull className="text-primary" size={60} />
                   </div>
                </div>
                <h3 className="text-5xl font-black italic uppercase font-kanit mb-4 tracking-tighter">Silencio en el vestuario</h3>
                <p className="text-foreground/40 font-medium italic text-xl mb-12 max-w-md mx-auto">No hay búsquedas activas para estos puestos. ¿Por qué no armas una vos?</p>
                <Link href="/recruitment/create">
                  <button className="bg-primary text-black px-12 py-6 rounded-[2rem] font-black text-xl uppercase tracking-tight italic shadow-glow-primary hover:scale-105 active:scale-95 transition-all">
                    INICIAR UNA BÚSQUEDA
                  </button>
                </Link>
              </motion.div>
            )}
          </div>
        )}
        {/* Modals will handle the rest */}

        {/* --- MODALS --- */}
        <ChatModal 
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
          recipientId={activeChat?.id}
          recipientName={activeChat?.name}
        />
      </div>
    </div>
  );
}
