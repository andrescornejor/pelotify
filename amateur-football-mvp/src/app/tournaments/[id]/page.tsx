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
  X,
  PlusCircle,
  Clock,
  DollarSign,
  User,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTournamentById, deleteTournament, registerTeamForTournament, createTournamentMatches, type Tournament } from '@/lib/tournaments';
import { getUserTeams } from '@/lib/teams';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TeamInTournament {
  id: string;
  name: string;
  logo_url?: string;
  captain_id?: string;
  status?: string;
}

export default function TournamentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'bracket' | 'teams'>('info');
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [bracketMatches, setBracketMatches] = useState<any[]>([]);
  
  // Draw Animation State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStep, setDrawStep] = useState(0);
  const [drawnMatches, setDrawnMatches] = useState<any[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getTournamentById(id);
      setTournament(data);
      
      const { data: matches } = await supabase
        .from('matches')
        .select('*, team_a:teams!team_a_id(id, name, logo_url), team_b:teams!team_b_id(id, name, logo_url)')
        .eq('tournament_id', id)
        .order('tournament_round', { ascending: true })
        .order('tournament_match_number', { ascending: true });
      
      if (matches) setBracketMatches(matches);
      
      if (user) {
        const teamsRaw = await getUserTeams(user.id);
        setUserTeams(teamsRaw.filter((t: any) => t.role === 'captain'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, user]);

  const isCreator = user?.id === tournament?.creator_id;
  
  const teams = useMemo<TeamInTournament[]>(() => {
    if (!tournament?.tournament_teams) return [];
    return tournament.tournament_teams.map((tt: any) => ({
      ...tt.teams,
      status: tt.status
    }));
  }, [tournament]);

  const isTeamAlreadyRegistered = (teamId: string) => {
    return teams.some((t) => t.id === teamId);
  };

  const handleRegisterTeam = async (teamId: string) => {
    if (registering) return;
    try {
      setRegistering(true);
      await registerTeamForTournament(id, teamId);
      setShowJoinModal(false);
      await load();
    } catch (err: any) {
      alert(err.message || 'Error al registrar el equipo');
    } finally {
      setRegistering(false);
    }
  };

  const startDraw = async () => {
    if (teams.length < 2) {
       alert('Se necesitan al menos 2 equipos para iniciar el sorteo.');
       return;
    }
    
    setIsDrawing(true);
    setDrawnMatches([]);
    
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const matchesToPersist: any[] = [];
    
    for (let i = 0; i < shuffled.length; i += 2) {
       if (!shuffled[i+1]) break; 
       setDrawStep(i / 2 + 1);
       
       const teamA = shuffled[i];
       const teamB = shuffled[i+1];
       
       await new Promise(r => setTimeout(r, 1000));
       
       const matchObj = { teamA, teamB, id: `temp-${i}` };
       setDrawnMatches(prev => [...prev, matchObj]);
       
       matchesToPersist.push({
           team_a_id: teamA.id,
           team_b_id: teamB.id,
           round: 1,
           match_number: i / 2 + 1
       });
    }
    
    await createTournamentMatches(id, matchesToPersist);
    await new Promise(r => setTimeout(r, 800));
    setIsDrawing(false);
    await load();
    setActiveTab('bracket');
  };

  const handleDelete = async () => {
     if (!confirm('¿Estás seguro de que quieres eliminar este torneo?')) return;
     try {
        await deleteTournament(id);
        router.push('/tournaments');
     } catch (err) {
        alert('Error al eliminar el torneo');
     }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-40">
      {/* ── HEADER ── */}
      <div className="relative h-[45vh] min-h-[450px] overflow-hidden">
        <img 
            src={tournament.banner_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"} 
            className="w-full h-full object-cover grayscale opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-14 max-w-screen-2xl mx-auto space-y-8">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Link href="/tournaments">
                   <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-primary hover:text-black flex items-center justify-center md: transition-all border border-white/5 group">
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                   </button>
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-black font-black text-[10px] uppercase tracking-widest italic shadow-2xl shadow-primary/30">
                   FÚTBOL {tournament.type}
                </div>
              </div>
              <div className="flex items-center justify-between gap-6">
                <h1 className="text-6xl lg:text-9xl font-black italic uppercase text-foreground leading-[0.8] tracking-tighter max-w-4xl drop-shadow-2xl">
                    {tournament.name}
                </h1>
                {isCreator && (
                    <button onClick={handleDelete} className="w-16 h-16 rounded-[2rem] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all border border-red-500/20 group">
                        <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                )}
              </div>
           </div>

           <div className="flex flex-wrap items-center gap-10 border-t border-white/5 pt-10 mt-6 overflow-x-auto no-scrollbar">
              <div className="flex flex-col gap-1 min-w-max">
                 <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] italic">Sede Principal</span>
                 <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="font-black italic text-foreground text-sm uppercase tracking-tighter">{tournament.location}</span>
                 </div>
              </div>
              <div className="flex flex-col gap-1 min-w-max">
                 <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] italic">Inicio</span>
                 <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="font-black italic text-foreground text-sm uppercase tracking-tighter">{tournament.start_date.split('-').reverse().join('/')}</span>
                 </div>
              </div>
              <div className="flex flex-col gap-1 min-w-max">
                 <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] italic">Equipos registrados</span>
                 <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="font-black italic text-foreground text-sm uppercase tracking-tighter">{teams.length} DE {tournament.max_teams}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto p-6 lg:px-14 mt-12 space-y-16 relative z-10">
        <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 w-fit md:">
           {(['info', 'bracket', 'teams'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                   "px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                   activeTab === tab ? "bg-primary text-black shadow-xl shadow-primary/20" : "text-foreground/30 hover:text-foreground hover:bg-white/5"
                )}
              >
                {tab === 'info' ? 'DETALLES' : tab === 'bracket' ? 'LLAVES' : 'EQUIPOS'}
              </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
           {activeTab === 'info' && (
              <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                 <div className="lg:col-span-2 space-y-16">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black italic uppercase text-foreground tracking-tighter">Reglamento y <span className="text-primary italic">Premios</span></h2>
                        <p className="text-foreground/50 leading-relaxed max-w-3xl font-bold text-lg uppercase tracking-tight italic">
                           {tournament.description || "Prepárate para la competencia definitiva. Los mejores equipos de la región se enfrentan en un formato de eliminación directa donde solo uno levantará la copa."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6 group hover:bg-primary transition-all">
                           <DollarSign className="w-10 h-10 text-primary group-hover:text-black transition-colors" />
                           <div className="space-y-2">
                               <h4 className="font-black italic uppercase text-xl text-foreground group-hover:text-black transition-colors">Sistema de Cobro</h4>
                               <p className="text-[10px] text-foreground/40 group-hover:text-black/40 font-black uppercase tracking-widest leading-relaxed">Inscripción única por equipo (\$${tournament.entry_fee.toLocaleString()}) más costo de cancha por jugador por partido (\$${tournament.match_fee.toLocaleString()}).</p>
                           </div>
                        </div>
                        <div className="p-10 rounded-[3rem] bg-primary/10 border border-primary/20 space-y-6 text-primary">
                           <Trophy className="w-10 h-10" />
                           <div className="space-y-2">
                               <h4 className="font-black italic uppercase text-xl">Bolsa de Premios</h4>
                               <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest leading-relaxed">Premio garantizado de \$${Math.round(tournament.max_teams * tournament.entry_fee * (tournament.prize_percentage / 100)).toLocaleString()} para el primer puesto + medallas oficiales.</p>
                           </div>
                        </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="p-10 glass-premium rounded-[4rem] border border-white/10 space-y-10 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 rotate-45 pointer-events-none"><Zap className="w-64 h-64 text-primary" /></div>
                       
                       <div className="space-y-2">
                          <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.5em] italic">Inscripción / Equipo</span>
                          <span className="text-7xl font-black text-foreground italic tracking-tighter leading-none block">${tournament.entry_fee.toLocaleString()}</span>
                       </div>

                       <div className="space-y-6 pt-10 border-t border-white/5">
                          {isCreator ? (
                             <div className="space-y-4">
                                <button onClick={() => setActiveTab('bracket')} className="w-full h-20 bg-primary text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                                   <Shuffle className="w-5 h-5" /> GESTIONAR SORTEO
                                </button>
                                <button className="w-full h-16 bg-white/5 text-foreground rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">EDITAR TORNEO</button>
                             </div>
                          ) : (
                             <button onClick={() => setShowJoinModal(true)} className="w-full h-24 bg-primary text-black rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                                REGISTRAR EQUIPO <ChevronRight className="w-6 h-6" />
                             </button>
                          )}
                       </div>
                    </div>
                 </div>
              </motion.div>
           )}

           {activeTab === 'bracket' && (
              <motion.div key="bracket" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-16">
                 {bracketMatches.length === 0 && !isDrawing ? (
                     <div className="py-40 flex flex-col items-center justify-center text-center gap-10 bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-150" />
                        <Shuffle className="w-24 h-24 text-foreground/10 relative z-10" />
                        <div className="space-y-4 relative z-10">
                           <h3 className="text-4xl font-black italic uppercase text-foreground tracking-tighter">Sorteo Pendiente</h3>
                           <p className="text-[11px] font-black text-foreground/20 uppercase tracking-[0.5em] max-w-sm mx-auto italic">
                             {teams.length < tournament.max_teams 
                                 ? `Faltan equipos por inscribirse (${teams.length}/${tournament.max_teams}).`
                                 : "El torneo está completo. Preparado para el sorteo oficial."}
                           </p>
                        </div>
                        {isCreator && (
                         <button 
                             disabled={teams.length < 2}
                             onClick={startDraw}
                             className="h-20 px-16 bg-primary text-black rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-6 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 relative z-10"
                         >
                             <Play className="w-5 h-5 fill-current" /> INICIAR SORTEO EN VIVO
                         </button>
                        )}
                     </div>
                 ) : (
                    <div className="flex gap-20 overflow-x-auto no-scrollbar py-10 px-2 min-h-[600px] items-start">
                        <div className="space-y-20 min-w-[340px]">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(45,252,125,0.4)]" />
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic uppercase">Llave 1 (Round 1)</span>
                            </div>
                            {bracketMatches.map((m) => (
                                <Link href={`/match/${m.id}`} key={m.id} className="block group">
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6 relative transition-all group-hover:border-primary/50 group-hover:bg-primary/[0.03] group-hover:shadow-2xl group-hover:shadow-primary/5">
                                        <div className="space-y-6 relative z-10">
                                           <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                                                    {m.team_a?.logo_url ? <img src={m.team_a.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-5 h-5 opacity-20" />}
                                                 </div>
                                                 <span className="text-sm font-black uppercase italic text-foreground tracking-tighter transition-colors group-hover:text-primary">{m.team_a?.name || 'TBD'}</span>
                                              </div>
                                              <span className="text-xl font-black italic text-foreground/20">0</span>
                                           </div>
                                           <div className="h-px bg-white/5" />
                                           <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                                                    {m.team_b?.logo_url ? <img src={m.team_b.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-5 h-5 opacity-20" />}
                                                 </div>
                                                 <span className="text-sm font-black uppercase italic text-foreground tracking-tighter transition-colors group-hover:text-primary">{m.team_b?.name || 'TBD'}</span>
                                              </div>
                                              <span className="text-xl font-black italic text-foreground/20">0</span>
                                           </div>
                                        </div>
                                        <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] font-black text-foreground uppercase tracking-[0.2em] italic">Click para ver detalle</span>
                                            <ChevronRight className="w-4 h-4 text-primary" />
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                 )}
              </motion.div>
           )}

           {activeTab === 'teams' && (
              <motion.div key="teams" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {teams.map((team) => (
                    <div key={team.id} className="p-8 glass-premium rounded-[3rem] border border-white/5 flex flex-col items-center gap-6 text-center group hover:bg-primary transition-all shadow-xl">
                        <div className="w-24 h-24 rounded-full bg-white/5 group-hover:bg-black/10 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-12 h-12 text-white/10 group-hover:text-black/20 transition-all" />}
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black italic uppercase text-2xl text-foreground tracking-tighter group-hover:text-black transition-colors">{team.name}</h4>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest group-hover:text-black/50 opacity-40 italic", team.status === 'approved' ? "text-primary" : "text-foreground")}>
                                {team.status === 'approved' ? 'REGISTRO CONFIRMADO' : 'PENDIENTE DE APROBACIÓN'}
                            </span>
                        </div>
                    </div>
                 ))}
              </motion.div>
           )}
        </AnimatePresence>
      </div>

      {/* ── DRAW ANIMATION ── */}
      <AnimatePresence>
         {isDrawing && (
            <div className="fixed inset-0 z-[200] bg-black/95 md: flex flex-col items-center justify-center p-10 overflow-hidden text-white">
               {/* Drawing UI */}
               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-20">
                  <div className="w-40 h-40 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '0.6s' }} />
                  <div className="absolute inset-0 flex items-center justify-center"><Trophy className="w-14 h-14 text-primary animate-pulse" /></div>
               </motion.div>

               <div className="space-y-6 text-center max-w-2xl px-10">
                  <h2 className="text-5xl lg:text-8xl font-black italic uppercase text-white tracking-tighter leading-none">SORTEO EN <span className="text-primary italic">CURSO</span></h2>
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-[1em] animate-pulse italic">Definiendo las llaves de la gloria...</p>
               </div>

               <div className="mt-20 w-full max-w-screen-xl overflow-hidden py-10 flex gap-6 px-10">
                  {drawnMatches.map((match, idx) => (
                     <motion.div key={match.id} initial={{ scale: 0.5, opacity: 0, x: 200 }} animate={{ scale: 1, opacity: 1, x: 0 }} className="flex-shrink-0 w-80 p-10 glass-premium rounded-[3.5rem] border border-white/20 bg-white/5 space-y-8 shadow-2xl">
                        <div className="flex flex-col items-center gap-6">
                           <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/5">
                              {match.teamA.logo_url ? <img src={match.teamA.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-10 h-10 text-white/10" />}
                           </div>
                           <span className="text-2xl font-black uppercase text-white italic tracking-tighter text-center">{match.teamA.name}</span>
                        </div>
                        <div className="flex items-center gap-6"><div className="h-px flex-1 bg-white/10" /><span className="text-[12px] font-black text-primary uppercase italic">VS</span><div className="h-px flex-1 bg-white/10" /></div>
                        <div className="flex flex-col items-center gap-6">
                           <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/5">
                              {match.teamB.logo_url ? <img src={match.teamB.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-10 h-10 text-white/10" />}
                           </div>
                           <span className="text-2xl font-black uppercase text-white italic tracking-tighter text-center">{match.teamB.name}</span>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>
         )}
      </AnimatePresence>

      {/* ── JOIN MODAL ── */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 md:">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md glass-premium rounded-[3rem] border border-white/10 p-10 space-y-8 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">UNIRSE</h3>
                    <button onClick={() => setShowJoinModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><X className="w-6 h-6 text-white/40" /></button>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Elegí tu equipo para inscribir</p>
                    {userTeams.length > 0 ? (
                        <div className="space-y-4">
                            {userTeams.map(team => {
                                const isRegistered = isTeamAlreadyRegistered(team.id);
                                return (
                                    <button 
                                        key={team.id}
                                        disabled={isRegistered || registering}
                                        onClick={() => handleRegisterTeam(team.id)}
                                        className={cn("w-full p-8 rounded-3xl border flex items-center justify-between transition-all group", isRegistered ? "bg-white/5 opacity-40 cursor-not-allowed" : "bg-white/[0.03] border-white/5 hover:border-primary hover:bg-primary hover:text-black")}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-black/10 flex items-center justify-center overflow-hidden">{team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-6 h-6 text-white" />}</div>
                                            <span className="font-black italic uppercase text-xl tracking-tighter text-white group-hover:text-black">{team.name}</span>
                                        </div>
                                        {isRegistered ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <PlusCircle className="w-6 h-6 text-white/20 group-hover:text-black" />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-16 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-6">
                            <span className="text-[11px] font-black text-white/20 uppercase tracking-widest block">No eres capitán</span>
                            <Link href="/teams/create"><button className="h-14 px-10 bg-white/5 text-white rounded-2xl text-[10px] font-black uppercase">CREAR EQUIPO</button></Link>
                        </div>
                    )}
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
