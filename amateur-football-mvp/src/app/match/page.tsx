'use client';

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  DollarSign,
  Zap,
  Shield,
  LogOut,
  Trash2,
  Trophy,
  X,
  UserPlus,
  Star,
  Check,
  Edit2,
  Save,
  Lock,
  Globe,
  ChevronRight,
  MessageSquare,
  PlusCircle,
  ExternalLink,
  QrCode,
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
import { useFriends } from '@/hooks/useFriendQueries';
import { findVenueByLocation } from '@/lib/venues';
import { cn } from '@/lib/utils';
import PlayerSlot from '@/components/PlayerSlot';
import PostMatchView from '@/components/PostMatchView';
import PostMatchModal from '@/components/PostMatchModal';
import { MatchSkeleton } from '@/components/Skeletons';
import dynamic from 'next/dynamic';
import ChatRoom from '@/components/ChatRoom';
import { MatchPromotionShare } from '@/components/MatchPromotionShare';
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

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-');
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];
  return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
}

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

// ── PREMIUM PITCH SVG ──────────────────────────────────────────────────────────
function MiniPitch({ type }: { type: string }) {
  const isF5 = type === 'F5';
  const isF11 = type === 'F11';
  return (
    <svg
      viewBox="0 0 120 80"
      className="w-full h-full drop-shadow-2xl"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="pitchGlow" cx="60" cy="40" r="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(44,252,125,0.08)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="rgba(255,255,255,0.2)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>
      
      <rect x="0" y="0" width="120" height="80" rx="6" fill="rgba(255,255,255,0.01)" />
      <rect x="0" y="0" width="120" height="80" fill="url(#pitchGlow)" />
      
      <rect x="4" y="4" width="112" height="72" rx="2" stroke="url(#lineGrad)" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="60" y1="4" x2="60" y2="76" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <circle cx="60" cy="40" r="12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <circle cx="60" cy="40" r="1.5" fill="rgba(255,255,255,0.3)" />
      
      <rect x="4" y="24" width="12" height="32" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <rect x="4" y="32" width="5" height="16" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      
      <rect x="104" y="24" width="12" height="32" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <rect x="111" y="32" width="5" height="16" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
    </svg>
  );
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

  const { data: match, isLoading, error } = useMatchById(id || undefined);
  const { data: matchStats } = useMatchStats(match?.id);
  const { data: friends = [], isLoading: loadingFriends } = useFriends(user?.id);
  
  const joinMutation = useJoinMatch();
  const switchMutation = useSwitchTeam();
  const leaveMutation = useLeaveMatch();
  const deleteMutation = useDeleteMatch();
  const inviteMutation = useInvitePlayer();
  const respondMutation = useRespondToInvitation();
  const updateMutation = useUpdateMatch();
  const bulkUpdateMutation = useBulkUpdateParticipants();

  const [isPostMatchModalOpen, setIsPostMatchModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [isEditingTeamNames, setIsEditingTeamNames] = useState(false);
  const [editingNames, setEditingNames] = useState({ A: '', B: '' });
  const [showChat, setShowChat] = useState(false);
  const [venueAliasCbu, setVenueAliasCbu] = useState<string | null>(null);
  const [venueHasMP, setVenueHasMP] = useState<boolean | null>(null); 
  const [venueInfo, setVenueInfo] = useState<any>(null);
  const [isTacticalModalOpen, setIsTacticalModalOpen] = useState(false);
  const [isJoinQRModalOpen, setIsJoinQRModalOpen] = useState(false);

  useEffect(() => {
    if (match) {
      setEditingNames({ 
        A: match.team_a_name || 'Local', 
        B: match.team_b_name || 'Visitante' 
      });
      
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
              setVenueAliasCbu(matchedBiz.alias_cbu || null);
              if (matchedBiz.mp_access_token) {
                setVenueHasMP(true);
              } else if (matchedBiz.owner_id) {
                const { data: ownerProf } = await supabase.from('profiles').select('mp_access_token').eq('id', matchedBiz.owner_id).single();
                setVenueHasMP(!!ownerProf?.mp_access_token);
              } else {
                setVenueHasMP(false);
              }
            } else {
               setVenueInfo(null);
               setVenueHasMP(null);
            }
        } catch(e) { console.error('Error buscando establecimiento:', e); }
      };
      checkVenue();
    }
  }, [match]);

  const participants = match?.participants || [];
  const confirmedParticipants = participants.filter((p: any) => p.status === 'confirmed');
  const myEntry = participants.find((p: any) => p.user_id === user?.id);
  const hasJoined = !!myEntry;
  const isConfirmed = myEntry?.status === 'confirmed';
  const myTeam = myEntry?.team;
  const teamSize = match?.type === 'F5' ? 5 : match?.type === 'F7' ? 7 : 11;
  const totalPlayers = teamSize * 2;
  const teamA = confirmedParticipants.filter((p: any) => p.team === 'A');
  const teamB = confirmedParticipants.filter((p: any) => p.team === 'B');
  const unassigned = confirmedParticipants.filter((p: any) => !p.team);

  const handleJoinTeam = async (team: 'A' | 'B' | null) => {
    if (!user || !match) return;
    try {
      if (!hasJoined) {
        await joinMutation.mutateAsync({ matchId: match.id, userId: user.id, team });
      } else {
        if (myEntry?.status === 'pending') {
          await respondMutation.mutateAsync({ participantId: myEntry.id, status: 'confirmed' });
        }
        if (myTeam !== team) {
          await switchMutation.mutateAsync({ matchId: match.id, userId: user.id, team });
        }
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleMovePlayer = async (userId: string, newTeam: 'A' | 'B' | null) => {
    if (!match) return;
    try {
      await switchMutation.mutateAsync({ matchId: match.id, userId, team: newTeam });
    } catch (err: any) {
      alert(`Error moving player: ${err.message}`);
    }
  };

  const handleRandomizeTeams = async () => {
    if (!match || confirmedParticipants.length === 0) return;
    const shuffled = [...confirmedParticipants].sort(() => Math.random() - 0.5);
    const updates = shuffled.map((p: any, i: number) => ({
      user_id: p.user_id,
      team: i % 2 === 0 ? ('A' as const) : ('B' as const)
    }));
    try {
      await bulkUpdateMutation.mutateAsync({ matchId: match.id, updates });
    } catch (err: any) {
      alert(`Error randomization: ${err.message}`);
    }
  };

  const handleBenchAll = async () => {
    if (!match || confirmedParticipants.length === 0) return;
    const updates = confirmedParticipants.map((p: any) => ({
      user_id: p.user_id,
      team: null
    }));
    try {
      await bulkUpdateMutation.mutateAsync({ matchId: match.id, updates });
    } catch (err: any) {
      alert(`Error benching all: ${err.message}`);
    }
  };

  const handleLeave = async () => {
    if (!user || !match || !confirm('¿Salir del partido?')) return;
    try {
      await leaveMutation.mutateAsync({ matchId: match.id, userId: user.id });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!user || !match || !confirm('¿Eliminar este partido?')) return;
    try {
      await deleteMutation.mutateAsync(match.id);
      router.replace('/search');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleInviteResponse = async (status: 'confirmed' | 'rejected') => {
    if (!user || !myEntry) return;
    try {
      await respondMutation.mutateAsync({ participantId: myEntry.id, status });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleOpenInviteModal = async () => {
    if (!user) return;
    setInviteModalOpen(true);
  };

  const handleInviteFriend = async (friendId: string) => {
    if (!match) return;
    setInvitingId(friendId);
    try {
      await inviteMutation.mutateAsync({ matchId: match.id, userId: friendId });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInvitingId(null);
    }
  };

  const handleSaveTeamNames = async () => {
    if (!match || !id) return;
    try {
      await updateMutation.mutateAsync({ 
        matchId: id as string, 
        updates: { team_a_name: editingNames.A, team_b_name: editingNames.B } 
      });
      setIsEditingTeamNames(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <MatchSkeleton />;

  const isMatchPrivate = match?.is_private;
  const isCreator = user?.id === match?.creator_id;
  const isInvolved = user && match?.participants?.some((p: any) => p.user_id === user.id);

  if (isMatchPrivate && !isCreator && !isInvolved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center gap-6 bg-background">
        <div className="w-20 h-20 rounded-[2rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="font-black text-3xl text-foreground italic uppercase tracking-tighter">Partido Privado</p>
          <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">Necesitás una invitación del organizador para entrar.</p>
        </div>
        <Link href="/search" className="h-14 px-10 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center">Buscar Otros Partidos</Link>
      </div>
    );
  }

  if (error || !match)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center gap-6 bg-background">
        <p className="font-black text-2xl text-foreground italic uppercase tracking-tighter">Partido No Encontrado</p>
        <Link href="/search" className="px-8 py-3 bg-foreground/5 border border-foreground/10 text-foreground font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-foreground/10 transition-all">Volver a Búsqueda</Link>
      </div>
    );

  const isFull = match?.is_recruitment 
    ? confirmedParticipants.length >= (match.missing_players || 0)
    : confirmedParticipants.length >= totalPlayers;
  const matchTime = match ? new Date(`${match.date}T${match.time}`) : null;
  const isPast = matchTime ? new Date() > new Date(matchTime.getTime() + 60 * 60 * 1000) : false;
  const isCompleted = match?.is_completed || isPast || (matchStats && matchStats.goalScorers.length > 0);
  const userParticipant = user ? participants.find((p: any) => p.user_id === user.id) : null;

  const venueName = (() => {
    if (venueInfo?.name) return venueInfo.name;
    const v = findVenueByLocation(match.location);
    return v?.displayName || v?.name || match.location;
  })();

  const occupancyPct = match?.is_recruitment 
    ? Math.min(100, (confirmedParticipants.length / (match.missing_players || 1)) * 100)
    : Math.min(100, (confirmedParticipants.length / totalPlayers) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/6 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-blue-500/4 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full h-[45dvh] lg:h-[55dvh] shrink-0 overflow-hidden bg-[#020205]">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-75"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-40 lg:pt-32 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="w-12 h-12 glass shadow-2xl rounded-2xl flex items-center justify-center text-white border border-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-3">
            {!match.is_private && !isCompleted && (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsJoinQRModalOpen(true)}
                  className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/10"
                >
                  <QrCode className="w-5 h-5" />
                </motion.button>
                <MatchPromotionShare match={match} />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 pb-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black italic uppercase leading-[0.8] tracking-[-0.08em] text-white drop-shadow-[0_20px_80px_rgba(0,0,0,0.8)] font-kanit">
              {venueName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">{formatDate(match.date)}</span>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">{formatTime(match.time)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-30 px-4 lg:px-12 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div className="bg-foreground/[0.04] backdrop-blur-xl border border-foreground/[0.07] rounded-2xl px-5 py-4 flex items-center gap-4">
            <Users className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[8px] font-black text-foreground/30 uppercase">Jugadores</p>
              <p className="text-base font-black italic tracking-tight">{confirmedParticipants.length}/{totalPlayers}</p>
            </div>
          </div>
          <div className="bg-foreground/[0.04] backdrop-blur-xl border border-foreground/[0.07] rounded-2xl px-5 py-4 flex items-center gap-4">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[8px] font-black text-foreground/30 uppercase">Cuota</p>
              <p className="text-base font-black italic tracking-tight">${match.price}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-20 px-4 lg:px-12 mt-8 pb-32 space-y-8">
        {isCompleted ? (
          <PostMatchView match={match} participants={participants} stats={(matchStats || { goalScorers: [], mvp: null }) as any} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               {hasJoined && (
                 <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Alineaciones</h2>
                   <div className="flex items-center gap-2">
                     <button onClick={handleOpenInviteModal} className="h-10 px-5 bg-primary text-black rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"><UserPlus className="w-3.5 h-3.5" /> Convocar</button>
                     {isCreator && (
                       <button onClick={() => setIsTacticalModalOpen(true)} className="h-10 px-5 bg-white/5 border border-white/10 text-primary rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"><Shield className="w-3.5 h-3.5" /> Táctica</button>
                     )}
                   </div>
                 </div>
               )}

               {!hasJoined && !isFull && (
                 <button onClick={() => handleJoinTeam(null)} className="w-full p-8 rounded-[2.5rem] bg-primary text-black font-black text-2xl italic uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all">UNIRME AL PARTIDO</button>
               )}

               {hasJoined && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   {(['A', 'B'] as const).map((team) => (
                     <div key={team} className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/10">
                        <h3 className="text-xl font-black italic uppercase text-foreground mb-4">Equipo {team}</h3>
                        <div className="grid grid-cols-4 gap-4">
                           {confirmedParticipants.filter(p => p.team === team).map(p => (
                             <PlayerSlot key={p.id} participant={p} isSelf={p.user_id === user?.id} />
                           ))}
                        </div>
                        <button onClick={() => handleJoinTeam(team)} className="w-full mt-6 h-12 bg-foreground/5 rounded-xl text-[10px] font-black uppercase">Entrar aquí</button>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              {hasJoined && (
                <div className="h-[480px]">
                  <ChatRoom matchId={match.id} title="Chat del Lobby" />
                </div>
              )}
              {isConfirmed && match.price > 0 && !isCompleted && (
                <div className="p-6 rounded-[2.5rem] bg-[#009EE3]/5 border border-[#009EE3]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-5 h-5 text-[#009EE3]" />
                    <h3 className="text-lg font-black italic uppercase text-foreground">Confirmar lugar</h3>
                  </div>
                  <MercadoPagoButton matchId={match.id} title={`Turno en ${venueName}`} price={match.price} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInviteModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="relative z-10 w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6">
               <h3 className="text-xl font-black italic uppercase text-white mb-6">Invitar Amigos</h3>
               <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                 {friends.map((f: any) => (
                   <div key={f.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                     <span className="text-sm font-black text-white">{f.profiles?.name}</span>
                     <button onClick={() => handleInviteFriend(f.user_id === user?.id ? f.friend_id : f.user_id)} className="px-4 py-2 bg-primary text-black font-black text-[10px] rounded-lg">Invitar</button>
                   </div>
                 ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTacticalModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTacticalModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black italic uppercase text-white">Gestión de Equipos</h2>
                 <button onClick={() => setIsTacticalModalOpen(false)}><X /></button>
               </div>
               <div className="grid grid-cols-3 gap-6">
                 {/* Simplified tactical columns */}
                 {['A', 'B', null].map((t) => (
                   <div key={t || 'bench'} className="bg-white/5 p-4 rounded-2xl min-h-[300px]">
                     <h4 className="text-[10px] font-black uppercase text-white/40 mb-4">{t ? `Equipo ${t}` : 'Banquillo'}</h4>
                     <div className="space-y-2">
                       {confirmedParticipants.filter(p => p.team === t).map(p => (
                         <div key={p.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                           <span className="text-[10px] font-bold text-white">{p.profiles?.name}</span>
                           <div className="flex gap-1">
                             {t !== 'A' && <button onClick={() => handleMovePlayer(p.user_id, 'A')} className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-[8px]">A</button>}
                             {t !== 'B' && <button onClick={() => handleMovePlayer(p.user_id, 'B')} className="w-5 h-5 bg-rose-500 rounded flex items-center justify-center text-[8px]">B</button>}
                             {t !== null && <button onClick={() => handleMovePlayer(p.user_id, null)} className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-[8px]">X</button>}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {match && (
        <JoinQRModal
          isOpen={isJoinQRModalOpen}
          onClose={() => setIsJoinQRModalOpen(false)}
          matchId={match.id}
          venueName={venueName}
        />
      )}
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
