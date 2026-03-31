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
  useMatchStats
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
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="pitchGlow" cx="60" cy="40" r="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(44,252,125,0.05)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="120" height="80" fill="url(#pitchGlow)" />
      <rect
        x="2"
        y="2"
        width="116"
        height="76"
        rx="4"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1.5"
      />
      <line x1="60" y1="2" x2="60" y2="78" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="60" cy="40" r="14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="60" cy="40" r="2" fill="rgba(255,255,255,0.2)" />
      
      {/* Area A */}
      <rect
        x="2"
        y="28"
        width={isF5 ? 8 : isF11 ? 12 : 10}
        height="24"
        stroke="rgba(44,252,125,0.1)"
        strokeWidth="1"
      />
      {/* Area B */}
      <rect
        x={isF5 ? 110 : isF11 ? 106 : 108}
        y="28"
        width={isF5 ? 8 : isF11 ? 12 : 10}
        height="24"
        stroke="rgba(44,252,125,0.1)"
        strokeWidth="1"
      />
      
      {/* Grass lines (decorative) */}
      {[...Array(6)].map((_, i) => (
        <line 
          key={i} 
          x1={20 * (i + 1)} y1="2" x2={20 * (i + 1)} y2="78" 
          stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" 
        />
      ))}
    </svg>
  );
}

