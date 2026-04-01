'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Target,
  Zap,
  ArrowLeft,
  Trash2,
  Lock,
  Search,
  Star,
  Settings,
  Shield,
  Play,
  Shuffle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTournamentById, deleteTournament, type Tournament } from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock teams for demonstration if none exist
const MOCK_TEAMS = [
    { id: '1', name: 'Rosario Central' },
    { id: '2', name: 'Newells Old Boys' },
    { id: '3', name: 'El Potrero FC' },
    { id: '4', name: 'Los Galácticos' },
    { id: '5', name: 'Amateur United' },
    { id: '6', name: 'La Scaloneta' },
    { id: '7', name: 'Kilometro 11' },
    { id: '8', name: 'Cero a la Izquierda' },
];

export default function TournamentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'bracket' | 'teams'>('info');
  
  // Draw Animation State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStep, setDrawStep] = useState(0);
  const [drawnMatches, setDrawnMatches] = useState<any[]>([]);
  const [visibleTeams, setVisibleTeams] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getTournamentById(id);
        setTournament(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const isCreator = user?.id === tournament?.creator_id;

  const startDraw = async () => {
    setIsDrawing(true);
    setDrawnMatches([]);
    setVisibleTeams([]);
    
    // Simulate real draw animation
    const shuffled = [...MOCK_TEAMS].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length; i += 2) {
       setDrawStep(i / 2 + 1);
       const teamA = shuffled[i];
       const teamB = shuffled[i+1];
       
       await new Promise(r => setTimeout(r, 1200)); // Suspense
       
       setDrawnMatches(prev => [...prev, { teamA, teamB, id: `match-${i}` }]);
    }
    
    setIsDrawing(false);
    setActiveTab('bracket');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-10">
        <div className="text-center space-y-6">
           <Target className="w-20 h-20 text-foreground/10 mx-auto" />
           <h2 className="text-3xl font-black italic uppercase text-foreground">Torneo no encontrado</h2>
           <Link href="/tournaments">
             <button className="px-10 h-16 bg-primary text-black rounded-[1.5rem] font-black text-sm uppercase">VOLVER</button>
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-40">
      {/* ── HEADER ── */}
      <div className="relative h-[40vh] min-h-[400px] overflow-hidden">
        <img 
            src={tournament.banner_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"} 
            className="w-full h-full object-cover grayscale opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-14 max-w-screen-2xl mx-auto space-y-8">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Link href="/tournaments">
                   <button className="w-12 h-12 rounded-2xl bg-foreground/10 hover:bg-primary hover:text-black flex items-center justify-center backdrop-blur-xl transition-all">
                      <ArrowLeft className="w-5 h-5" />
                   </button>
                </Link>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-primary rounded-xl text-black font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-primary/20">
                   {tournament.type}
                </div>
              </div>
              <h1 className="text-5xl lg:text-8xl font-black italic uppercase text-foreground leading-[0.85] tracking-tighter max-w-4xl">
                 {tournament.name}
              </h1>
           </div>

           <div className="flex flex-wrap items-center gap-8 border-t border-foreground/10 pt-8 mt-4">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Ubicación</span>
                 <span className="font-bold text-foreground text-sm uppercase truncate max-w-[200px]">{tournament.location}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Inicia</span>
                 <span className="font-bold text-foreground text-sm uppercase">{tournament.start_date}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Estado</span>
                 <span className="text-primary font-black uppercase text-sm italic">{tournament.status}</span>
              </div>
           </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="max-w-screen-2xl mx-auto p-6 lg:px-14 mt-12 space-y-12 relative z-10">
        <div className="flex items-center gap-1 p-1 bg-foreground/5 rounded-2xl border border-foreground/5 w-fit">
           {(['info', 'bracket', 'teams'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                   "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                   activeTab === tab ? "bg-primary text-black shadow-lg" : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {tab === 'info' ? 'DETALLES' : tab === 'bracket' ? 'LLAVES' : 'EQUIPOS'}
              </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
           {activeTab === 'info' && (
              <motion.div 
                 key="infoTab"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="grid grid-cols-1 lg:grid-cols-3 gap-12"
              >
                 <div className="lg:col-span-2 space-y-12">
                     <div className="space-y-6">
                        <h2 className="text-2xl font-black italic uppercase text-foreground">Sobre el Torneo</h2>
                        <p className="text-foreground/60 leading-relaxed max-w-2xl font-medium">
                           {tournament.description || "Este torneo aún no cuenta con una descripción oficial. ¡Registrate para ser parte de esta competencia épica y demuestra que tu equipo es el mejor de la ciudad!"}
                        </p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/5 space-y-4">
                           <Shield className="w-8 h-8 text-primary" />
                           <h4 className="font-black italic uppercase text-sm tracking-tight">Reglamento Oficial</h4>
                           <p className="text-[11px] text-foreground/40 uppercase font-bold tracking-widest leading-relaxed">Fútbol {tournament.type} profesional con árbitros colegiados y VAR amateur.</p>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/5 space-y-4 text-primary">
                           <Trophy className="w-8 h-8" />
                           <h4 className="font-black italic uppercase text-sm tracking-tight">Gran Premio</h4>
                           <p className="text-[11px] text-primary/60 uppercase font-bold tracking-widest leading-relaxed">{tournament.prize_description || "Trofeo oficial + Medallas + Premio en Efectivo."}</p>
                        </div>
                     </div>
                 </div>

                 <div className="space-y-6">
                    <div className="p-8 glass-premium rounded-[3rem] border border-foreground/10 space-y-8">
                       <div className="space-y-4">
                          <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Inscripción</span>
                          <div className="flex items-end gap-2">
                             <span className="text-6xl font-black text-foreground italic tracking-tighter leading-none">${tournament.entry_fee.toLocaleString()}</span>
                             <span className="text-xs font-black text-foreground/40 uppercase">x EQUIPO</span>
                          </div>
                       </div>
                       
                       <div className="space-y-4 pt-8 border-t border-foreground/5">
                          {isCreator ? (
                             <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                   <Settings className="w-3 h-3" /> Panel del Creador
                                </h4>
                                <button
                                   onClick={() => setActiveTab('bracket')}
                                   className="w-full h-16 bg-primary text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3"
                                >
                                   <Shuffle className="w-4 h-4" />
                                   GESTIONAR LLAVES
                                </button>
                                <button className="w-full h-16 bg-foreground text-background rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
                                   EDITAR TORNEO
                                </button>
                             </div>
                          ) : (
                             <button className="w-full h-20 bg-primary text-black rounded-[1.8rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                REGISTRAR MI EQUIPO
                             </button>
                          )}
                       </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-4">
                       <Zap className="w-5 h-5 fill-current animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Entrega 500 puntos para el Ranking Global</span>
                    </div>
                 </div>
              </motion.div>
           )}

           {activeTab === 'bracket' && (
              <motion.div 
                 key="bracketTab"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-12"
              >
                  {isCreator && drawnMatches.length === 0 && !isDrawing && (
                    <div className="py-32 flex flex-col items-center justify-center text-center gap-8 bg-foreground/[0.03] rounded-[4rem] border-2 border-dashed border-foreground/10">
                       <div className="relative">
                          <Shuffle className="w-16 h-16 text-foreground/10" />
                          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                       </div>
                       <div className="space-y-3">
                          <h3 className="text-3xl font-black italic uppercase text-foreground">Sorteo Desocupado</h3>
                          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] max-w-sm">Aún no se han armado las llaves. Los equipos están listos para el sorteo.</p>
                       </div>
                       <button 
                          onClick={startDraw}
                          className="h-16 px-12 bg-primary text-black rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-4 hover:scale-105 transition-all"
                       >
                          <Play className="w-4 h-4 fill-current" />
                          INICIAR SORTEO EN VIVO
                       </button>
                    </div>
                  )}

                  {/* ── DRAW ANIMATION ── */}
                  <AnimatePresence>
                     {isDrawing && (
                        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-10 overflow-hidden">
                           <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="relative mb-20"
                           >
                              <div className="w-32 h-32 rounded-full border-2 border-primary/40 border-t-primary animate-spin" style={{ animationDuration: '0.8s' }} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <Trophy className="w-10 h-10 text-primary animate-pulse" />
                              </div>
                           </motion.div>

                           <div className="space-y-4 text-center">
                              <h2 className="text-4xl lg:text-7xl font-black italic uppercase text-white tracking-widest">
                                 LLAVE <span className="text-primary italic">#{drawStep}</span>
                              </h2>
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.8em] animate-pulse italic">Realizando sorteo aleatorio...</p>
                           </div>

                           <div className="mt-20 w-full max-w-screen-xl overflow-hidden py-10 flex gap-6 px-10">
                              {drawnMatches.map((match, idx) => (
                                 <motion.div 
                                    key={match.id}
                                    initial={{ scale: 0, opacity: 0, x: 200 }}
                                    animate={{ scale: 1, opacity: 1, x: 0 }}
                                    className="flex-shrink-0 w-80 p-8 glass-premium rounded-[2.5rem] border border-white/20 bg-white/5 space-y-6"
                                 >
                                    <div className="flex flex-col items-center gap-4">
                                       <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                          <Shield className="w-8 h-8 text-white" />
                                       </div>
                                       <span className="text-xl font-black uppercase text-white italic tracking-tighter">{match.teamA.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <div className="h-px flex-1 bg-white/10" />
                                       <span className="text-[10px] font-black text-primary uppercase">VS</span>
                                       <div className="h-px flex-1 bg-white/10" />
                                    </div>
                                    <div className="flex flex-col items-center gap-4">
                                       <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                          <Shield className="w-8 h-8 text-white" />
                                       </div>
                                       <span className="text-xl font-black uppercase text-white italic tracking-tighter">{match.teamB.name}</span>
                                    </div>
                                 </motion.div>
                              ))}
                           </div>
                        </div>
                     )}
                  </AnimatePresence>

                  {/* ── BRACKET VIEW ── */}
                  {drawnMatches.length > 0 && !isDrawing && (
                     <div className="space-y-16 py-12 px-6 overflow-x-auto min-w-full no-scrollbar">
                        <div className="flex items-start gap-32">
                           {/* ROUND 1: QUARTER FINALS */}
                           <div className="space-y-8 min-w-[320px]">
                              <div className="flex items-center gap-4 mb-12">
                                 <div className="w-2 h-2 rounded-full bg-primary" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Cuartos de Final (R1)</span>
                              </div>
                              {drawnMatches.map((m, idx) => (
                                 <motion.div 
                                    key={m.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 bg-foreground/[0.03] border border-foreground/10 rounded-[2rem] relative"
                                 >
                                    <div className="space-y-4">
                                       <div className="flex items-center justify-between">
                                          <span className="text-xs font-black uppercase italic text-foreground tracking-tighter">{m.teamA.name}</span>
                                          <div className="w-6 h-6 rounded-md bg-foreground/5 flex items-center justify-center font-black text-[10px]">0</div>
                                       </div>
                                       <div className="h-px bg-foreground/5" />
                                       <div className="flex items-center justify-between">
                                          <span className="text-xs font-black uppercase italic text-foreground tracking-tighter">{m.teamB.name}</span>
                                          <div className="w-6 h-6 rounded-md bg-foreground/5 flex items-center justify-center font-black text-[10px]">0</div>
                                       </div>
                                    </div>
                                    {/* Connector line */}
                                    <div className="absolute top-1/2 -right-32 w-32 h-[1.5px] bg-foreground/10" />
                                 </motion.div>
                              ))}
                           </div>

                           {/* SEMI FINALS */}
                           <div className="space-y-40 pt-20 min-w-[320px]">
                              <div className="flex items-center gap-4 mb-4">
                                 <div className="w-2 h-2 rounded-full bg-primary/40" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Semi-Finales (R2)</span>
                              </div>
                              {[1, 2].map((m, idx) => (
                                 <div key={idx} className="p-6 bg-foreground/[0.03] border border-foreground/10 rounded-[2rem] relative opacity-40 grayscale">
                                    <div className="space-y-4">
                                       <div className="flex items-center justify-between">
                                          <span className="text-xs font-black uppercase italic text-foreground/20">Por Definir</span>
                                          <div className="w-6 h-6" />
                                       </div>
                                       <div className="h-px bg-foreground/5" />
                                       <div className="flex items-center justify-between">
                                          <span className="text-xs font-black uppercase italic text-foreground/20">Por Definir</span>
                                          <div className="w-6 h-6" />
                                       </div>
                                    </div>
                                    <div className="absolute top-1/2 -right-32 w-32 h-[1.5px] bg-foreground/10" />
                                 </div>
                              ))}
                           </div>

                           {/* FINAL */}
                           <div className="pt-56 min-w-[320px]">
                              <div className="flex flex-col items-center text-center gap-8">
                                 <div className="space-y-4">
                                    <Trophy className="w-16 h-16 text-primary mx-auto animate-bounce" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">LA GRAN FINAL</span>
                                 </div>
                                 <div className="w-full p-8 p-6 bg-primary/[0.05] border-2 border-primary/20 rounded-[3rem] relative opacity-50">
                                    <div className="space-y-6">
                                       <span className="text-2xl font-black italic uppercase text-foreground/20 italic">CHAMPION'S SLOT</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
              </motion.div>
           )}

           {activeTab === 'teams' && (
               <motion.div 
                  key="teamsTab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
               >
                  {MOCK_TEAMS.map((team, idx) => (
                     <div key={team.id} className="p-6 glass-premium rounded-[2rem] border border-foreground/5 flex flex-col items-center gap-4 text-center group hover:bg-primary transition-all">
                        <div className="w-20 h-20 rounded-full bg-foreground/10 group-hover:bg-black/10 flex items-center justify-center">
                           <Shield className="w-10 h-10 group-hover:text-black transition-colors" />
                        </div>
                        <div className="space-y-1">
                           <h4 className="font-black italic uppercase text-foreground group-hover:text-black transition-colors">{team.name}</h4>
                           <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest group-hover:text-black/40">Equipo registrado</span>
                        </div>
                     </div>
                  ))}
               </motion.div>
           )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
         @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px) rotate(-5deg); }
            75% { transform: translateX(2px) rotate(5deg); }
         }
         .animate-shake {
            animation: shake 0.3s ease-in-out infinite;
         }
      `}</style>
    </div>
  );
}
