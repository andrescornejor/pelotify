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
    bg: 'bg-indigo-600',
    border: 'border-indigo-500/20',
    borderActive: 'border-indigo-400',
    shadow: 'shadow-[0_20px_60px_rgba(79,70,229,0.15)]',
    glow: 'rgba(79,70,229,0.2)',
    text: 'text-indigo-400',
    btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
    gradient: 'from-indigo-600/20 via-indigo-600/5 to-transparent',
    accent: '#4f46e5'
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
  
  // Tactical Selection State
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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
    if (window.confirm('¿Estás seguro que querés bajarte del partido?')) {
      try {
        await leaveMutation.mutateAsync({ matchId: match.id, userId: user.id });
      } catch (e) {
        console.error('Error leaving match:', e);
      }
    }
  };

  const handleDelete = async () => {
    if (!match) return;
    if (window.confirm('¿Estás seguro que querés suspender el partido? No se puede deshacer.')) {
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
    
    if (window.confirm('¿Estás seguro que querés echar a este jugador del partido?')) {
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

  const handleTacticalMove = async (userId: string, team: 'A' | 'B' | null) => {
    if (!match || !isCreator) return;
    try {
      await bulkUpdateMutation.mutateAsync({
        matchId: match.id,
        updates: [{ user_id: userId, team }]
      });
      setSelectedPlayerId(null);
    } catch (e) {
      console.error('Error moving player in tactical mode:', e);
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

          <div className="relative z-10 max-w-[1700px] mx-auto px-4 h-full flex flex-col justify-end pb-16">
            <Link
              href="/"
              className="absolute top-8 left-4 w-12 h-12 rounded-2xl glass-premium flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-foreground/50 hover:text-primary"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  {match.type} • {match.is_private ? 'Privado' : 'Público'}
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

        <div className="max-w-[1700px] mx-auto px-4 -mt-12 relative z-20">
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
                         ¿Estás listo para jugar?
                       </h2>
                       <p className="text-foreground/40 font-bold max-w-lg">
                         Unite al partido para reservar tu lugar. El organizador te asignará a un equipo una vez que estés dentro.
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
                      <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-1">Dirección del encuentro</p>
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

        <div className="relative z-10 max-w-[1700px] mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Link
            href="/"
            className="absolute top-8 left-4 w-12 h-12 rounded-2xl glass-premium flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-foreground/50 hover:text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  {match.type} • {match.is_private ? 'Privado' : 'Público'}
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

      <div className="max-w-[1700px] mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT: PITCH & TEAMS ── */}
          <div className="lg:col-span-8 space-y-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Cupos', value: `${participants.length}/${teamSize * 2}`, color: 'text-primary' },
                { icon: Shield, label: 'Formato', value: match.type || 'F5', color: 'text-indigo-400' },
                { icon: DollarSign, label: 'Costo', value: match.price > 0 ? `$${match.price}` : 'Gratis', color: 'text-emerald-400' },
                { icon: Zap, label: 'Estado', value: isCompleted ? 'Finalizado' : 'En Lobby', color: 'text-amber-400' },
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className="p-6 rounded-[2rem] glass-premium border-white/5 space-y-1 transition-all group/stat"
                >
                  <div className="flex items-center gap-2">
                    <stat.icon className={cn('w-4 h-4 transition-transform group-hover/stat:rotate-12', stat.color)} />
                    <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">{stat.label}</span>
                  </div>
                  <div className="text-xl font-black italic font-kanit uppercase tracking-tighter text-foreground group-hover/stat:text-primary transition-colors">{stat.value}</div>
                </motion.div>
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

                {/* Bench Section (Waiting List) Above Teams */}
                {unassigned.length > 0 && (
                  <div className="p-8 rounded-[2.5rem] glass-premium border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h4 className="text-xs font-black italic uppercase text-foreground/40">Lista de Espera</h4>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Esperando asignación de equipo</span>
                      </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(['A', 'B'] as const).map((team) => {
                    const members = team === 'A' ? teamA : teamB;
                    const cfg = TEAM_CONFIG[team];
                    const isMine = myTeam === team;

                    return (
                      <motion.div 
                        key={team} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * (team === 'A' ? 1 : 2) }}
                        className={cn(
                          "relative rounded-[2.5rem] border-2 p-8 transition-all duration-500 overflow-hidden group/team-card",
                          isMine ? `${cfg.borderActive} ${cfg.shadow} bg-surface/40` : `${cfg.border} bg-foreground/[0.01] hover:bg-foreground/[0.02]`
                        )}
                      >
                         {/* Dynamic Background Glow */}
                         <div className={cn(
                           "absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full opacity-20 pointer-events-none transition-opacity duration-700 group-hover/team-card:opacity-40",
                           team === 'A' ? "bg-indigo-600" : "bg-rose-600"
                         )} />
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

      {/* Tactical Mode Modal (The Unified Pitch) */}
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
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-background/50 relative z-20">
                <div className="flex items-center gap-6">
                  <button onClick={() => { setIsTacticalMode(false); setSelectedPlayerId(null); }} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl glass-premium flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                    <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
                  </button>
                  <div className="space-y-0.5 md:space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">Armar Equipos</h2>
                    <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest italic">Toca un jugador y luego una posición</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleRandomizeTeams} 
                    className="hidden sm:flex items-center gap-2 px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-foreground/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-foreground transition-all"
                  >
                    <Zap className="w-4 h-4" /> Mezclar
                  </button>
                  <button 
                    onClick={() => { setIsTacticalMode(false); setSelectedPlayerId(null); }}
                    className="px-6 md:px-8 h-12 md:h-14 rounded-2xl bg-primary text-black font-black italic uppercase text-xs md:text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    Listo
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative">
                {/* Unified Pitch Layout */}
                <div className="max-w-7xl mx-auto w-full aspect-[3/4] md:aspect-[16/10] bg-[#1a2e1a] rounded-[3rem] md:rounded-[4rem] border-4 border-white/10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row">
                   {/* Pitch Patterns & Lines */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10%,rgba(255,255,255,0.05)_10%,rgba(255,255,255,0.05)_20%)]" />
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 -translate-y-1/2 md:hidden" />
                      <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/20 -translate-x-1/2 hidden md:block" />
                      <div className="absolute top-1/2 left-1/2 w-32 h-32 md:w-48 md:h-48 border-4 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 md:w-64 md:h-32 border-4 border-white/20 border-t-0 rounded-b-3xl" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 md:w-64 md:h-32 border-4 border-white/20 border-b-0 rounded-t-3xl" />
                   </div>

                   {/* TEAM A HALF */}
                   <div className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12">
                      <div className="absolute top-6 left-6 flex items-center gap-3">
                         <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black italic text-xl md:text-2xl text-white shadow-xl", TEAM_CONFIG.A.bg)}>A</div>
                         <input
                           type="text"
                           value={teamAName}
                           onChange={(e) => setTeamAName(e.target.value)}
                           onBlur={handleUpdateTeamNames}
                           className="bg-transparent border-none p-0 text-xl md:text-2xl font-black italic uppercase tracking-tighter text-foreground/50 focus:text-foreground focus:outline-none focus:ring-0 w-32 md:w-48 transition-colors"
                         />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full mt-12 md:mt-0">
                         {Array.from({ length: teamSize }).map((_, idx) => {
                           const p = teamA[idx];
                           const isSelected = selectedPlayerId === p?.user_id;
                           return (
                             <div 
                               key={idx} 
                               className="flex flex-col items-center justify-center h-24 md:h-32"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if (p) {
                                   setSelectedPlayerId(isSelected ? null : p.user_id);
                                 } else if (selectedPlayerId) {
                                   handleTacticalMove(selectedPlayerId, 'A');
                                 }
                               }}
                             >
                               {p ? (
                                 <motion.div 
                                   layoutId={p.user_id} 
                                   className={cn(
                                     "cursor-pointer transition-transform relative group",
                                     isSelected ? "scale-110" : "hover:scale-105"
                                   )}
                                 >
                                   <PlayerSlot participant={p} size={isSelected ? "lg" : "md"} />
                                   {isSelected && (
                                     <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full -z-10 animate-pulse" />
                                   )}
                                   <div className={cn(
                                      "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border border-white/10 transition-all",
                                      isSelected ? "bg-primary text-black opacity-100 scale-100" : "bg-background/80 text-primary opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                                   )}>
                                      <Check className="w-3 h-3" />
                                   </div>
                                 </motion.div>
                               ) : (
                                 <div className={cn(
                                   "w-16 h-16 md:w-20 md:h-20 rounded-[2rem] border-2 border-dashed flex items-center justify-center transition-all",
                                   selectedPlayerId ? "border-primary/40 bg-primary/5 scale-105" : "border-white/5 bg-white/[0.02]"
                                 )}>
                                   <div className={cn("w-2 h-2 rounded-full", selectedPlayerId ? "bg-primary animate-ping" : "bg-white/5")} />
                                 </div>
                               )}
                             </div>
                           );
                         })}
                      </div>
                   </div>

                   {/* TEAM B HALF */}
                   <div className="flex-1 relative border-t md:border-t-0 md:border-l border-white/10 flex flex-col items-center justify-center p-6 md:p-12">
                      <div className="absolute top-6 left-6 md:top-auto md:bottom-6 md:left-auto md:right-6 flex items-center md:flex-row-reverse gap-3">
                         <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black italic text-xl md:text-2xl text-white shadow-xl", TEAM_CONFIG.B.bg)}>B</div>
                         <input
                           type="text"
                           value={teamBName}
                           onChange={(e) => setTeamBName(e.target.value)}
                           onBlur={handleUpdateTeamNames}
                           className="bg-transparent border-none p-0 text-xl md:text-2xl font-black italic uppercase tracking-tighter text-foreground/50 focus:text-foreground focus:outline-none focus:ring-0 w-32 md:w-48 text-left md:text-right transition-colors"
                         />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full mt-12 md:mt-0">
                         {Array.from({ length: teamSize }).map((_, idx) => {
                           const p = teamB[idx];
                           const isSelected = selectedPlayerId === p?.user_id;
                           return (
                             <div 
                               key={idx} 
                               className="flex flex-col items-center justify-center h-24 md:h-32"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if (p) {
                                   setSelectedPlayerId(isSelected ? null : p.user_id);
                                 } else if (selectedPlayerId) {
                                   handleTacticalMove(selectedPlayerId, 'B');
                                 }
                               }}
                             >
                               {p ? (
                                 <motion.div 
                                   layoutId={p.user_id} 
                                   className={cn(
                                     "cursor-pointer transition-transform relative group",
                                     isSelected ? "scale-110" : "hover:scale-105"
                                   )}
                                 >
                                   <PlayerSlot participant={p} size={isSelected ? "lg" : "md"} />
                                   {isSelected && (
                                     <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full -z-10 animate-pulse" />
                                   )}
                                   <div className={cn(
                                      "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border border-white/10 transition-all",
                                      isSelected ? "bg-primary text-black opacity-100 scale-100" : "bg-background/80 text-primary opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                                   )}>
                                      <Check className="w-3 h-3" />
                                   </div>
                                 </motion.div>
                               ) : (
                                 <div className={cn(
                                   "w-16 h-16 md:w-20 md:h-20 rounded-[2rem] border-2 border-dashed flex items-center justify-center transition-all",
                                   selectedPlayerId ? "border-primary/40 bg-primary/5 scale-105" : "border-white/5 bg-white/[0.02]"
                                 )}>
                                   <div className={cn("w-2 h-2 rounded-full", selectedPlayerId ? "bg-primary animate-ping" : "bg-white/5")} />
                                 </div>
                               )}
                             </div>
                           );
                         })}
                      </div>
                   </div>
                </div>

                {/* Bench Section at the Bottom */}
                <div className="max-w-7xl mx-auto w-full space-y-6 pb-24">
                   <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40">
                          <Users className="w-5 h-5" />
                        </div>
                        <h4 className="text-xl font-black italic uppercase text-foreground/30 tracking-widest leading-none">Lista de Espera</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-foreground/10 uppercase tracking-widest">{unassigned.length} JUGADORES</span>
                        <button 
                          onClick={handleBenchAll} 
                          className="px-4 py-2 rounded-xl bg-rose-600/10 border border-rose-600/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                        >
                          Vaciar Todos
                        </button>
                      </div>
                   </div>

                   <div 
                      className="p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] glass-premium border-white/5 flex flex-wrap justify-center gap-6 min-h-[160px] relative overflow-hidden"
                      onClick={() => selectedPlayerId && handleTacticalMove(selectedPlayerId, null)}
                   >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-20 pointer-events-none" />
                      {unassigned.length > 0 ? unassigned.map(p => {
                        const isSelected = selectedPlayerId === p.user_id;
                        return (
                          <motion.div 
                            key={p.user_id} 
                            layoutId={p.user_id} 
                            className={cn(
                              "cursor-pointer transition-transform relative group",
                              isSelected ? "scale-110" : "hover:scale-105"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlayerId(isSelected ? null : p.user_id);
                            }}
                          >
                            <PlayerSlot participant={p} size={isSelected ? "lg" : "md"} />
                            {isSelected && (
                              <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full -z-10 animate-pulse" />
                            )}
                            <div className={cn(
                               "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border border-white/10 transition-all shadow-xl",
                               isSelected ? "bg-primary text-black opacity-100 scale-100" : "bg-background/80 text-primary opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                            )}>
                               <Check className="w-3 h-3" />
                            </div>
                          </motion.div>
                        );
                      }) : (
                        <div className="w-full py-8 flex flex-col items-center justify-center text-foreground/5 space-y-4 relative z-10 pointer-events-none">
                           <Users className="w-12 h-12 opacity-10" />
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] italic opacity-40">Todos los jugadores están en cancha</p>
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