// ── TEAM COLORS ───────────────────────────────────────────────────────────────
const TEAM_CONFIG = {
  A: {
    bg: 'bg-[#3b82f6]',
    border: 'border-blue-500/10',
    borderActive: 'border-blue-400',
    shadow: 'shadow-[0_20px_40px_rgba(59,130,246,0.12)]',
    glow: 'rgba(59,130,246,0.15)',
    text: 'text-blue-300',
    btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
    gradient: 'from-blue-600/15 via-blue-600/5 to-transparent',
    accent: '#3b82f6'
  },
  B: {
    bg: 'bg-[#f43f5e]',
    border: 'border-rose-500/10',
    borderActive: 'border-rose-400',
    shadow: 'shadow-[0_20px_40px_rgba(244,63,94,0.12)]',
    glow: 'rgba(244,63,94,0.15)',
    text: 'text-rose-300',
    btn: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20',
    gradient: 'from-rose-600/15 via-rose-600/5 to-transparent',
    accent: '#f43f5e'
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

  const [isPostMatchModalOpen, setIsPostMatchModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [isEditingTeamNames, setIsEditingTeamNames] = useState(false);
  const [editingNames, setEditingNames] = useState({ A: '', B: '' });
  const [showChat, setShowChat] = useState(false);
  const [venueAliasCbu, setVenueAliasCbu] = useState<string | null>(null);
  const [venueHasMP, setVenueHasMP] = useState<boolean | null>(null); 
  const [venueInfo, setVenueInfo] = useState<any>(null);

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

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black italic uppercase leading-[0.85] tracking-[-0.051em] text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-kanit">
              {venueName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-12 gap-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-base font-black text-white/90 italic uppercase tracking-tighter">
                  {formatDate(match.date)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-base font-black text-white/90 italic">
                  {formatTime(match.time)}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <MapPin className="w-4 h-4 text-white/50" />
                </div>
                <span className="text-xs font-bold text-white/40 italic">{match.location}</span>
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
              {/* Header */}
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
                  )}
                </div>
              </div>

              {/* Unassigned bench */}
              {unassigned.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[1.8rem] border border-foreground/[0.07] bg-foreground/[0.02] p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-foreground/30" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black italic uppercase tracking-tighter text-foreground">
                        Banquillo de Espera
                      </h3>
                      <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest">
                        Sin equipo asignado
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 px-1">
                    {unassigned.map((p: any) => (
                      <div key={p.id} className="relative group/slot">
                         <PlayerSlot participant={p} isSelf={p.user_id === user?.id} />
                         {isCreator && !isCompleted && (
                            <div className="absolute top-0 right-0 z-50 flex flex-col gap-1 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => handleMovePlayer(p.user_id, 'A')}
                                 className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90"
                                 title="Mover al Equipo A"
                               >
                                  <ChevronRight className="w-3 h-3 -rotate-90" />
                               </button>
                               <button 
                                 onClick={() => handleMovePlayer(p.user_id, 'B')}
                                 className="w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90"
                                 title="Mover al Equipo B"
                               >
                                  <ChevronRight className="w-3 h-3 rotate-90" />
                               </button>
                            </div>
                         )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── JOIN MATCH BUTTON for public matches (non-joined players) ── */}
              {user && !hasJoined && !match.is_private && !match.is_recruitment && !isCompleted && !isFull && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-primary/5 p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
                  <div className="relative flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-black shrink-0">
                      <UserPlus className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter">
                        ¿Querés jugar?
                      </h3>
                      <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mt-1">
                        Unite al banquillo y esperá asignación de equipo
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinTeam(null)}
                      disabled={joinMutation.isPending}
                      className="shrink-0 h-14 px-10 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {joinMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          Unirme al Partido
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Team panels / Recruitment View */}
              {match.is_recruitment ? (
                <div className="space-y-6">
                   <div className="p-8 rounded-[2.5rem] bg-amber-500/[0.03] border border-amber-500/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3 text-center sm:text-left">
                           <div className="flex items-center justify-center sm:justify-start gap-2">
                              <Zap className="w-5 h-5 text-amber-500" />
                              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                                Objetivo: {match.missing_players} {match.missing_players === 1 ? 'Refuerzo' : 'Refuerzos'}
                              </h3>
                           </div>
                           <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest max-w-sm">
                              Este partido ya tiene jugadores confirmados fuera de la plataforma. 
                              Estamos buscando {match.missing_players} jugadores más para completar.
                           </p>
                        </div>
                        
                        <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                           <div className="flex items-center gap-3">
                              <div className="flex -space-x-3">
                                {confirmedParticipants.map((p: any, i: number) => (
                                   <div key={p.id} className="w-10 h-10 rounded-full border-2 border-background bg-surface overflow-hidden relative" style={{ zIndex: 10 - i }}>
                                      {p.profiles?.avatar_url ? (
                                        <img src={p.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black">{p.profiles?.name?.[0].toUpperCase()}</div>
                                      )}
                                   </div>
                                ))}
                                {Array.from({ length: Math.max(0, match.missing_players - confirmedParticipants.length) }).map((_, i) => (
                                   <div key={i} className="w-10 h-10 rounded-full border-2 border-dashed border-amber-500/20 bg-amber-500/5 flex items-center justify-center">
                                      <Users className="w-4 h-4 text-amber-500/20" />
                                   </div>
                                ))}
                              </div>
                           </div>
                           <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                             {confirmedParticipants.length} UNIDOS · {match.missing_players - confirmedParticipants.length} POR CUBRIR
                           </span>
                        </div>
                      </div>
                      
                      {!hasJoined && !isFull && !isCompleted && (
                        <div className="mt-8">
                           <button 
                             onClick={() => handleJoinTeam('A')}
                             disabled={joinMutation.isPending}
                             className="w-full h-16 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_15px_40px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                           >
                             {joinMutation.isPending ? (
                               <Loader2 className="w-6 h-6 animate-spin" />
                             ) : (
                               <>
                                 <PlusCircle className="w-5 h-5" />
                                 Cubrir Vacante Ahora
                               </>
                             )}
                           </button>
                        </div>
                      )}

                      {hasJoined && !isCompleted && (
                        <div className="mt-8 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-3">
                           <Check className="w-5 h-5 text-primary" />
                           <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ya estás anotado como refuerzo</span>
                        </div>
                      )}
                   </div>

                   {/* List of Joined Recruitment Players */}
                   {confirmedParticipants.length > 0 && (
                      <div className="space-y-4">
                        <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em] px-1">
                          Refuerzos via Pelotify
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {confirmedParticipants.map((p: any) => (
                             <div key={p.id} className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5 flex items-center gap-4">
                                <PlayerSlot participant={p} isSelf={p.user_id === user?.id} />
                                <div className="flex flex-col">
                                   <span className="text-xs font-black italic uppercase text-foreground">{p.profiles?.name}</span>
                                   <span className="text-[8px] font-bold text-primary uppercase tracking-widest">CONFIRMADO</span>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                   )}
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
                        'relative rounded-[2rem] border-2 p-6 transition-all duration-500 overflow-hidden',
                        isMine
                          ? `${cfg.borderActive} ${cfg.shadow}`
                          : `${cfg.border} hover:border-opacity-50`,
                        'bg-foreground/[0.02]'
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
                              <PlayerSlot
                                participant={participant}
                                isSelf={participant?.user_id === user?.id}
                              />
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

export default function MatchLobbyPage() {
  return (
    <Suspense fallback={<MatchSkeleton />}>
      <MatchLobbyContent />
    </Suspense>
  );
}
