'use client';

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  DollarSign,
  Zap,
  Shield,
  LogOut,
  Trophy,
  X,
  Check,
  ChevronRight,
  ExternalLink,
  UserMinus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  useMatchById,
  useJoinMatch,
  useSwitchTeam,
  useDeleteMatch,
  useLeaveMatch,
  useInvitePlayer,
  useRespondToInvitation,
  useUpdateMatch,
  useMatchStats,
  useBulkUpdateParticipants
} from '@/hooks/useMatchQueries';
import {
  MatchParticipant,
} from '@/lib/matches';
import { cn } from '@/lib/utils';
import PlayerSlot from '@/components/PlayerSlot';
import PostMatchView from '@/components/PostMatchView';
import PostMatchModal from '@/components/PostMatchModal';
import { MatchSkeleton } from '@/components/Skeletons';
import dynamic from 'next/dynamic';
import ChatRoom from '@/components/ChatRoom';
import MercadoPagoButton from '@/components/payments/MercadoPagoButton';
import JoinQRModal from '@/components/JoinQRModal';

const VenueMap = dynamic(() => import('@/components/VenueMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-foreground/5 rounded-[2rem] animate-pulse flex items-center justify-center border border-foreground/10">
      <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
    </div>
  ),
});

const VenueMapOriginal = dynamic(() => import('@/components/VenueMap'), { ssr: false });

