'use client';

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, ArrowLeft, Loader2, DollarSign, Zap, Shield, LogOut, Trash2, Video, Trophy, X, UserPlus, Star, ChevronRight, Activity, Check, PlusCircle, Sparkles, User2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getMatchById, Match, MatchParticipant, joinMatch, switchTeam, deleteMatch, leaveMatch, invitePlayer, respondToInvitation, getMatchStats } from '@/lib/matches';
import { getFriends, FriendshipData } from '@/lib/friends';
import { useAuth } from '@/contexts/AuthContext';
import { ROSARIO_VENUES, findVenueByLocation } from '@/lib/venues';
import { cn } from '@/lib/utils';
import PlayerSlot from '@/components/PlayerSlot';
import PostMatchView from '@/components/PostMatchView';
import PostMatchModal from '@/components/PostMatchModal';
import { MatchSkeleton } from '@/components/Skeletons';
import dynamic from 'next/dynamic';
import ChatRoom from '@/components/ChatRoom';

const VenueMap = dynamic(() => import('@/components/VenueMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-80 bg-foreground/5 rounded-[3rem] animate-pulse flex items-center justify-center border border-foreground/10">
            <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
        </div>
    )
});

function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const [, month, day] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
}

function formatTime(timeStr: string) {
    if (!timeStr) return '';
    return timeStr.split(':').slice(0, 2).join(':');
}

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

    const fetchMatch = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await getMatchById(id as string);
            setMatch(data);
            
            if (data.is_completed) {
                try {
                    const stats = await getMatchStats(data.id);
                    setMatchStats(stats);
                } catch (statsErr) {
                    console.error('Error fetching match stats:', statsErr);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchMatch(); }, [id]);

    const participants: MatchParticipant[] = match?.participants || [];
    const confirmedParticipants = participants.filter(p => p.status === 'confirmed');
    
    const myEntry = participants.find((p) => p.user_id === user?.id);
    const hasJoined = !!myEntry;
    const isConfirmed = myEntry?.status === 'confirmed';
    const myTeam = myEntry?.team;

    const teamSize = match?.type === 'F5' ? 5 : match?.type === 'F7' ? 7 : 11;
    const totalPlayers = teamSize * 2;
    const teamA = confirmedParticipants.filter(p => p.team === 'A');
    const teamB = confirmedParticipants.filter(p => p.team === 'B');
    const unassigned = confirmedParticipants.filter(p => !p.team);

    const handleJoinTeam = async (team: 'A' | 'B' | null) => {
        if (!user || !match) return;
        setActionLoading(team);
        try {
            if (!hasJoined) {
                await joinMatch(match.id, user.id, team);
            } else {
                if (myEntry?.status === 'pending') {
                    await respondToInvitation(myEntry.id, 'confirmed');
                }
                if (myTeam !== team) {
                    await switchTeam(match.id, user.id, team);
                }
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
        if (!user || !match || !confirm('¿Eliminar este partido? Esta acción no se puede deshacer.')) return;
        setActionLoading('delete');
        try {
            await deleteMatch(match.id);
            router.replace('/search');
        } catch (err: any) {
            alert(`Error al eliminar: ${err.message}`);
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
                const f = await getFriends(user.id);
                setFriends(f);
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

    if (isLoading) return <MatchSkeleton />;

    const isMatchPrivate = match?.is_private;
    const isCreator = user?.id === match?.creator_id;
    const isInvolved = user && match?.participants?.some((p: any) => p.user_id === user.id);

    if (isMatchPrivate && !isCreator && !isInvolved) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6 bg-background">
                <Shield className="w-16 h-16 text-primary animate-pulse" />
                <div className="space-y-2">
                    <p className="font-black text-2xl text-foreground italic uppercase tracking-tighter">PARTIDO PRIVADO</p>
                    <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                        Este encuentro es exclusivo. Necesitás una invitación del organizador para participar.
                    </p>
                </div>
                <Link href="/search" className="h-14 px-10 bg-foreground/5 border border-foreground/10 text-foreground font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-foreground/10 transition-all flex items-center justify-center">
                    Volver a Búsqueda
                </Link>
            </div>
        );
    }

    if (error || !match) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6 bg-background">
            <Shield className="w-16 h-16 text-foreground/10" />
            <div className="space-y-2">
                <p className="font-black text-2xl text-foreground italic uppercase tracking-tighter leading-none">PARTIDO NO ENCONTRADO</p>
                <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest italic">{error || 'El partido ha sido cancelado o movido.'}</p>
            </div>
            <Link href="/search" className="px-8 py-3 bg-foreground/5 border border-foreground/10 text-foreground font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-foreground/10 transition-all">Volver a Búsqueda</Link>
        </div>
    );

    const isFull = confirmedParticipants.length >= totalPlayers;
    const matchTime = match ? new Date(`${match.date}T${match.time}`) : null;
    const isPast = matchTime ? new Date() > new Date(matchTime.getTime() + 60 * 60 * 1000) : false;
    const isCompleted = match?.is_completed || isPast || (matchStats && matchStats.goalScorers.length > 0);
    const userParticipant = user ? participants.find(p => p.user_id === user.id) : null;

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 relative">
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/3 blur-[120px] rounded-full" />
            </div>

            <div className="relative h-[45dvh] lg:h-[55dvh] w-full shrink-0 overflow-hidden bg-black">
                <div className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between pointer-events-none">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 lg:w-14 lg:h-14 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center text-white transition-all hover:bg-black/40 active:scale-90 pointer-events-auto"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <div className="px-5 py-2 lg:px-6 lg:py-2.5 bg-primary rounded-2xl border border-primary/20 shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                            <span className="text-black font-black text-[10px] uppercase tracking-[0.25em] italic">
                                {match.type} · PREMIER
                            </span>
                        </div>
                        {match.is_private && (
                            <div className="px-5 py-2 lg:px-6 lg:py-2.5 bg-accent/20 backdrop-blur-xl rounded-2xl border border-accent/30 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-accent" />
                                <span className="text-accent font-black text-[10px] uppercase tracking-[0.25em] italic">PRIVADO</span>
                            </div>
                        )}
                    </div>
                </div>

                <motion.img
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"
                    alt="Stadium"
                    className="w-full h-full object-cover grayscale brightness-[0.4]"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                
                <div className="absolute bottom-20 left-8 right-8 lg:left-24 lg:right-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6 max-w-4xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="px-5 py-2 glass-premium rounded-xl border border-primary/20 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                <span className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] italic leading-none">Panel del Partido</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-4xl lg:text-7xl font-black text-foreground leading-[0.85] italic uppercase tracking-tighter drop-shadow-2xl">
                                {(() => {
                                    const venue = findVenueByLocation(match.location);
                                    return venue?.displayName || venue?.name || match.location;
                                })()}
                            </h1>
                            <div className="flex flex-wrap items-center gap-8 lg:gap-12 pt-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Localidad (Dirección)</span>
                                    <span className="flex items-center gap-2 text-sm font-black text-foreground italic tracking-tighter">
                                        <MapPin className="w-4 h-4 text-primary" /> {match.location}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Formato</span>
                                    <span className="flex items-center gap-2 text-sm font-black text-primary italic tracking-tighter">
                                        <Trophy className="w-4 h-4" /> {match.type} Premier
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="glass-premium p-8 rounded-[3rem] border border-foreground/10 hidden lg:block"
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center gap-12">
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                    {isCompleted ? 'Estado Match' : 'Cupos Disponibles'}
                                </span>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    isCompleted 
                                        ? "bg-primary/20 text-primary border border-primary/30"
                                        : isFull 
                                            ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                            : "bg-primary/10 text-primary border border-primary/20"
                                )}>
                                    {isCompleted ? "FINALIZADO" : isFull ? "CUPO LLENO" : "ABIERTOS"}
                                </div>
                            </div>
                            {isCompleted ? (
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-6xl font-black text-foreground italic tracking-tighter leading-none">
                                            {match.team_a_score ?? 0}
                                        </span>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Local</span>
                                    </div>
                                    <span className="text-4xl font-black text-foreground/20 italic">-</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-6xl font-black text-foreground italic tracking-tighter leading-none">
                                            {match.team_b_score ?? 0}
                                        </span>
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mt-1">Visita</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-end gap-2">
                                    <span className="text-6xl font-black text-foreground italic tracking-tighter leading-none">{confirmedParticipants.length}</span>
                                    <span className="text-2xl font-black text-foreground/30 italic tracking-tighter leading-none mb-1">/{totalPlayers}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {isCompleted ? (
                <div className="w-full px-4 lg:px-16 xl:px-24 -mt-8 relative z-20 space-y-8">
                    {!match?.is_completed && isPast && userParticipant && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-premium p-8 rounded-[3rem] border border-primary/30 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_40px_rgba(16,185,129,0.1)]"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30">
                                    <Trophy className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter">Resultados Pendientes</h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsPostMatchModalOpen(true)}
                                className="h-16 px-10 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Star className="w-4 h-4" /> REPORTAR RESULTADO
                            </button>
                        </motion.div>
                    )}
                    <PostMatchView match={match} participants={participants} stats={matchStats || { goalScorers: [], mvp: null }} />
                </div>
            ) : (
                <div className="w-full px-4 lg:px-16 xl:px-24 -mt-8 mb-20 relative z-20 space-y-12">
                    {/* Unassigned Players Section */}
                    {unassigned.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-premium p-8 rounded-[3rem] border border-foreground/10 bg-foreground/[0.02]"
                        >
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/10">
                                        <Users className="w-5 h-5 text-foreground/40" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none">Banquillo de Espera</h3>
                                        <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mt-1">Jugadores inscriptos sin equipo asignado</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-6 px-2">
                                    {unassigned.map((p) => (
                                        <PlayerSlot 
                                            key={p.id} 
                                            participant={p} 
                                            isSelf={p.user_id === user?.id} 
                                        />
                                    ))}
                                    {isConfirmed && !myTeam && (
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[1.8rem] lg:rounded-[2.2rem] border-2 border-dashed border-primary/40 flex items-center justify-center text-primary/40">
                                                <Star className="w-6 h-6 animate-pulse" />
                                            </div>
                                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest italic">Elegí Equipo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        <AnimatePresence>
                            {hasJoined && myEntry?.status === 'pending' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-premium border border-primary/40 p-6 rounded-[2rem] bg-primary/[0.02] relative overflow-hidden group"
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                        <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center text-black border-4 border-black/20 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                            <Trophy className="w-10 h-10 fill-black/10" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left space-y-2">
                                            <h3 className="font-black text-2xl text-foreground italic uppercase tracking-tighter">Te Invitaron a Jugar</h3>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <button
                                                onClick={() => handleInviteResponse('confirmed')}
                                                disabled={actionLoading !== null || match.is_completed}
                                                className="flex-1 md:px-12 h-14 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-white transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {actionLoading === 'A' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '¡Dale!'}
                                            </button>
                                            <button
                                                onClick={() => handleInviteResponse('rejected')}
                                                disabled={actionLoading !== null || match.is_completed}
                                                className="flex-1 md:px-10 h-14 bg-foreground/5 border border-foreground/10 text-foreground/40 font-black uppercase text-xs tracking-widest rounded-2xl hover:text-foreground hover:bg-foreground/10 transition-all"
                                            >
                                                Paso
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                            {(['A', 'B'] as const).map((team) => {
                                const members = team === 'A' ? teamA : teamB;
                                const isMine = myTeam === team;
                                const teamFull = members.length >= teamSize;
                                const canJoin = (!hasJoined || (hasJoined && myEntry?.status === 'pending')) && !teamFull;
                                const canSwitch = hasJoined && isConfirmed && myTeam !== team && !teamFull;

                                return (
                                    <motion.div
                                        key={team}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "glass-premium rounded-[3rem] p-8 border-2 transition-all duration-500 relative overflow-hidden group",
                                            team === 'A' ? "border-blue-500/10 hover:border-blue-500/30" : "border-red-500/10 hover:border-red-500/30",
                                            isMine && (team === 'A' ? "border-blue-500 bg-blue-500/5 shadow-[0_40px_80px_rgba(59,130,246,0.15)]" : "border-red-500 bg-red-500/5 shadow-[0_40px_80px_rgba(239,68,68,0.15)]")
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-2xl transition-transform group-hover:scale-110",
                                                    team === 'A' ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                                                )}>
                                                    {team}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">{team === 'A' ? 'Local' : 'Visitante'}</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">{members.length}/{teamSize} JUGADORES</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-12">
                                            <button
                                                onClick={() => (canJoin || canSwitch) && handleJoinTeam(team)}
                                                disabled={actionLoading !== null || (teamFull && !isMine) || match.is_completed}
                                                className={cn(
                                                    "w-full h-16 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all relative overflow-hidden flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50",
                                                    isMine 
                                                        ? "bg-foreground/5 border border-foreground/10 text-foreground cursor-default"
                                                        : teamFull
                                                            ? "bg-surface border border-foreground/5 text-foreground/20 cursor-not-allowed"
                                                            : (team === 'A' ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20" : "bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/20")
                                                )}
                                            >
                                                {actionLoading === team ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : isMine ? (
                                                    <> <Check className="w-5 h-5" /> Estás Acá </>
                                                ) : teamFull ? (
                                                    "Equipo Lleno"
                                                ) : (
                                                    <> <Zap className="w-5 h-5 fill-current" /> Entrar a Jugar </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                                            {Array.from({ length: teamSize }).map((_, idx) => {
                                                const participant = members[idx];
                                                return <PlayerSlot key={idx} participant={participant} isSelf={participant?.user_id === user?.id} />;
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8 relative">
                        <div className="glass-premium rounded-[3.5rem] p-8 border border-foreground/10 space-y-10 relative overflow-hidden group/stats">
                             <div className="space-y-8 relative z-10">
                                <div className="space-y-4">
                                    {[
                                        { icon: Calendar, label: 'Fecha', value: formatDate(match.date), color: 'text-primary' },
                                        { icon: Clock, label: 'Hora', value: formatTime(match.time), color: 'text-primary' },
                                        { icon: DollarSign, label: 'Precio', value: match.price ? `$${match.price.toLocaleString()}` : 'Gratis', color: 'text-accent' }
                                    ].map(({ icon: Icon, label, value, color }, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/5 transition-all hover:bg-foreground/[0.05]">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-lg bg-surface-elevated border border-foreground/5">
                                                    <Icon className={cn("w-4 h-4", color)} />
                                                </div>
                                                <span className="text-[10px] uppercase font-black tracking-widest text-foreground/40">{label}</span>
                                            </div>
                                            <span className="text-sm font-black text-foreground italic tracking-tighter">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-foreground/10 relative z-10">
                                <div className="grid grid-cols-1 gap-4">
                                    {hasJoined && (
                                        <button
                                            onClick={handleLeave}
                                            disabled={actionLoading !== null || match.is_completed}
                                            className="h-16 bg-foreground/5 border border-foreground/10 rounded-2xl flex items-center justify-center gap-3 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                                        >
                                            <LogOut className="w-5 h-5" /> Bajarme del Partido
                                        </button>
                                    )}
                                    {user?.id === match.creator_id && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={actionLoading !== null || match.is_completed}
                                            className="h-16 bg-foreground/5 border border-foreground/10 rounded-2xl flex items-center justify-center gap-3 text-foreground/40 hover:text-red-600 hover:bg-red-600/10 hover:border-red-600/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                                        >
                                            <Trash2 className="w-5 h-5" /> Suspender Partido
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="glass-premium rounded-[3.5rem] p-8 border border-foreground/10 relative overflow-hidden">
                            <VenueMap location={match.location} lat={match.lat} lng={match.lng} />
                        </div>
                    </div>
                </div>
            </div>
        )}

            {!isCompleted && hasJoined && (
                <div className="w-full px-4 lg:px-16 xl:px-24 pb-12 space-y-12 relative z-20">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4 px-2">
                             <div className="h-0.5 flex-1 bg-foreground/5" />
                             <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">Chat del Lobby</span>
                             <div className="h-0.5 flex-1 bg-foreground/5" />
                        </div>
                        <div className="h-[400px] lg:h-[500px]">
                            <ChatRoom matchId={match.id} />
                        </div>
                    </div>
                </div>
            )}

            {!isCompleted && (
                <div className="w-full px-4 lg:px-16 xl:px-24 pb-32 space-y-12 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-premium rounded-[3.5rem] p-8 lg:p-14 border border-foreground/10 relative overflow-hidden group/recruitment"
                    >
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                            <div className="space-y-4 text-center lg:text-left">
                                <h2 className="text-4xl lg:text-5xl font-black text-foreground italic uppercase tracking-tighter leading-none">Armá la Juntada</h2>
                            </div>
                            <button
                                onClick={handleOpenInviteModal}
                                className="h-24 px-16 bg-primary text-black rounded-[2.5rem] flex items-center justify-center gap-6 group/invite transition-all active:scale-95 shadow-2xl shadow-primary/20 hover:scale-[1.05] hover:bg-white min-w-[350px]"
                            >
                                <UserPlus className="w-8 h-8 group-hover/invite:rotate-12 transition-transform" />
                                <span className="text-lg font-black uppercase tracking-[0.4em]">Convocar Pibes</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ── INVITE MODAL ── */}
            <AnimatePresence>
                {inviteModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setInviteModalOpen(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="w-full max-w-lg glass-premium border border-foreground/10 rounded-[2.5rem] p-8 relative z-10 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">Invitar Pibes</h3>
                                <button onClick={() => setInviteModalOpen(false)} className="w-14 h-14 bg-foreground/5 rounded-2xl flex items-center justify-center text-foreground/40 hover:text-foreground transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {loadingFriends ? (
                                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                                        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    </div>
                                ) : friends.length === 0 ? (
                                    <div className="text-center py-20 px-8 flex flex-col items-center gap-6">
                                        <p className="text-lg font-black text-foreground italic uppercase tracking-tighter">Sin Amigos Aún</p>
                                        <Link href="/friends" onClick={() => setInviteModalOpen(false)} className="h-14 px-10 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl">
                                            Agregar Amigos
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[45vh] overflow-y-auto no-scrollbar pr-4 -mr-4">
                                        {friends.map(f => {
                                            const otherUserId = f.user_id === user?.id ? f.friend_id : f.user_id;
                                            const isAlreadyInMatch = participants.some(p => p.user_id === otherUserId);

                                            return (
                                                <div key={f.id} className="flex items-center justify-between p-5 rounded-[2rem] bg-foreground/5 border border-foreground/10">
                                                    <div className="flex items-center gap-5">
                                                        <span className="font-black text-sm text-foreground uppercase italic tracking-tighter">{f.profiles?.name}</span>
                                                    </div>
                                                    {!isAlreadyInMatch && (
                                                        <button
                                                            onClick={() => handleInviteFriend(otherUserId)}
                                                            disabled={invitingId === otherUserId}
                                                            className="h-12 px-8 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-2xl"
                                                        >
                                                            {invitingId === otherUserId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'INVITAR'}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            {isPostMatchModalOpen && user && (
                <PostMatchModal
                    matchId={match.id}
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
