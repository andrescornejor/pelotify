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
  Shuffle,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  getMatchById,
  Match,
  MatchParticipant,
  joinMatch,
  switchTeam,
  deleteMatch,
  leaveMatch,
  invitePlayer,
  respondToInvitation,
  getMatchStats,
  updateMatch,
  autoBalanceTeams,
} from '@/lib/matches';
import { getFriends, FriendshipData } from '@/lib/friends';
import { useAuth } from '@/contexts/AuthContext';
import { findVenueByLocation } from '@/lib/venues';
import { cn } from '@/lib/utils';
import PlayerSlot from '@/components/PlayerSlot';
import PostMatchView from '@/components/PostMatchView';
import PostMatchModal from '@/components/PostMatchModal';
import { MatchSkeleton } from '@/components/Skeletons';
import dynamic from 'next/dynamic';
import ChatRoom from '@/components/ChatRoom';
import { MatchPromotionShare } from '@/components/MatchPromotionShare';

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

// ── MINI PITCH SVG ──────────────────────────────────────────────────────────
function MiniPitch({ type }: { type: string }) {
  const isF5 = type === 'F5';
  const isF11 = type === 'F11';
  return (
    <svg
      viewBox="0 0 120 80"
      className="w-full h-full opacity-100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="118"
        height="78"
        rx="3"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      <line x1="60" y1="1" x2="60" y2="79" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <circle cx="60" cy="40" r="12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <circle cx="60" cy="40" r="1.5" fill="rgba(255,255,255,0.3)" />
      <rect
        x="1"
        y="27"
        width={isF5 ? 6 : isF11 ? 10 : 8}
        height="26"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.8"
      />
      <rect
        x={isF5 ? 113 : isF11 ? 109 : 111}
        y="27"
        width={isF5 ? 6 : isF11 ? 10 : 8}
        height="26"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.8"
      />
      {!isF5 && (
        <>
          <rect
            x="1"
            y="18"
            width={isF11 ? 24 : 18}
            height="44"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.8"
          />
          <rect
            x={isF11 ? 95 : 101}
            y="18"
            width={isF11 ? 24 : 18}
            height="44"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.8"
          />
        </>
      )}
    </svg>
  );
}

// ── TEAM COLORS ───────────────────────────────────────────────────────────────
const TEAM_CONFIG = {
  A: {
    bg: 'bg-blue-600',
    border: 'border-blue-500/20',
    borderActive: 'border-blue-500',
    shadow: 'shadow-[0_30px_60px_rgba(59,130,246,0.15)]',
    glow: 'rgba(59,130,246,0.2)',
    text: 'text-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30',
    gradient: 'from-blue-600/10 to-transparent',
  },
  B: {
    bg: 'bg-red-600',
    border: 'border-red-500/20',
    borderActive: 'border-red-500',
    shadow: 'shadow-[0_30px_60px_rgba(239,68,68,0.15)]',
    glow: 'rgba(239,68,68,0.2)',
    text: 'text-red-400',
    btn: 'bg-red-600 hover:bg-red-500 shadow-red-600/30',
    gradient: 'from-red-600/10 to-transparent',
  },
} as const;

function MatchLobbyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = searchParams.get('id');

  const [match, setMatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostMatchModalOpen, setIsPostMatchModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'A' | 'B' | 'delete' | 'leave' | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [matchStats, setMatchStats] = useState<any>(null);
  const [friends, setFriends] = useState<FriendshipData[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [isEditingTeamNames, setIsEditingTeamNames] = useState(false);
  const [editingNames, setEditingNames] = useState({ A: '', B: '' });
  const [isSavingNames, setIsSavingNames] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isBalancing, setIsBalancing] = useState(false);

  const fetchMatch = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getMatchById(id as string);
      setMatch(data);
      setEditingNames({ A: data.team_a_name || 'Local', B: data.team_b_name || 'Visitante' });
      if (data.is_completed) {
        try {
          setMatchStats(await getMatchStats(data.id));
        } catch {}
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const participants: MatchParticipant[] = match?.participants || [];
  const confirmedParticipants = participants.filter((p) => p.status === 'confirmed');
  const myEntry = participants.find((p) => p.user_id === user?.id);
  const hasJoined = !!myEntry;
  const isConfirmed = myEntry?.status === 'confirmed';
  const myTeam = myEntry?.team;
  const teamSize = match?.type === 'F5' ? 5 : match?.type === 'F7' ? 7 : 11;
  const totalPlayers = teamSize * 2;
  const teamA = confirmedParticipants.filter((p) => p.team === 'A');
  const teamB = confirmedParticipants.filter((p) => p.team === 'B');
  const unassigned = confirmedParticipants.filter((p) => !p.team);

  const handleJoinTeam = async (team: 'A' | 'B' | null) => {
    if (!user || !match) return;
    setActionLoading(team);
    try {
      if (!hasJoined) {
        await joinMatch(match.id, user.id, team);
      } else {
        if (myEntry?.status === 'pending') await respondToInvitation(myEntry.id, 'confirmed');
        if (myTeam !== team) await switchTeam(match.id, user.id, team);
      }
      await fetchMatch();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async () => {
    if (!user || !match || !confirm('¿Salir del partido?')) return;
    setActionLoading('leave');
    try {
      await leaveMatch(match.id, user.id);
      await fetchMatch();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!user || !match || !confirm('¿Eliminar este partido?')) return;
    setActionLoading('delete');
    try {
      await deleteMatch(match.id);
      router.replace('/search');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setActionLoading(null);
    }
  };

  const handleInviteResponse = async (status: 'confirmed' | 'rejected') => {
    if (!user || !myEntry) return;
    setActionLoading(status === 'confirmed' ? 'A' : 'leave');
    try {
      await respondToInvitation(myEntry.id, status);
      await fetchMatch();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenInviteModal = async () => {
    if (!user) return;
    setInviteModalOpen(true);
    if (friends.length === 0) {
      setLoadingFriends(true);
      try {
        setFriends(await getFriends(user.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFriends(false);
      }
    }
  };

  const handleInviteFriend = async (friendId: string) => {
    if (!match) return;
    setInvitingId(friendId);
    try {
      await invitePlayer(match.id, friendId);
      await fetchMatch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInvitingId(null);
    }
  };

  const handleSaveTeamNames = async () => {
    if (!match || !id) return;
    setIsSavingNames(true);
    try {
      await updateMatch(id as string, { team_a_name: editingNames.A, team_b_name: editingNames.B });
      await fetchMatch();
      setIsEditingTeamNames(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSavingNames(false);
    }
  };

  const handleAutoBalance = async () => {
    if (!match || !user || !confirm('¿Armar equipos equitativamente según el Nivel (Elo) de los jugadores confirmados?')) return;
    setIsBalancing(true);
    try {
      const pData = confirmedParticipants.map(p => ({
        id: p.id,
        user_id: p.user_id,
        elo: p.profiles?.overall || 50
      }));
      await autoBalanceTeams(match.id, pData);
      await fetchMatch();
    } catch (err: any) {
      alert(`Error al equilibrar: ${err.message}`);
    } finally {
      setIsBalancing(false);
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

  const isFull = confirmedParticipants.length >= totalPlayers;
  const matchTime = match ? new Date(`${match.date}T${match.time}`) : null;
  const isPast = matchTime ? new Date() > new Date(matchTime.getTime() + 60 * 60 * 1000) : false;
  const isCompleted =
    match?.is_completed || isPast || (matchStats && matchStats.goalScorers.length > 0);
  const userParticipant = user ? participants.find((p) => p.user_id === user.id) : null;

  const venueName = (() => {
    const v = findVenueByLocation(match.location);
    return v?.displayName || v?.name || match.location;
  })();

  const occupancyPct = Math.min(100, (confirmedParticipants.length / totalPlayers) * 100);

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
      <div className="relative w-full h-[42dvh] lg:h-[50dvh] shrink-0 overflow-hidden bg-zinc-950">
        {/* Background image */}
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.02, opacity: 0.35 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1571512599441-bafb1b8b7f21?q=80&w=1400&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />

        {/* Mini pitch overlay in hero */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
          <div className="w-[80%] max-w-md aspect-[3/2]">
            <MiniPitch type={match.type} />
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-zinc-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-transparent" />

        {/* ── TOP BAR ── */}
        <div className="absolute top-0 left-0 right-0 z-20 px-5 lg:px-12 pt-28 lg:pt-24 flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="w-11 h-11 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-black/50 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="px-4 py-1.5 bg-primary rounded-xl border border-primary/30 shadow-[0_5px_20px_rgba(16,185,129,0.3)]">
              <span className="text-black font-black text-[9px] uppercase tracking-[0.35em]">
                {match.type}
              </span>
            </div>
            {match.is_private && (
              <div className="px-4 py-1.5 bg-black/40 backdrop-blur-xl rounded-xl border border-violet-500/30 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-violet-400" />
                <span className="text-violet-400 font-black text-[9px] uppercase tracking-[0.3em]">
                  Privado
                </span>
              </div>
            )}
            {isCompleted && (
              <div className="px-4 py-1.5 bg-black/40 backdrop-blur-xl rounded-xl border border-foreground/20">
                <span className="text-foreground/50 font-black text-[9px] uppercase tracking-[0.3em]">
                  Finalizado
                </span>
              </div>
            )}
            
            {!match.is_private && !isCompleted && (
              <MatchPromotionShare match={match} />
            )}
          </motion.div>
        </div>

        {/* ── MAIN HERO CONTENT ── */}
        <div className="absolute bottom-0 left-0 right-0 px-5 lg:px-12 pb-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="space-y-4"
          >
            {/* Live / Status pill */}
            {!isCompleted && (
              <div className="flex items-center gap-2 w-fit">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping absolute" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full relative" />
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.5em]">
                  Partido Activo
                </span>
              </div>
            )}

            <h1 className="text-[clamp(2.2rem,7vw,5.5rem)] font-black italic uppercase leading-none tracking-tighter text-white drop-shadow-2xl">
              {venueName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary/70" />
                <span className="text-sm font-black text-white/80 italic capitalize">
                  {formatDateLong(match.date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary/70" />
                <span className="text-sm font-black text-white/80 italic">
                  {formatTime(match.time)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary/70" />
                <span className="text-xs font-bold text-white/50 italic">{match.location}</span>
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
              label: 'Jugadores',
              value: `${confirmedParticipants.length}/${totalPlayers}`,
              accent: 'text-primary',
              sub: `${Math.round(occupancyPct)}% ocupado`,
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
                    disabled={actionLoading !== null}
                    className="flex-1 sm:flex-none h-12 px-8 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {actionLoading === 'A' ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      '¡Dale!'
                    )}
                  </button>
                  <button
                    onClick={() => handleInviteResponse('rejected')}
                    disabled={actionLoading !== null}
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
              stats={matchStats || { goalScorers: [], mvp: null }}
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
                    Alineaciones
                  </h2>
                  <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.4em] mt-1">
                    Elegí tu equipo y entrá a jugar
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isCreator && !isCompleted && confirmedParticipants.length > 2 && (
                    <button
                      onClick={handleAutoBalance}
                      disabled={isBalancing}
                      className="h-10 px-4 bg-foreground/[0.05] border border-foreground/10 text-foreground rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all active:scale-95 shadow-sm"
                    >
                      {isBalancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shuffle className="w-3.5 h-3.5 text-primary" />}
                      <span className="hidden sm:inline">Equilibrar</span>
                    </button>
                  )}
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
                      disabled={isSavingNames}
                      className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center border transition-all active:scale-95',
                        isEditingTeamNames
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-foreground/5 border-foreground/10 text-foreground/30 hover:text-primary hover:border-primary/30'
                      )}
                    >
                      {isSavingNames ? (
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
                    {unassigned.map((p) => (
                      <PlayerSlot key={p.id} participant={p} isSelf={p.user_id === user?.id} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Team panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(['A', 'B'] as const).map((team, teamIdx) => {
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
                          disabled={actionLoading !== null || (teamFull && !isMine)}
                          className={cn(
                            'w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 mb-5 shadow-lg',
                            isMine
                              ? 'bg-foreground/5 border border-foreground/10 text-foreground/50 cursor-default'
                              : teamFull
                                ? 'bg-foreground/[0.03] border border-foreground/5 text-foreground/20 cursor-not-allowed'
                                : `${cfg.btn} text-white shadow-lg`
                          )}
                        >
                          {actionLoading === team ? (
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
                        {Array.from({ length: teamSize }).map((_, idx) => {
                          const participant = members[idx];
                          return (
                            <PlayerSlot
                              key={idx}
                              participant={participant}
                              isSelf={participant?.user_id === user?.id}
                            />
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {hasJoined && (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading !== null || match.is_completed}
                    className="w-full h-13 py-3.5 bg-foreground/[0.03] border border-foreground/[0.07] rounded-2xl flex items-center justify-center gap-3 text-foreground/30 hover:text-red-400 hover:bg-red-500/[0.06] hover:border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-[0.98] disabled:opacity-40"
                  >
                    <LogOut className="w-4 h-4" /> Bajarme del partido
                  </button>
                )}
                {isCreator && (
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading !== null || match.is_completed}
                    className="w-full h-13 py-3.5 bg-foreground/[0.03] border border-foreground/[0.07] rounded-2xl flex items-center justify-center gap-3 text-foreground/30 hover:text-red-500 hover:bg-red-600/[0.06] hover:border-red-600/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-[0.98] disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" /> Suspender partido
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

              {/* MAP */}
              <div className="rounded-[2rem] overflow-hidden border border-foreground/[0.07] bg-foreground/[0.02]">
                <div className="px-5 py-4 border-b border-foreground/5 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                    Ubicación
                  </span>
                </div>
                <div className="p-3">
                  <div className="h-56 rounded-xl overflow-hidden">
                    <VenueMap location={match.location} lat={match.lat} lng={match.lng} />
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
                  {friends.map((f) => {
                    const otherUserId = f.user_id === user?.id ? f.friend_id : f.user_id;
                    const participant = participants.find((p) => p.user_id === otherUserId);
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
            fetchMatch();
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