function formatDateLong(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const display = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${display}:${m} ${ampm}`;
}

// ── TEAM COLORS ───────────────────────────────────────────────────────────────
const TEAM_CONFIG = {
  A: {
    bg: 'bg-blue-600',
    border: 'border-blue-500/20',
    borderActive: 'border-blue-400',
    shadow: 'shadow-[0_20px_60px_rgba(37,99,235,0.15)]',
    glow: 'rgba(37,99,235,0.2)',
    text: 'text-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30',
    gradient: 'from-blue-600/20 via-blue-600/5 to-transparent',
    accent: '#2563eb'
  },
  B: {
    bg: 'bg-rose-600',
    border: 'border-rose-500/20',
    borderActive: 'border-rose-400',
    shadow: 'shadow-[0_20px_60px_rgba(225,29,72,0.15)]',
    glow: 'rgba(225,29,72,0.2)',
    text: 'text-rose-400',
    btn: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
    gradient: 'from-rose-600/20 via-rose-600/5 to-transparent',
    accent: '#e11d48'
  },
} as const;

function MatchLobbyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = searchParams.get('id');
  const queryClient = useQueryClient();

  // React Query Hooks
  const { data: match, isLoading, error } = useMatchById(id || undefined);
  const { data: matchStats } = useMatchStats(match?.id);

  const joinMutation = useJoinMatch();
  const switchMutation = useSwitchTeam();
  const leaveMutation = useLeaveMatch();
  const deleteMutation = useDeleteMatch();
  const bulkUpdateMutation = useBulkUpdateParticipants();

  const [isPostMatchModalOpen, setIsPostMatchModalOpen] = useState(false);
  const [venueInfo, setVenueInfo] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [managedParticipant, setManagedParticipant] = useState<MatchParticipant | null>(null);

  // Derived Data
  const participants: MatchParticipant[] = match?.participants || [];
  const teamA = participants.filter(p => p.team === 'A');
  const teamB = participants.filter(p => p.team === 'B');
  const unassigned = participants.filter(p => p.team === null);
  
  const formatNum = parseInt(match?.type?.replace('F', '') || '5');
  const teamSize = formatNum;
  
  const isCreator = user?.id === match?.creator_id;
  const isCompleted = match?.is_completed;
  const myEntry = participants.find((p) => p.user_id === user?.id);
  const hasJoined = !!myEntry;
  const isConfirmed = myEntry?.status === 'confirmed';
  const myTeam = myEntry?.team;
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isTacticalMode, setIsTacticalMode] = useState(false);
  
  // Team Name Editing State
  const updateMatchMutation = useUpdateMatch();
  const [teamAName, setTeamAName] = useState(match?.team_a_name || 'Local');
  const [teamBName, setTeamBName] = useState(match?.team_b_name || 'Visitante');
  const [isEditingNames, setIsEditingNames] = useState(false);

  // Update local state when match data changes
  useEffect(() => {
    if (match) {
      setTeamAName(match.team_a_name || 'Local');
      setTeamBName(match.team_b_name || 'Visitante');
    }
  }, [match?.team_a_name, match?.team_b_name]);

  const handleUpdateTeamNames = async () => {
    if (!match) return;
    try {
      await updateMatchMutation.mutateAsync({
        matchId: match.id,
        updates: {
          team_a_name: teamAName,
          team_b_name: teamBName
        }
      });
      setIsEditingNames(false);
    } catch (e) {
      console.error('Error updating team names:', e);
    }
  };

  // Sync venue info when match loads
  useEffect(() => {
    if (match) {
      const checkVenue = async () => {
        try {
          const { data: allBusinesses } = await supabase
            .from('canchas_businesses')
            .select('id, name, alias_cbu, mp_access_token, owner_id, google_maps_link')
            .eq('is_active', true);

          let matchedBiz = allBusinesses?.find((biz: any) => biz.id === match.business_id);

          if (allBusinesses && !matchedBiz && match.location) {
            const loc = match.location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            matchedBiz = allBusinesses.find((biz: any) => {
              const bizName = (biz.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
              return loc.includes(bizName) || bizName.includes(loc) || loc === bizName;
            });
          }

          if (matchedBiz) {
            setVenueInfo(matchedBiz);
          }
        } catch (e) {
          console.error('Error checking venue:', e);
        }
      };
      checkVenue();
    }
  }, [match]);

  // Handlers
  const handleJoinTeam = async (team: 'A' | 'B' | null) => {
    if (!match || !user) return;
    try {
      if (!hasJoined) {
        await joinMutation.mutateAsync({ matchId: match.id, userId: user.id, team });
      } else {
        await switchMutation.mutateAsync({ matchId: match.id, userId: user.id, team });
      }
    } catch (e) {
      console.error('Error joining team:', e);
    }
  };

  const handleLeave = async () => {
    if (!match || !user) return;
    if (window.confirm('\u00bfEst\u00e1s seguro que quer\u00e9s bajarte del partido?')) {
      try {
        await leaveMutation.mutateAsync({ matchId: match.id, userId: user.id });
      } catch (e) {
        console.error('Error leaving match:', e);
      }
    }
  };

  const handleDelete = async () => {
    if (!match) return;
    if (window.confirm('\u00bfEst\u00e1s seguro que quer\u00e9s suspender el partido? No se puede deshacer.')) {
      try {
        await deleteMutation.mutateAsync(match.id);
        router.push('/');
      } catch (e) {
        console.error('Error deleting match:', e);
      }
    }
  };

  const handleMovePlayer = async (userId: string, targetTeam: 'A' | 'B' | null) => {
    if (!match || !isCreator) return;
    try {
      await bulkUpdateMutation.mutateAsync({
        matchId: match.id,
        updates: [{ user_id: userId, team: targetTeam }]
      });
    } catch (e) {
      console.error('Error moving player:', e);
    }
  };

  const handleKickPlayer = async (userId: string) => {
    if (!match || !isCreator) return;
    if (userId === match.creator_id) return; // Can't kick yourself
    
    if (window.confirm('\u00bfEst\u00e1s seguro que quer\u00e9s echar a este jugador del partido?')) {
      try {
        await leaveMutation.mutateAsync({ matchId: match.id, userId });
      } catch (e) {
        console.error('Error kicking player:', e);
      }
    }
  };

  const handleRandomizeTeams = async () => {
    if (!match || !isCreator) return;
    const playersToAssign = participants.filter(p => p.status === 'confirmed').map(p => p.user_id);
    const shuffled = [...playersToAssign].sort(() => Math.random() - 0.5);
    const updates = shuffled.map((uid, idx) => ({
      user_id: uid,
      team: (idx < teamSize ? 'A' : idx < teamSize * 2 ? 'B' : null) as 'A' | 'B' | null
    }));
    try {
      await bulkUpdateMutation.mutateAsync({ matchId: match.id, updates });
    } catch (e) {
      console.error('Error randomizing teams:', e);
    }
  };

  const handleBenchAll = async () => {
    if (!match || !isCreator) return;
    const updates = participants.map(p => ({ user_id: p.user_id, team: null as 'A' | 'B' | null }));
    try {
      await bulkUpdateMutation.mutateAsync({ matchId: match.id, updates });
    } catch (e) {
      console.error('Error benching all:', e);
    }
  };

  if (isLoading) return <MatchSkeleton />;
  if (error || !match) return <div>Error loading match</div>;

  // ── VIEW: NON-PARTICIPANT ───────────────────────────────────────────────────
  if (!hasJoined && !isCompleted) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header Hero */}
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000"
              alt=""
              className="w-full h-full object-cover grayscale opacity-20 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
            <Link
              href="/"
              className="absolute top-8 left-6 w-12 h-12 rounded-2xl glass-premium flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-foreground/50 hover:text-primary"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  {match.type} \u2022 {match.is_private ? 'Privado' : 'P\u00fablico'}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                  {participants.length} / {teamSize * 2} Jugadores
                </span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-foreground leading-[0.8]">
                {venueInfo?.name || match.location}
              </h1>
              <div className="flex flex-wrap items-center gap-8 text-foreground/60 font-black italic uppercase text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  {formatDateLong(match.date)}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  {formatTime(match.time)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
               {/* Call to Action Card */}
               <div className="p-12 rounded-[3.5rem] glass-premium border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <Zap className="w-64 h-64 text-primary" />
                  </div>
                  <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                       <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                         \u00bfEst\u00e1s listo para jugar?
                       </h2>
                       <p className="text-foreground/40 font-bold max-w-lg">
                         Unite al partido para reservar tu lugar. El organizador te asignar\u00e1 a un equipo una vez que est\u00e9s dentro.
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-3xl bg-foreground/5 space-y-1">
                          <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Precio por persona</span>
                          <div className="text-2xl font-black italic text-emerald-400">${match.price}</div>
                       </div>
                       <div className="p-6 rounded-3xl bg-foreground/5 space-y-1">
                          <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Nivel de juego</span>
                          <div className="text-2xl font-black italic text-blue-400">{match.min_rank || 'Abierto'}</div>
                       </div>
                    </div>

                    <button
                      onClick={() => handleJoinTeam(null)}
                      disabled={joinMutation.isPending}
                      className="w-full h-20 rounded-[2rem] bg-primary text-black font-black italic uppercase text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4"
                    >
                      {joinMutation.isPending ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                        <><Zap className="w-6 h-6 fill-current" /> Unirme al partido</>
                      )}
                    </button>
                  </div>
               </div>

               {/* Map/Location */}
               <div className="rounded-[3.5rem] glass-premium border-white/5 overflow-hidden">
                 <div className="h-[400px]">
                    <VenueMap location={match.location} />
                 </div>
                 <div className="p-12 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">{match.location}</h3>
                      <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-1">Direcci\u00f3n del encuentro</p>
                    </div>
                    {venueInfo?.google_maps_link && (
                      <a href={venueInfo.google_maps_link} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-[1.5rem] glass-premium flex items-center justify-center hover:text-primary transition-all hover:scale-110">
                        <ExternalLink className="w-8 h-8" />
                      </a>
                    )}
                 </div>
               </div>
            </div>

            <div className="lg:col-span-4">
               <div className="p-8 rounded-[2.5rem] glass-premium border-white/5 space-y-8 sticky top-8">
                  <h4 className="text-xs font-black italic uppercase text-foreground/20 tracking-widest">Detalles Rápidos</h4>
                  <div className="space-y-6">
                    {[
                      { icon: Users, label: 'Cupos Disponibles', value: `${(teamSize * 2) - participants.length} Lugares`, color: 'text-primary' },
                      { icon: Shield, label: 'Tipo de Partido', value: match.type || 'F5', color: 'text-blue-400' },
                      { icon: DollarSign, label: 'Pago', value: match.payment_method === 'mercado_pago' ? 'Digital' : 'En cancha', color: 'text-emerald-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center", item.color)}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{item.label}</div>
                          <div className="font-black italic uppercase text-foreground">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: LOBBY (JOINED) ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── HEADER ── */}
      <div className="relative h-[40vh] min-h-[350px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000"
            alt=""
            className="w-full h-full object-cover grayscale opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <Link
            href="/"
            className="absolute top-8 left-6 w-12 h-12 rounded-2xl glass-premium flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-foreground/50 hover:text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  {match.type} \u2022 {match.is_private ? 'Privado' : 'P\u00fablico'}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Trophy className="w-3 h-3" /> Finalizado
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground leading-[0.9]">
                {venueInfo?.name || match.location}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-foreground/40 font-black italic uppercase text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDateLong(match.date)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {formatTime(match.time)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {!isCompleted && (
                 <button
                   onClick={() => setIsQRModalOpen(true)}
                   className="h-14 px-8 rounded-2xl glass-premium border-white/5 font-black italic uppercase text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                 >
                   <Users className="w-5 h-5 text-primary" /> Invitar
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT: PITCH & TEAMS ── */}
          <div className="lg:col-span-8 space-y-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Cupos', value: `${participants.length}/${teamSize * 2}`, color: 'text-primary' },
                { icon: Shield, label: 'Formato', value: match.type || 'F5', color: 'text-blue-400' },
                { icon: DollarSign, label: 'Costo', value: match.price > 0 ? `$${match.price}` : 'Gratis', color: 'text-emerald-400' },
                { icon: Zap, label: 'Estado', value: isCompleted ? 'Finalizado' : 'En Lobby', color: 'text-amber-400' },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-[2rem] glass-premium border-white/5 space-y-1">
                  <div className="flex items-center gap-2">
                    <stat.icon className={cn('w-4 h-4', stat.color)} />
                    <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">{stat.label}</span>
                  </div>
                  <div className="text-xl font-black italic font-kanit uppercase tracking-tighter text-foreground">{stat.value}</div>
                </div>
              ))}
            </div>

            {!isCompleted ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="flex flex-col">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-foreground">Equipos</h2>
                    {isCreator && (
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Modo Organizador Activo</span>
                    )}
                   </div>
                   {isCreator && (
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIsTacticalMode(true)} 
                          className="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                          <Users className="w-3 h-3" /> Ordenar Equipos
                        </button>
                        <button 
                          onClick={handleRandomizeTeams} 
                          className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-foreground/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-foreground transition-all"
                        >
                          <Zap className="w-3 h-3" /> Mezclar
                        </button>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(['A', 'B'] as const).map((team) => {
                    const members = team === 'A' ? teamA : teamB;
                    const cfg = TEAM_CONFIG[team];
                    const isMine = myTeam === team;
                    const teamFull = members.length >= teamSize;
                    const canJoin = !hasJoined && !teamFull;
                    const canSwitch = hasJoined && isConfirmed && myTeam !== team && !teamFull;

                    return (
                      <div key={team} className={cn(
                        "relative rounded-[2.5rem] border-2 p-8 transition-all duration-500 overflow-hidden",
                        isMine ? `${cfg.borderActive} ${cfg.shadow} bg-surface/30` : `${cfg.border} bg-foreground/[0.01]`
                      )}>
                         <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-4">
                             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic text-white shadow-lg", cfg.bg)}>
                               {team}
                             </div>
                             <div>
                               <div className="flex items-center gap-2">
                                  {isCreator && isEditingNames ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={team === 'A' ? teamAName : teamBName}
                                        onChange={(e) => team === 'A' ? setTeamAName(e.target.value) : setTeamBName(e.target.value)}
                                        className="bg-foreground/5 border border-white/10 rounded-lg px-2 py-1 text-sm font-black italic uppercase text-foreground focus:outline-none focus:border-primary w-32"
                                        autoFocus
                                      />
                                      <button onClick={handleUpdateTeamNames} className="text-primary hover:scale-110 transition-transform">
                                        <Check className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 group/title">
                                      <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">
                                        {team === 'A' ? match.team_a_name || 'Local' : match.team_b_name || 'Visitante'}
                                      </h3>
                                      {isCreator && (
                                        <button 
                                          onClick={() => setIsEditingNames(true)} 
                                          className="opacity-0 group-hover/title:opacity-100 transition-opacity text-foreground/20 hover:text-primary"
                                        >
                                          <Zap className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                               </div>
                               <span className={cn("text-[9px] font-black uppercase tracking-widest mt-1 block", cfg.text)}>
                                 {members.length}/{teamSize} JUGADORES
                               </span>
                             </div>
                           </div>
                           {isMine && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"><Check className="w-4 h-4 text-black" /></div>}
                         </div>

                         {/* Quick Swap Area for Creator */}
                         {isCreator && (
                           <div className="mb-6 p-4 rounded-3xl bg-foreground/5 border border-white/5 flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-foreground/20 italic">Arrastrar aqu\u00ed</span>
                              <div className="flex items-center gap-2">
                                 <span className="text-[9px] font-black uppercase text-foreground/40">Goles</span>
                                 <span className="px-2 py-1 rounded-lg bg-foreground/10 text-foreground font-black italic text-xs">
                                   {team === 'A' ? match.team_a_score || 0 : match.team_b_score || 0}
                                 </span>
                              </div>
                           </div>
                         )}

                         {!isCreator && (
                           <button
                             onClick={() => (canJoin || canSwitch) && handleJoinTeam(team)}
                             disabled={joinMutation.isPending || switchMutation.isPending || (teamFull && !isMine)}
                             className={cn(
                               "w-full h-14 rounded-2xl font-black italic uppercase text-xs flex items-center justify-center gap-3 transition-all mb-8 shadow-xl",
                               isMine ? "bg-foreground/5 text-foreground/40 cursor-default" : 
                               teamFull ? "bg-foreground/[0.02] text-foreground/10 cursor-not-allowed" : 
                               `${cfg.btn} text-white shadow-lg`
                             )}
                           >
                             {joinMutation.isPending || switchMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                               isMine ? "Est\u00e1s en el equipo" : 
                               teamFull ? "Equipo Lleno" : 
                               <><Zap className="w-4 h-4 fill-current" /> Entrar a jugar</>}
                           </button>
                         )}

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                          {Array.from({ length: teamSize }).map((_, idx) => {
                            const p = members[idx];
                            return (
                              <div
                                key={idx}
                                className="relative group/slot cursor-pointer"
                                onClick={() => isCreator && p && setManagedParticipant(p)}
                              >
                                <PlayerSlot participant={p} isSelf={p?.user_id === user?.id} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bench Section */}
                {unassigned.length > 0 && (
                  <div className="p-8 rounded-[2.5rem] glass-premium border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black italic uppercase text-foreground/40">Banquillo de Espera</h4>
                      <span className="text-[10px] font-bold text-foreground/20">{unassigned.length} JUGADORES</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {unassigned.map((p) => (
                        <div
                          key={p.id}
                          className="relative group/slot cursor-pointer"
                          onClick={() => isCreator && setManagedParticipant(p)}
                        >
                          <PlayerSlot participant={p} isSelf={p.user_id === user?.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <PostMatchView 
                match={match} 
                participants={participants}
                stats={(matchStats as any) || { goalScorers: [], mvp: null }}
              />
            )}
          </div>

          {/* ── RIGHT: SIDEBAR ── */}
          <div className="lg:col-span-4 space-y-8">
             {/* Payment Card if needed */}
             {isConfirmed && match.price > 0 && !isCompleted && !myEntry?.paid && (
               <div className="p-8 rounded-[2.5rem] bg-[#009EE3]/5 border border-[#009EE3]/20 space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#009EE3] flex items-center justify-center shadow-lg shadow-[#009EE3]/20">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">Pago del Partido</h4>
                      <p className="text-[10px] font-black text-[#009EE3] uppercase tracking-widest mt-1">Mercado Pago</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-2xl bg-foreground/5 space-y-1">
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Monto a pagar</span>
                    <div className="text-3xl font-black italic font-kanit text-foreground">${match.price}</div>
                 </div>
                 <MercadoPagoButton 
                   matchId={match.id} 
                   title={`Partido en ${match.location}`}
                   price={match.price} 
                 />
               </div>
             )}

             {/* Location / Venue */}
             <div className="rounded-[2.5rem] glass-premium border-white/5 overflow-hidden">
               <div className="h-64 relative">
                 <VenueMap
                   location={match.location}
                 />
               </div>
               <div className="p-8 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h4 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">{match.location}</h4>
                      <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mt-1">Sede del encuentro</span>
                    </div>
                    {venueInfo?.google_maps_link && (
                      <a href={venueInfo.google_maps_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-2xl glass-premium flex items-center justify-center hover:text-primary transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                 </div>
               </div>
             </div>

             {/* Chat */}
             {hasJoined && !isCompleted && (
               <div className="h-[500px] rounded-[2.5rem] glass-premium border-white/5 overflow-hidden">
                 <ChatRoom matchId={match.id} title="Chat del Lobby" />
               </div>
             )}

             {/* Danger Zone */}
             <div className="space-y-3">
               {hasJoined && !isCompleted && (
                 <button onClick={handleLeave} className="w-full h-14 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-black italic uppercase text-[10px] tracking-widest">
                   Bajarme del partido
                 </button>
               )}
               {isCreator && !isCompleted && (
                 <button onClick={handleDelete} className="w-full h-14 rounded-2xl bg-rose-600/10 border border-rose-600/20 text-rose-600 hover:bg-rose-600 hover:text-white transition-all font-black italic uppercase text-[10px] tracking-widest">
                   Suspender partido
                 </button>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isQRModalOpen && (
        <JoinQRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          matchId={match.id}
          venueName={match.location}
        />
      )}

      {isPostMatchModalOpen && user && (
        <PostMatchModal
          matchId={match.id}
          match={match}
          participants={participants}
          currentUserId={user.id}
          onClose={() => setIsPostMatchModalOpen(false)}
          onSuccess={() => {
            setIsPostMatchModalOpen(false);
            queryClient.invalidateQueries({ queryKey: queryKeys.matches.byId(match.id) });
          }}
        />
      )}

      {/* Managed Participant Modal/Menu */}
      <AnimatePresence>
        {managedParticipant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setManagedParticipant(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-[3rem] glass-premium border-white/10 p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <PlayerSlot participant={managedParticipant} />
                
                <div className="w-full space-y-3">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                    Gestionar Jugador
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {managedParticipant.team !== 'A' && (
                      <button
                        onClick={() => {
                          handleMovePlayer(managedParticipant.user_id, 'A');
                          setManagedParticipant(null);
                        }}
                        className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black italic uppercase text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                      >
                        <Zap className="w-4 h-4" /> Mover al Equipo A
                      </button>
                    )}
                    {managedParticipant.team !== 'B' && (
                      <button
                        onClick={() => {
                          handleMovePlayer(managedParticipant.user_id, 'B');
                          setManagedParticipant(null);
                        }}
                        className="w-full h-14 rounded-2xl bg-rose-600 text-white font-black italic uppercase text-xs hover:bg-rose-500 transition-all flex items-center justify-center gap-3"
                      >
                        <Zap className="w-4 h-4" /> Mover al Equipo B
                      </button>
                    )}
                    {managedParticipant.team !== null && (
                      <button
                        onClick={() => {
                          handleMovePlayer(managedParticipant.user_id, null);
                          setManagedParticipant(null);
                        }}
                        className="w-full h-14 rounded-2xl bg-zinc-800 text-foreground/70 font-black italic uppercase text-xs hover:bg-zinc-700 transition-all flex items-center justify-center gap-3"
                      >
                        <LogOut className="w-4 h-4 rotate-180" /> Mover al Banquillo
                      </button>
                    )}
                    
                    {managedParticipant.user_id !== match.creator_id && (
                      <button
                        onClick={() => {
                          handleKickPlayer(managedParticipant.user_id);
                          setManagedParticipant(null);
                        }}
                        className="w-full h-14 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-500 font-black italic uppercase text-xs hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 mt-4"
                      >
                        <UserMinus className="w-4 h-4" /> Echar del Partido
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setManagedParticipant(null)}
                  className="p-2 text-foreground/20 hover:text-foreground transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Tactical Mode Modal (The Redesign) */}
      <AnimatePresence>
        {isTacticalMode && (
          <div className="fixed inset-0 z-[110] flex flex-col bg-background/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* Tactical Header */}
              <div className="p-8 flex items-center justify-between border-b border-white/5 bg-background/50">
                <div className="flex items-center gap-6">
                  <button onClick={() => setIsTacticalMode(false)} className="w-14 h-14 rounded-2xl glass-premium flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                    <ArrowLeft className="w-7 h-7" />
                  </button>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">Armar Equipos</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Acomod\u00e1 a los jugadores en la cancha</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 mr-6 border-r border-white/10 pr-6">
                    <button 
                      onClick={handleRandomizeTeams} 
                      className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-foreground/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-foreground transition-all"
                    >
                      <Zap className="w-4 h-4" /> Mezclar Aleatorio
                    </button>
                    <button 
                      onClick={handleBenchAll} 
                      className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-rose-600/10 border border-rose-600/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                    >
                      <LogOut className="w-4 h-4 rotate-180" /> Vaciar Cancha
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsTacticalMode(false)}
                    className="px-8 h-14 rounded-2xl bg-primary text-black font-black italic uppercase text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    Confirmar Armado
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                {/* Mobile Actions */}
                <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                  <button 
                    onClick={handleRandomizeTeams} 
                    className="flex-none flex items-center gap-2 px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-foreground/60 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Zap className="w-3 h-3" /> Mezclar
                  </button>
                  <button 
                    onClick={handleBenchAll} 
                    className="flex-none flex items-center gap-2 px-6 h-12 rounded-2xl bg-rose-600/10 border border-rose-600/20 text-rose-500 text-[10px] font-black uppercase tracking-widest"
                  >
                    <LogOut className="w-3 h-3 rotate-180" /> Vaciar
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto w-full">
                  {(['A', 'B'] as const).map((team) => {
                    const cfg = TEAM_CONFIG[team];
                    const members = team === 'A' ? teamA : teamB;
                    return (
                      <div key={team} className="space-y-8">
                        <div className="flex items-center justify-between px-4">
                           <div className="flex items-center gap-4">
                              <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black italic text-2xl text-white shadow-xl", cfg.bg)}>{team}</div>
                              <div>
                                <input
                                  type="text"
                                  value={team === 'A' ? teamAName : teamBName}
                                  onChange={(e) => team === 'A' ? setTeamAName(e.target.value) : setTeamBName(e.target.value)}
                                  onBlur={handleUpdateTeamNames}
                                  className="bg-transparent border-none p-0 text-2xl font-black italic uppercase tracking-tighter text-foreground focus:outline-none focus:ring-0 w-full"
                                />
                                <div className={cn("text-[9px] font-black uppercase tracking-widest", cfg.text)}>Equipo {team === 'A' ? 'Local' : 'Visitante'}</div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-2xl font-black italic text-foreground/20 leading-none">{members.length}</span>
                              <span className="text-[8px] font-bold text-foreground/10 uppercase tracking-widest">/ {teamSize}</span>
                           </div>
                        </div>

                        {/* Pitch Representation */}
                        <div className={cn(
                          "relative aspect-[4/3] rounded-[3.5rem] bg-foreground/[0.02] border-2 border-dashed border-white/5 flex items-center justify-center p-12 overflow-hidden",
                          "before:absolute before:inset-0 before:bg-gradient-to-br", cfg.gradient
                        )}>
                           <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 relative z-10 w-full">
                              {Array.from({ length: teamSize }).map((_, idx) => {
                                const p = members[idx];
                                return (
                                  <div key={idx} className="flex flex-col items-center gap-2">
                                    {p ? (
                                      <motion.div 
                                        layoutId={p.user_id} 
                                        className="cursor-pointer group/player relative" 
                                        onClick={() => setManagedParticipant(p)}
                                      >
                                        <PlayerSlot participant={p} size="lg" />
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-white/10 flex items-center justify-center opacity-0 group-hover/player:opacity-100 transition-all scale-75 group-hover/player:scale-100">
                                          <Zap className="w-3 h-3 text-primary" />
                                        </div>
                                      </motion.div>
                                    ) : (
                                      <div className="w-16 h-16 rounded-[2rem] border-2 border-dashed border-white/5 flex items-center justify-center bg-white/[0.02]">
                                        <div className="w-2 h-2 rounded-full bg-white/5" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bench Section */}
                <div className="max-w-7xl mx-auto w-full space-y-8 pb-24">
                   <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40">
                          <Users className="w-5 h-5" />
                        </div>
                        <h4 className="text-xl font-black italic uppercase text-foreground/30 tracking-widest">Lista de Espera</h4>
                      </div>
                      <span className="text-xs font-bold text-foreground/10 uppercase tracking-widest">{unassigned.length} JUGADORES SIN EQUIPO</span>
                   </div>

                   <div className="p-12 rounded-[4rem] glass-premium border-white/5 flex flex-wrap justify-center gap-8 min-h-[200px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-20" />
                      {unassigned.length > 0 ? unassigned.map(p => (
                        <motion.div 
                          key={p.user_id} 
                          layoutId={p.user_id} 
                          className="cursor-pointer group/bench relative" 
                          onClick={() => setManagedParticipant(p)}
                        >
                          <PlayerSlot participant={p} size="lg" />
                          <div className="absolute -top-3 -right-3 px-2 py-1 rounded-lg bg-primary text-black text-[8px] font-black uppercase tracking-widest opacity-0 group-hover/bench:opacity-100 transition-all translate-y-2 group-hover/bench:translate-y-0">
                            Asignar
                          </div>
                        </motion.div>
                      )) : (
                        <div className="w-full py-12 flex flex-col items-center justify-center text-foreground/5 space-y-4 relative z-10">
                           <Users className="w-16 h-16 opacity-20" />
                           <div className="text-center">
                             <p className="text-sm font-black uppercase tracking-[0.3em] italic mb-1">Cancha Llena</p>
                             <p className="text-[10px] font-bold text-foreground/20">Todos los jugadores confirmados tienen equipo</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={<MatchSkeleton />}>
      <MatchLobbyContent />
    </Suspense>
  );
}