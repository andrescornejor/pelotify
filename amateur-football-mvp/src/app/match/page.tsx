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
  UserPlus,
  UserMinus,
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
  X,
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
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
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
      
      {/* Pitch Surface */}
      <rect x="0" y="0" width="120" height="80" rx="6" fill="rgba(255,255,255,0.01)" />
      <rect x="0" y="0" width="120" height="80" fill="url(#pitchGlow)" />
      
      {/* Outer Boundary */}
      <rect
        x="4"
        y="4"
        width="112"
        height="72"
        rx="2"
        stroke="url(#lineGrad)"
        strokeWidth="0.8"
        strokeOpacity="0.5"
      />
      
      {/* Center Line & Circle */}
      <line x1="60" y1="4" x2="60" y2="76" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <circle cx="60" cy="40" r="12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <circle cx="60" cy="40" r="1.5" fill="rgba(255,255,255,0.3)" />
      
      {/* Penalty Areas */}
      {/* Left */}
      <rect x="4" y="24" width="12" height="32" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <rect x="4" y="32" width="5" height="16" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      
      {/* Right */}
      <rect x="104" y="24" width="12" height="32" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <rect x="111" y="32" width="5" height="16" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      
      {/* Corners */}
      <path d="M 4 8 A 4 4 0 0 1 8 4" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <path d="M 112 8 A 4 4 0 0 0 116 4" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <path d="M 4 72 A 4 4 0 0 0 8 76" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <path d="M 112 72 A 4 4 0 0 1 116 76" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />

      {/* Decorative Grass Lines */}
      {[...Array(8)].map((_, i) => (
        <line 
          key={i} 
          x1={14 * (i + 1)} y1="4" x2={14 * (i + 1)} y2="76" 
          stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" 
        />
      ))}
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

  // React Query Hooks
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
  const [playerToKick, setPlayerToKick] = useState<any>(null);

  const handleKickPlayer = async (userId: string) => {
    if (!match) return;
    try {
      await leaveMutation.mutateAsync({ matchId: match.id, userId });
      setPlayerToKick(null);
    } catch (err: any) {
      alert(`Error al echar jugador: ${err.message}`);
    }
  };

  // Sync editing names when match loads
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
          <p className="font-black text-3xl text-foreground italic uppercase tracking-tighter">
            Partido Privado
          </p>
          <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
            Necesitás una invitación del organizador para entrar.
          </p>
        </div>
        <Link
          href="/search"
          className="h-14 px-10 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center"
        >
          Buscar Otros Partidos
        </Link>
      </div>
    );
  }

  if (error || !match)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center gap-6 bg-background">
        <p className="font-black text-2xl text-foreground italic uppercase tracking-tighter">
          Partido No Encontrado
        </p>
        <Link
          href="/search"
          className="px-8 py-3 bg-foreground/5 border border-foreground/10 text-foreground font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-foreground/10 transition-all"
        >
          Volver a Búsqueda
        </Link>
      </div>
    );

  const isFull = match?.is_recruitment 
    ? confirmedParticipants.length >= (match.missing_players || 0)
    : confirmedParticipants.length >= totalPlayers;
  const matchTime = match ? new Date(`${match.date}T${match.time}`) : null;
  const isPast = matchTime ? new Date() > new Date(matchTime.getTime() + 60 * 60 * 1000) : false;
  const isCompleted =
    match?.is_completed || isPast || (matchStats && matchStats.goalScorers.length > 0);
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
      {/* ── AMBIENT BLOBS ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/6 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-blue-500/4 blur-[120px] rounded-full" />
      </div>

      {/* ═══════════════════════════════════════════════════════════
                HERO — cinematic full-bleed header
            ═══════════════════════════════════════════════════════════ */}
      <div className="relative w-full h-[45dvh] lg:h-[55dvh] shrink-0 overflow-hidden bg-[#020205]">
        {/* Background image */}
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-75"
        />

        {/* Dynamic Scanline/Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay" />

        {/* Mini pitch overlay in hero with better scale */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-[120%] max-w-2xl aspect-video blur-[1px]">
            <MiniPitch type={match.type} />
          </div>
        </div>

        {/* Premium Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60" />

        {/* ── TOP BAR ── */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-40 lg:pt-32 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="w-12 h-12 glass shadow-2xl rounded-2xl flex items-center justify-center text-white border border-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <div className={cn(
               "px-5 py-2 glass-premium rounded-2xl border backdrop-blur-md",
               match.is_recruitment ? "border-amber-500/40 shadow-[0_10px_30px_rgba(245,158,11,0.2)]" : "border-primary/30 shadow-[0_10px_30px_rgba(44,252,125,0.2)]"
            )}>
              <span className={cn(
                "font-black text-[10px] uppercase tracking-[0.4em] italic leading-none",
                match.is_recruitment ? "text-amber-500" : "text-primary"
              )}>
                {match.is_recruitment ? "EMERGENCIA" : match.type}
              </span>
            </div>
            {match.is_private && (
              <div className="px-5 py-2 glass rounded-2xl border border-white/5 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em] leading-none">
                  PRIVADO
                </span>
              </div>
            )}
            
            {!match.is_private && !isCompleted && (
              <MatchPromotionShare match={match} />
            )}
          </motion.div>
        </div>

        {/* ── MAIN HERO CONTENT ── */}
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 pb-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-6"
          >
            {/* Live Indicator */}
            {!isCompleted && (
              <div className="flex items-center gap-3">
                <div className="relative w-2 h-2">
                  <div className={cn("absolute inset-0 rounded-full animate-ping", match.is_recruitment ? "bg-amber-500" : "bg-primary")} />
                  <div className={cn("relative w-full h-full rounded-full", match.is_recruitment ? "bg-amber-500" : "bg-primary")} />
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-[0.5em] italic", match.is_recruitment ? "text-amber-500" : "text-primary")}>
                  {match.is_recruitment ? "BÚSQUEDA DE REFUERZOS" : "CONVOCATORIA ABIERTA"}
                </span>
              </div>
            )}

            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black italic uppercase leading-[0.8] tracking-[-0.08em] text-white drop-shadow-[0_20px_80px_rgba(0,0,0,0.8)] font-kanit">
              {venueName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Fecha</span>
                  <span className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">
                    {formatDate(match.date)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Horario</span>
                  <span className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">
                    {formatTime(match.time)}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                  <MapPin className="w-5 h-5 text-white/40" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Ubicación</span>
                  <span className="text-xs font-bold text-white/40 italic truncate max-w-[200px] leading-none uppercase tracking-tight">
                    {match.location}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
                STATS BAR — floating card
            ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-30 px-4 lg:px-12 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            {
              icon: <Users className="w-4 h-4" />,
              label: match.is_recruitment ? 'Reclutando' : 'Jugadores',
              value: match.is_recruitment 
                ? `${confirmedParticipants.length}/${match.missing_players}` 
                : `${confirmedParticipants.length}/${totalPlayers}`,
              accent: match.is_recruitment ? 'text-amber-400' : 'text-primary',
              sub: match.is_recruitment 
                ? `${match.missing_players - confirmedParticipants.length} vacantes` 
                : `${Math.round(occupancyPct)}% ocupado`,
            },
            {
              icon: <DollarSign className="w-4 h-4" />,
              label: 'Cuota',
              value: match.price > 0 ? `$${match.price.toLocaleString('es-AR')}` : 'Libre',
              accent: match.price > 0 ? 'text-amber-400' : 'text-emerald-400',
              sub: match.price > 0 ? 'ARS por jugador' : 'Entrada gratis',
            },
            {
              icon: <Trophy className="w-4 h-4" />,
              label: 'Formato',
              value: match.type,
              accent: 'text-violet-400',
              sub: match.type === 'F5' ? '5 vs 5' : match.type === 'F7' ? '7 vs 7' : '11 vs 11',
            },
            {
              icon: match.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />,
              label: 'Acceso',
              value: match.is_private ? 'Privado' : 'Público',
              accent: match.is_private ? 'text-violet-400' : 'text-primary',
              sub: match.is_private ? 'Solo invitados' : 'Abierto',
            },
          ].map(({ icon, label, value, accent, sub }) => (
            <div
              key={label}
              className="bg-foreground/[0.04] backdrop-blur-xl border border-foreground/[0.07] rounded-2xl px-5 py-4 flex items-center gap-4"
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center bg-foreground/5 border border-foreground/5 shrink-0',
                  accent
                )}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">
                  {label}
                </p>
                <p className={cn('text-base font-black italic tracking-tight', accent)}>{value}</p>
                <p className="text-[9px] text-foreground/30 font-bold">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
                OCCUPANCY PROGRESS BAR
            ═══════════════════════════════════════════════════════════ */}
      {!isCompleted && (
        <div className="px-4 lg:px-12 mt-4 relative z-20">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">
              Ocupación
            </span>
            <span
              className={cn(
                'text-[9px] font-black uppercase tracking-widest',
                isFull ? 'text-red-400' : 'text-primary'
              )}
            >
              {isFull
                ? 'CUPO LLENO'
                : `Faltan ${totalPlayers - confirmedParticipants.length} jugadores`}
            </span>
          </div>
          <div className="h-1.5 bg-foreground/[0.05] rounded-full overflow-hidden border border-foreground/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPct}%` }}
              transition={{ duration: 1.2, ease: 'circOut', delay: 0.7 }}
              className={cn('h-full rounded-full', isFull ? 'bg-red-500' : 'bg-primary')}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-20 px-4 lg:px-12 mt-8 pb-32 space-y-8">
        {/* ── PENDING INVITATION BANNER ── */}
        <AnimatePresence>
          {hasJoined && myEntry?.status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-primary/5 p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
              <div className="relative flex flex-col sm:flex-row items-center gap-5">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-black shrink-0">
                  <Trophy className="w-7 h-7" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter">
                    ¡Te invitaron a jugar!
                  </h3>
                  <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mt-1">
                    Aceptá o rechazá la invitación
                  </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleInviteResponse('confirmed')}
                    disabled={respondMutation.isPending}
                    className="flex-1 sm:flex-none h-12 px-8 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {respondMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      '¡Dale!'
                    )}
                  </button>
                  <button
                    onClick={() => handleInviteResponse('rejected')}
                    disabled={respondMutation.isPending}
                    className="flex-1 sm:flex-none h-12 px-6 bg-foreground/5 border border-foreground/10 text-foreground/40 font-black text-xs uppercase tracking-widest rounded-2xl hover:text-foreground transition-all"
                  >
                    Paso
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── POST-MATCH PROMPT ── */}
        {!match?.is_completed && isPast && userParticipant && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] border border-amber-500/30 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl border border-amber-500/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground italic uppercase tracking-tighter">
                  Resultados Pendientes
                </h3>
                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                  El partido ya terminó. Reportá el resultado.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPostMatchModalOpen(true)}
              className="shrink-0 h-12 px-8 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              Reportar
            </button>
          </motion.div>
        )}

        {/* ── COMPLETED MATCH VIEW ── */}
        {isCompleted ? (
          <div className="space-y-8">
            <PostMatchView
              match={match}
              participants={participants}
              stats={(matchStats || { goalScorers: [], mvp: null }) as any}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── LEFT: TEAMS ── */}
            <div className="lg:col-span-8 space-y-8">
              {/* Header - Only visible if joined */}
              {hasJoined && (
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                      {match.is_recruitment ? 'Hub de Reclutamiento' : 'Alineaciones'}
                    </h2>
                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.4em] mt-1">
                      {match.is_recruitment 
                        ? 'Sumate al equipo que busca refuerzos' 
                        : 'Elegí tu equipo y entrá a jugar'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        onClick={handleOpenInviteModal}
                        className="h-10 px-5 bg-primary text-black rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Convocar
                      </button>
                    )}
                    {isCreator && !isCompleted && (
                      <>
                      <button
                        onClick={() => setIsTacticalModalOpen(true)}
                        className="h-10 px-5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 text-primary rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-black/20"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Gestionar Equipos
                      </button>
                      <button
                        onClick={() =>
                          isEditingTeamNames ? handleSaveTeamNames() : setIsEditingTeamNames(true)
                        }
                        disabled={updateMutation.isPending}
                        className={cn(
                          'h-10 w-10 rounded-xl flex items-center justify-center border transition-all active:scale-95',
                          isEditingTeamNames
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-foreground/5 border-foreground/10 text-foreground/30 hover:text-primary hover:border-primary/30'
                        )}
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isEditingTeamNames ? (
                          <Save className="w-4 h-4" />
                        ) : (
                          <Edit2 className="w-4 h-4" />
                        )}
                      </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Unassigned bench - Only visible if joined */}
              {hasJoined && unassigned.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2.5rem] border border-foreground/[0.08] bg-foreground/[0.02] p-8 space-y-6 backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                          Banquillo de Espera
                        </h3>
                        <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em] mt-1">
                          {unassigned.length} {unassigned.length === 1 ? 'jugador esperando' : 'jugadores esperando'} equipo
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-8 px-2">
                    {unassigned.map((p: any) => (
                      <div key={p.id} className="relative group/slot">
                         <div
                           className={cn("transition-all relative rounded-[2.2rem]", isCreator && !isCompleted && p.user_id !== user?.id ? "cursor-pointer hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:ring-2 hover:ring-red-500/50" : "")}
                           onClick={() => { if (isCreator && !isCompleted && p.user_id !== user?.id) setPlayerToKick(p) }}
                         >
                           <PlayerSlot participant={p} isSelf={p.user_id === user?.id} />
                         </div>
                         <div className="mt-2 text-center">
                            <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest block truncate max-w-[60px]">
                               {p.profiles?.name?.split(' ')[0]}
                            </span>
                         </div>
                         {isCreator && !isCompleted && (
                            <div className="absolute top-0 right-0 z-50 flex flex-col gap-1 opacity-0 group-hover/slot:opacity-100 transition-all scale-75 group-hover/slot:scale-100 origin-top-right">
                               <button 
                                 onClick={() => handleMovePlayer(p.user_id, 'A')}
                                 className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90 transition-transform"
                                 title="Mover al Equipo A"
                               >
                                  <ChevronRight className="w-4 h-4 -rotate-90" />
                               </button>
                               <button 
                                 onClick={() => handleMovePlayer(p.user_id, 'B')}
                                 className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90 transition-transform"
                                 title="Mover al Equipo B"
                               >
                                  <ChevronRight className="w-4 h-4 rotate-90" />
                               </button>
                            </div>
                         )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── JOIN MATCH HERO (for non-joined players) ── */}
              {user && !hasJoined && !match.is_private && !isCompleted && !isFull && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-surface-elevated group"
                >
                  {/* Cinematic Background */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop" 
                      className="w-full h-full object-cover opacity-10 grayscale brightness-50"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface-elevated via-surface-elevated/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="max-w-md space-y-4 text-center sm:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                        <Zap className="w-3 h-3 text-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Inscripciones Abiertas</span>
                      </div>
                      
                      <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-foreground leading-tight">
                        {match.is_recruitment ? '¡Se buscan refuerzos!' : '¿Entrás a jugar?'}
                      </h2>
                      
                      <p className="text-sm font-bold text-foreground/40 leading-relaxed uppercase tracking-tight">
                        {match.is_recruitment 
                          ? `Sumate como uno de los ${match.missing_players} jugadores restantes para completar el partido.`
                          : 'Unite al banquillo de reserva y esperá que el organizador te asigne a un equipo.'}
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary/40" />
                          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                            {confirmedParticipants.length} jugadores unidos
                          </span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-foreground/10" />
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-primary/40" />
                          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                            Formato {match.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinTeam(match.is_recruitment ? 'A' : null)}
                      disabled={joinMutation.isPending}
                      className="shrink-0 group/join relative flex flex-col items-center gap-4 focus:outline-none"
                    >
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-2">
                        {/* Outer Glow Ring */}
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-radar-pulse" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary/10 scale-90 group-hover/join:scale-110 transition-transform duration-500" />
                        
                        {/* Main Button Circle */}
                        <div className={cn(
                          "absolute inset-2 rounded-full flex flex-col items-center justify-center text-black font-black transition-all duration-300 shadow-2xl",
                          joinMutation.isPending ? "bg-white/20" : "bg-primary group-hover/join:scale-105 group-hover/join:shadow-primary/40"
                        )}>
                          {joinMutation.isPending ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <>
                              <PlusCircle className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                              <span className="text-[10px] sm:text-xs uppercase tracking-widest leading-none">UNIRME</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] animate-shimmer opacity-0 group-hover/join:opacity-100 transition-opacity">
                        CLICK PARA ENTRAR
                      </span>
                    </button>
                  </div>
                  
                  {/* Decorative Scanline */}
                  <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-primary/20 animate-scan-line pointer-events-none" />
                </motion.div>
              )}

              {/* ── NOT LOGGED IN CTA ── */}
              {!user && !isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-[2.5rem] border border-foreground/10 bg-surface-elevated p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8"
                >
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                      ¿Querés sumarte a este partido?
                    </h3>
                    <p className="text-sm font-bold text-foreground/40 mt-2 uppercase tracking-tight">
                      Iniciá sesión o registrate para poder unirte a las alineaciones y chatear con los pibes.
                    </p>
                  </div>
                  <Link
                    href={`/login?redirect=/match?id=${match.id}`}
                    className="shrink-0 h-14 px-10 bg-primary text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <UserPlus className="w-4 h-4" />
                    Iniciar Sesión
                  </Link>
                </motion.div>
              )}

              {/* Team panels / Recruitment List - Only visible if joined */}
              {hasJoined && (
                <>
                  {match.is_recruitment ? (
                    <div className="space-y-6">
                       {/* Recruitment Players List */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">
                              Lista de Refuerzos ({confirmedParticipants.length})
                            </span>
                            {isFull && (
                              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                <Check className="w-3 h-3" /> CUPO COMPLETO
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {confirmedParticipants.map((p: any) => (
                               <motion.div 
                                 key={p.id} 
                                 whileHover={isCreator && !isCompleted && p.user_id !== user?.id ? { scale: 1.02, textShadow: "0px 0px 8px rgb(255,255,255)" } : { scale: 1.02 }}
                                 className={cn("p-5 rounded-[1.8rem] glass-premium border-white/5 flex items-center gap-4 transition-all", isCreator && !isCompleted && p.user_id !== user?.id ? "cursor-pointer hover:border-red-500/50 hover:bg-red-500/5" : "")}
                                 onClick={() => { if (isCreator && !isCompleted && p.user_id !== user?.id) setPlayerToKick(p) }}
                               >
                                  <PlayerSlot participant={p} isSelf={p.user_id === user?.id} />
                                  <div className="flex flex-col pointer-events-none">
                                     <span className="text-sm font-black italic uppercase text-foreground">{p.profiles?.name}</span>
                                     <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-[8px] font-black text-primary/70 uppercase tracking-widest">REFUERZO CONFIRMADO</span>
                                     </div>
                                  </div>
                               </motion.div>
                             ))}
                             
                             {Array.from({ length: Math.max(0, (match.missing_players || 0) - confirmedParticipants.length) }).map((_, i) => (
                               <div key={`empty-${i}`} className="p-5 rounded-[1.8rem] border-2 border-dashed border-foreground/5 bg-foreground/[0.01] flex items-center gap-4 opacity-40">
                                  <div className="w-12 h-12 rounded-2xl border border-foreground/10 flex items-center justify-center bg-foreground/5">
                                     <Users className="w-5 h-5 text-foreground/20" />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-xs font-black italic uppercase text-foreground/20 italic tracking-tighter">Buscando Jugador...</span>
                                     <span className="text-[8px] font-bold text-foreground/10 uppercase tracking-widest">VACANTE DISPONIBLE</span>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {(['A', 'B'] as const).map((team: 'A' | 'B', teamIdx: number) => {
                      const members = team === 'A' ? teamA : teamB;
                      const cfg = TEAM_CONFIG[team];
                      const isMine = myTeam === team;
                      const teamFull = members.length >= teamSize;
                      const canJoin = (!hasJoined || myEntry?.status === 'pending') && !teamFull;
                      const canSwitch = hasJoined && isConfirmed && myTeam !== team && !teamFull;
    
                      return (
                        <motion.div
                          key={team}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: teamIdx * 0.1 }}
                          className={cn(
                            'relative rounded-[2.5rem] border-2 p-8 transition-all duration-500 overflow-hidden',
                            isMine
                              ? `${cfg.borderActive} ${cfg.shadow} bg-surface-elevated`
                              : `${cfg.border} hover:border-foreground/20 bg-foreground/[0.01]`,
                          )}
                        >
                          {/* Background gradient */}
                          {isMine && (
                            <div
                              className={cn(
                                'absolute inset-0 bg-gradient-to-br opacity-30',
                                cfg.gradient
                              )}
                            />
                          )}
    
                          {/* Team header */}
                          <div className="relative flex items-center gap-4 mb-5">
                            <div
                              className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl italic text-white shadow-lg',
                                cfg.bg
                              )}
                            >
                              {team}
                            </div>
                            <div className="flex-1 min-w-0">
                              {isEditingTeamNames ? (
                                <input
                                  value={team === 'A' ? editingNames.A : editingNames.B}
                                  onChange={(e) =>
                                    setEditingNames({ ...editingNames, [team]: e.target.value })
                                  }
                                  className="bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-1.5 text-sm font-black italic uppercase tracking-tighter text-foreground outline-none focus:border-primary/50 w-full"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">
                                  {team === 'A'
                                    ? match.team_a_name || 'Local'
                                    : match.team_b_name || 'Visitante'}
                                </h3>
                              )}
                              <p
                                className={cn(
                                  'text-[9px] font-black uppercase tracking-widest mt-1',
                                  cfg.text
                                )}
                              >
                                {members.length}/{teamSize} jugadores
                              </p>
                            </div>
                            {isMine && (
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-black" />
                              </div>
                            )}
                          </div>
    
                          {/* Occupancy mini-bar */}
                          <div className="h-1 bg-foreground/5 rounded-full overflow-hidden mb-5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(members.length / teamSize) * 100}%` }}
                              transition={{ duration: 1, ease: 'circOut', delay: 0.5 + teamIdx * 0.15 }}
                              className={cn(
                                'h-full rounded-full',
                                team === 'A' ? 'bg-blue-500' : 'bg-red-500'
                              )}
                            />
                          </div>
    
                          {/* Join button */}
                          {!match.is_completed && (
                            <button
                              onClick={() => (canJoin || canSwitch) && handleJoinTeam(team)}
                              disabled={joinMutation.isPending || switchMutation.isPending || (teamFull && !isMine)}
                              className={cn(
                                'w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 mb-5 shadow-lg',
                                isMine
                                  ? 'bg-foreground/5 border border-foreground/10 text-foreground/50 cursor-default'
                                  : teamFull
                                    ? 'bg-foreground/[0.03] border border-foreground/5 text-foreground/20 cursor-not-allowed'
                                    : `${cfg.btn} text-white shadow-lg`
                              )}
                            >
                              {(joinMutation.isPending || switchMutation.isPending) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isMine ? (
                                <>
                                  <Check className="w-4 h-4 text-primary" /> Estás acá
                                </>
                              ) : teamFull ? (
                                'Equipo lleno'
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 fill-current" /> Entrar a jugar
                                </>
                              )}
                            </button>
                          )}
    
                          {/* Player slots grid */}
                          <div className="grid grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                            {Array.from({ length: teamSize }).map((_: any, idx: number) => {
                              const participant = members[idx];
                              return (
                                <div key={idx} className="relative group/slot">
                                  <div
                                    className={cn("transition-all relative rounded-[2.2rem]", isCreator && !isCompleted && participant && participant.user_id !== user?.id ? "cursor-pointer hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:ring-2 hover:ring-red-500/50" : "")}
                                    onClick={() => { if (isCreator && !isCompleted && participant && participant.user_id !== user?.id) setPlayerToKick(participant) }}
                                  >
                                    <PlayerSlot
                                      participant={participant}
                                      isSelf={participant?.user_id === user?.id}
                                    />
                                  </div>
                                  {isCreator && !isCompleted && participant && (
                                    <div className="absolute top-0 right-0 z-50 flex flex-col gap-1 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleMovePlayer(participant.user_id, team === 'A' ? 'B' : 'A')}
                                        className={cn(
                                          "w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90",
                                          team === 'A' ? "bg-rose-500" : "bg-blue-500"
                                        )}
                                        title={team === 'A' ? "Mover al Equipo B" : "Mover al Equipo A"}
                                      >
                                        <ChevronRight className="w-3 h-3" />
                                      </button>
                                      <button 
                                        onClick={() => handleMovePlayer(participant.user_id, null)}
                                        className="w-6 h-6 bg-zinc-700 rounded-lg flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90"
                                        title="Mover al Banquillo"
                                      >
                                        <LogOut className="w-3 h-3 rotate-90" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  )}
                </>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {hasJoined && (
                  <button
                    onClick={handleLeave}
                    disabled={leaveMutation.isPending || match.is_completed}
                    className="w-full h-13 py-3.5 bg-foreground/[0.03] border border-foreground/[0.07] rounded-2xl flex items-center justify-center gap-3 text-foreground/30 hover:text-red-400 hover:bg-red-500/[0.06] hover:border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-[0.98] disabled:opacity-40"
                  >
                    {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogOut className="w-4 h-4" /> Bajarme del partido</>}
                  </button>
                )}
                {isCreator && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending || match.is_completed}
                    className="w-full h-13 py-3.5 bg-foreground/[0.03] border border-foreground/[0.07] rounded-2xl flex items-center justify-center gap-3 text-foreground/30 hover:text-red-500 hover:bg-red-600/[0.06] hover:border-red-600/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-[0.98] disabled:opacity-40"
                  >
                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Suspender partido</>}
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT: SIDEBAR ── */}
            <div className="lg:col-span-4 space-y-6">
              {/* CHAT TOGGLE on mobile */}
              {hasJoined && !isCompleted && (
                <div>
                  <button
                    onClick={() => setShowChat((v) => !v)}
                    className="lg:hidden w-full h-12 rounded-2xl bg-foreground/[0.04] border border-foreground/[0.07] flex items-center justify-between px-5 text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Chat del Lobby
                    </div>
                    <ChevronRight
                      className={cn('w-4 h-4 transition-transform', showChat && 'rotate-90')}
                    />
                  </button>

                  <AnimatePresence>
                    {showChat && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 420, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="h-[420px]">
                          <ChatRoom matchId={match.id} title="Chat del Lobby" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Desktop chat */}
                  <div className="hidden lg:block h-[480px]">
                    <ChatRoom matchId={match.id} title="Chat del Lobby" />
                  </div>
                </div>
              )}

              {/* PAYMENT SECTION — Shown to anyone confirmed, but with special rules for creator */}
              {isConfirmed && match.price > 0 && !isCompleted && !myEntry?.paid && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-[2.5rem] bg-[#009EE3]/5 border border-[#009EE3]/20 space-y-4"
                >
                  {/* Si es creador Y es partido en establecimiento, no paga extra si ya pagó la seña */}
                  {isCreator && (venueHasMP !== null || match.booking) ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 font-kanit">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-black shrink-0">
                          <Check className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">
                            Seña Abonada
                          </h3>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                            Tu lugar ya está confirmado
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-relaxed">
                        Como creador y pagador de la seña ({match.booking?.down_payment_paid > 0 ? `$${match.booking.down_payment_paid.toLocaleString('es-AR')}` : 'pendiente'}), tu lugar se considera confirmado automáticamente.
                        {match.booking?.down_payment_paid > (match.booking?.total_price / totalPlayers) && (
                          <span className="text-primary block mt-2">
                             Pagaste ${match.booking.down_payment_paid - (match.booking.total_price / totalPlayers)} de más. Este excedente te será devuelto a medida que otros jugadores abonen su parte.
                          </span>
                        )}
                      </p>
                    </div>
                  ) : isCreator && venueHasMP === null ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 font-kanit">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-black shrink-0">
                          <Check className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">
                            Sos el dueño
                          </h3>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                            Tu lugar ya está confirmado
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-relaxed">
                        Como sos quien armó el partido y recibe el dinero, no hace falta que pagues por Mercado Pago.
                      </p>
                    </div>
                  ) : (
                    <>
                    <div className="flex items-center gap-3 font-kanit">
                      <div className="w-10 h-10 rounded-2xl bg-[#009EE3] flex items-center justify-center text-white shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">
                          {match.payment_method === 'cash' ? 'Pago en el predio' : 'Confirmá tu lugar'}
                        </h3>
                        {match.payment_method !== 'cash' && venueHasMP !== false && (
                           <p className="text-[10px] text-[#009EE3] font-bold uppercase tracking-widest mt-1">
                             Pago seguro vía Mercado Pago
                           </p>
                        )}
                        {match.payment_method === 'cash' && (
                           <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">
                             Abonás al llegar a la cancha
                           </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Botón Mercado Pago: Solo si NO es Efectivo Y (tiene MP o es casual para el creador... wait) */}
                    {/* En casual (venueHasMP === null), el creador ya retornó arriba */}
                    {match.payment_method !== 'cash' && venueHasMP !== false && (
                      <MercadoPagoButton 
                        matchId={match.id} 
                        title={`Lugar en ${venueName} - ${match.date}`} 
                        price={match.price} 
                      />
                    )}

                    {match.payment_method === 'cash' && (
                      <div className="mt-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                          <DollarSign className="w-5 h-5 text-black" />
                        </div>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-tight leading-snug">
                          Recordá llevar el dinero en efectivo. El establecimiento te cobrará antes de jugar.
                        </p>
                      </div>
                    )}
                    
                    {venueAliasCbu && (
                      <div className="mt-4 p-4 rounded-xl bg-foreground/5 border border-foreground/10 text-center">
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-1">Pagá transfiriendo manualmente a este Alias/CBU:</p>
                        <p className="text-sm font-black italic tracking-tighter text-foreground selectable select-all bg-background border border-border inline-block px-3 py-1.5 rounded-lg mt-2">{venueAliasCbu}</p>
                      </div>
                    )}
                    </>
                  )}
                  
                  <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest text-center mt-4 italic">
                    {match.booking?.down_payment_paid > 0 
                      ? `* El organizador ya abonó una seña de $${match.booking.down_payment_paid.toLocaleString('es-AR')}. Tu pago completa el total del turno.`
                      : "* El organizador abona la seña para reservar el turno y luego cada jugador completa su parte."}
                  </p>
                  {match.booking?.down_payment_paid > (match.booking?.total_price / totalPlayers) && (
                    <p className="text-[9px] text-primary font-bold uppercase tracking-widest text-center mt-2">
                       * Como la seña es mayor a una cuota, el excedente se le devuelve al organizador automáticamente.
                    </p>
                  )}
                  <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest text-center mt-2">
                    * El pago confirma tu asistencia definitiva.
                  </p>
                </motion.div>
              )}

              {/* MAP */}
              <div className="rounded-[2rem] overflow-hidden border border-foreground/[0.07] bg-foreground/[0.02]">
                <div className="px-5 py-4 border-b border-foreground/5 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                    {venueName}
                  </span>
                </div>
                <div className="p-3">
                  <div className="h-56 rounded-xl overflow-hidden bg-foreground/5 relative flex items-center justify-center group">
                    <VenueMap 
                       location={match.location} 
                    />
                    {venueInfo?.google_maps_link && (
                      <a 
                        href={venueInfo.google_maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 text-white backdrop-blur-[2px]"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                          <ExternalLink className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/10">
                          Ver en Google Maps
                        </span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <p className="text-xs font-bold text-foreground/30 italic">{match.location}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
                INVITE MODAL
            ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInviteModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative z-10 w-full sm:max-w-md bg-zinc-950 border border-foreground/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 overflow-hidden"
            >
              {/* Ambient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                    Invitar Pibes
                  </h3>
                  <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest mt-0.5">
                    Tus amigos en Pelotify
                  </p>
                </div>
                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="w-10 h-10 bg-foreground/5 rounded-xl flex items-center justify-center text-foreground/30 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingFriends ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-5">
                  <p className="text-lg font-black italic uppercase tracking-tighter text-foreground/50">
                    Sin amigos aún
                  </p>
                  <Link
                    href="/friends"
                    onClick={() => setInviteModalOpen(false)}
                    className="h-12 px-8 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center"
                  >
                    Agregar Amigos
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {friends.map((f: any) => {
                    const otherUserId = f.user_id === user?.id ? f.friend_id : f.user_id;
                    const participant = participants.find((p: any) => p.user_id === otherUserId);
                    const isInvited = participant?.status === 'pending';
                    const isJoined = participant?.status === 'confirmed';

                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between px-4 py-3 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] hover:bg-foreground/[0.05] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                            <span className="text-[10px] font-black text-foreground/40">
                              {f.profiles?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-black italic uppercase tracking-tight text-foreground">
                            {f.profiles?.name}
                          </span>
                        </div>
                        {isJoined ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-xl">
                            <Check className="w-3 h-3 text-primary" />
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                              Jugando
                            </span>
                          </div>
                        ) : isInvited ? (
                          <div className="px-3 py-1.5 bg-foreground/5 rounded-xl">
                            <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">
                              Invitado
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInviteFriend(otherUserId)}
                            disabled={invitingId === otherUserId}
                            className="h-9 px-5 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                          >
                            {invitingId === otherUserId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Invitar'
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
                 TACTICAL BOARD MODAL
            ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isTacticalModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 lg:p-12 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTacticalModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full h-full lg:max-w-7xl lg:max-h-[90vh] bg-[#050508] border-y lg:border border-white/5 lg:rounded-[3rem] flex flex-col shadow-2xl"
            >
              <div className="p-6 lg:p-8 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Pizarra Táctica</h2>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Gestión de Equipos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={handleRandomizeTeams}
                     className="hidden sm:flex h-11 px-6 bg-white/[0.03] border border-white/5 hover:bg-white/5 rounded-2xl items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                   >
                     <Zap className="w-4 h-4 text-amber-400" /> Mezclar al azar
                   </button>
                   <button 
                     onClick={handleBenchAll}
                     className="hidden sm:flex h-11 px-6 bg-white/[0.03] border border-white/5 hover:bg-white/5 rounded-2xl items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all text-rose-400"
                   >
                     <LogOut className="w-4 h-4 rotate-90" /> Vaciar Cancha
                   </button>
                   <button 
                     onClick={() => setIsTacticalModalOpen(false)}
                     className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 lg:p-12 space-y-8 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Column A */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full bg-blue-500")} />
                          <span className="text-xs font-black italic uppercase text-white">{match.team_a_name || 'Local'}</span>
                       </div>
                       <span className="text-[10px] font-bold text-white/30 uppercase">{teamA.length}/{teamSize}</span>
                    </div>
                    <div className="min-h-[200px] p-4 rounded-[2rem] bg-blue-500/[0.03] border border-blue-500/10 space-y-2">
                       {teamA.map((p: any) => (
                         <TacticalPlayerCard key={p.id} participant={p} onMove={handleMovePlayer} current="A" onKick={p.user_id !== user?.id ? () => setPlayerToKick(p) : undefined} />
                       ))}
                       {teamA.length === 0 && <div className="py-12 text-center text-[10px] font-bold text-white/10 uppercase italic">Vacío</div>}
                    </div>
                  </div>

                  {/* Column Bench */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center px-2">
                       <span className="text-xs font-black italic uppercase text-white/40">Banquillo</span>
                    </div>
                    <div className="min-h-[200px] p-4 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-2">
                       {unassigned.map((p: any) => (
                         <TacticalPlayerCard key={p.id} participant={p} onMove={handleMovePlayer} current={null} onKick={p.user_id !== user?.id ? () => setPlayerToKick(p) : undefined} />
                       ))}
                       {unassigned.length === 0 && <div className="py-12 text-center text-[10px] font-bold text-white/10 uppercase italic">Todo asignado</div>}
                    </div>
                  </div>

                  {/* Column B */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full bg-rose-500")} />
                          <span className="text-xs font-black italic uppercase text-white">{match.team_b_name || 'Visitante'}</span>
                       </div>
                       <span className="text-[10px] font-bold text-white/30 uppercase">{teamB.length}/{teamSize}</span>
                    </div>
                    <div className="min-h-[200px] p-4 rounded-[2rem] bg-rose-500/[0.03] border border-rose-500/10 space-y-2">
                       {teamB.map((p: any) => (
                         <TacticalPlayerCard key={p.id} participant={p} onMove={handleMovePlayer} current="B" onKick={p.user_id !== user?.id ? () => setPlayerToKick(p) : undefined} />
                       ))}
                       {teamB.length === 0 && <div className="py-12 text-center text-[10px] font-bold text-white/10 uppercase italic">Vacío</div>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:hidden p-6 border-t border-white/5 grid grid-cols-2 gap-4">
                   <button 
                     onClick={handleRandomizeTeams}
                     className="h-12 px-6 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                   >
                     <Zap className="w-4 h-4 text-amber-400" /> Mezclar
                   </button>
                   <button 
                     onClick={handleBenchAll}
                     className="h-12 px-6 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all text-rose-400"
                   >
                    Limpiar
                   </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
                 PLAYER ACTION MODAL (KICK)
            ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {playerToKick && (
          <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlayerToKick(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="relative z-10 w-full sm:max-w-sm bg-zinc-950 border border-foreground/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 overflow-hidden flex flex-col items-center text-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <UserMinus className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground mb-1">
                Echar a {playerToKick.profiles?.name?.split(' ')[0] || 'Jugador'}
              </h3>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">
                ¿Estás seguro que querés sacar a este jugador del partido?
              </p>

              <div className="flex w-full gap-3">
                 <button
                   onClick={() => setPlayerToKick(null)}
                   className="flex-1 h-12 bg-foreground/5 border border-foreground/10 text-foreground/40 font-black text-[10px] uppercase tracking-widest rounded-xl hover:text-foreground transition-all"
                 >
                   Cancelar
                 </button>
                 <button
                   onClick={() => handleKickPlayer(playerToKick.user_id)}
                   disabled={leaveMutation.isPending}
                   className="flex-1 h-12 bg-red-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                 >
                   {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Echar Jugador'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </div>
  );
}

function TacticalPlayerCard({ participant, onMove, current, onKick }: { participant: any, onMove: any, current: 'A' | 'B' | null, onKick?: any }) {
  return (
    <motion.div 
      layout
      className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
         <div 
           className={cn("w-8 h-8 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center transition-colors", onKick ? "cursor-pointer hover:border-red-500/50" : "")}
           onClick={() => onKick && onKick(participant)}
         >
            {participant.profiles?.avatar_url ? (
              <img src={participant.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-black">{participant.profiles?.name?.[0].toUpperCase()}</span>
            )}
         </div>
         <span className="text-[10px] font-black italic uppercase text-white/80">{participant.profiles?.name}</span>
      </div>
      <div className="flex items-center gap-1">
         {current !== 'A' && (
           <button onClick={() => onMove(participant.user_id, 'A')} className="w-7 h-7 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><ChevronRight className="w-3.5 h-3.5 rotate-180" /></button>
         )}
         {current !== null && (
           <button onClick={() => onMove(participant.user_id, null)} className="w-7 h-7 bg-white/10 text-white/40 rounded-lg flex items-center justify-center hover:bg-white/20 hover:text-white transition-all"><X className="w-3 h-3" /></button>
         )}
         {current !== 'B' && (
           <button onClick={() => onMove(participant.user_id, 'B')} className="w-7 h-7 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
         )}
         {onKick && (
           <button onClick={() => onKick(participant)} className="w-7 h-7 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><UserMinus className="w-3.5 h-3.5" /></button>
         )}
      </div>
    </motion.div>
  );
}

export default function MatchLobbyPage() {
  return (
    <Suspense fallback={<MatchSkeleton />}>
      <MatchLobbyContent />
    </Suspense>
  );
}
