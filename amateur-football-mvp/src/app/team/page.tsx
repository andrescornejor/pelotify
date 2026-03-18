'use client';

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Trophy, MapPin, Calendar, ArrowLeft, Settings, Save, X, Trash2, LogOut, Camera, ChevronRight, Check, Sparkles, Loader2, PlusCircle, Plus, Search, Swords, Layout } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTeamById, getTeamMembers, getTeamRequests, updateTeam, deleteTeam, Team, leaveTeam, joinTeam, inviteToTeam, respondToTeamInvitation } from '@/lib/teams';
import { getTeamChallenges, respondToChallenge, TeamChallenge } from '@/lib/teamChallenges';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

import { uploadTeamLogo } from '@/lib/storage';
import { getFriends } from '@/lib/friends';
import { cn } from '@/lib/utils';
import TeamTactics from '@/components/TeamTactics';
import { getDominantColor } from '@/lib/colorUtils';

function TeamProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    
    // Get ID from query param ?id=...
    const id = searchParams.get('id');
    
    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ambientColor, setAmbientColor] = useState<string | null>(null);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editMotto, setEditMotto] = useState('');
    const [editLogoUrl, setEditLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Advanced Data
    const [trophies, setTrophies] = useState<any[]>([]);
    const [teamMatches, setTeamMatches] = useState<any[]>([]);

    // Invitation state
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [friends, setFriends] = useState<any[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [invitingId, setInvitingId] = useState<string | null>(null);
    const [respondingId, setRespondingId] = useState<string | null>(null);

    const [challenges, setChallenges] = useState<TeamChallenge[]>([]);
    const [loadingChallenges, setLoadingChallenges] = useState(false);
    const [respondingChallengeId, setRespondingChallengeId] = useState<string | null>(null);

    // Join Requests State (for Captains)
    const [joinRequests, setJoinRequests] = useState<any[]>([]);
    const [isJoining, setIsJoining] = useState(false);

    // Navigation State
    const [activeTab, setActiveTab] = useState<'squad' | 'tactics' | 'history'>('squad');

    const isCaptain = user?.id === team?.captain_id;

    const fetchData = async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            // First fetch team core data
            try {
                const teamData = await getTeamById(id as string);
                setTeam(teamData);
                setEditName(teamData.name);
                setEditDesc(teamData.description || '');
                setEditMotto(teamData.motto || '');
                setEditLogoUrl(teamData.logo_url || '');
            } catch (teamErr: any) {
                console.error('Error fetching team core data:', teamErr);
                throw new Error(`No se pudo encontrar el equipo: ${teamErr.message}`);
            }

            // Fetch Trophies
            try {
                const { getTeamTrophies } = await import('@/lib/teams');
                const trophiesData = await getTeamTrophies(id as string);
                setTrophies(trophiesData);
            } catch (trophiesErr) {
                console.warn('Error fetching trophies:', trophiesErr);
            }

            // Fetch Team Matches (History)
            try {
                const { getMatches } = await import('@/lib/matches');
                const allMatches = await getMatches();
                const filtered = allMatches.filter(m => m.team_a_id === id || m.team_b_id === id);
                setTeamMatches(filtered);
            } catch (matchesErr) {
                console.warn('Error fetching team match history:', matchesErr);
            }

            // Then fetch members
            try {
                const membersData = await getTeamMembers(id as string);
                setMembers(membersData);
            } catch (membersErr: any) {
                console.warn('Error fetching team members:', membersErr);
            }

            // Then fetch challenges
            try {
                const challengesData = await getTeamChallenges(id as string, 'challenged');
                setChallenges(challengesData.filter(c => c.status === 'pending'));
            } catch (challengesErr: any) {
                console.warn('Error fetching team challenges:', challengesErr);
            }

            // Then fetch join requests if captain
            if (user?.id === teamData.captain_id) {
                try {
                    const requests = await getTeamRequests(id as string);
                    setJoinRequests(requests);
                } catch (reqErr) {
                    console.warn('Error fetching join requests:', reqErr);
                }
            }
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Error desconocido al cargar el equipo');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (team?.logo_url) {
            getDominantColor(team.logo_url).then(color => {
                if (color) setAmbientColor(color);
            });
        }
    }, [team?.logo_url]);

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (inviteModalOpen && user) {
            fetchFriends();
        }
    }, [inviteModalOpen, user]);

    const fetchFriends = async () => {
        if (!user) return;
        setLoadingFriends(true);
        try {
            const data = await getFriends(user.id);
            setFriends(data);
        } catch (err) {
            console.error('Error fetching friends:', err);
        } finally {
            setLoadingFriends(false);
        }
    };

    const handleInviteFriend = async (friendId: string) => {
        if (!team) return;
        setInvitingId(friendId);
        try {
            await inviteToTeam(team.id, friendId);
            await fetchData();
            alert('¡Invitación enviada!');
        } catch (err: any) {
            alert(err.message || 'Error al enviar invitación');
        } finally {
            setInvitingId(null);
        }
    };

    const handleRespondInvitation = async (action: 'accept' | 'decline', targetUserId?: string) => {
        if (!team || !user) return;
        const actingUserId = targetUserId || user.id;
        setRespondingId(actingUserId);
        try {
            await respondToTeamInvitation(team.id, actingUserId, action);
            await fetchData();
            if (action === 'accept') {
                alert(targetUserId ? 'Jugador aceptado.' : '¡Ya sos parte del equipo!');
            } else {
                alert(targetUserId ? 'Solicitud rechazada.' : 'Has rechazado la invitación.');
                if (!targetUserId) router.push('/teams');
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setRespondingId(null);
        }
    };

    const handleRespondChallenge = async (challengeId: string, status: 'accepted' | 'declined') => {
        setRespondingChallengeId(challengeId);
        try {
            await respondToChallenge(challengeId, status);
            alert(`Desafío ${status === 'accepted' ? 'ACEPTADO. Tienen partido nuevo.' : 'RECHAZADO'}`);
            fetchData();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setRespondingChallengeId(null);
        }
    };

    const handleSaveTeam = async () => {
        if (!team) return;
        setIsSaving(true);
        try {
            let finalLogoUrl = editLogoUrl;

            if (logoFile) {
                finalLogoUrl = await uploadTeamLogo(logoFile, editName || team.name);
            }

            await updateTeam(team.id, {
                name: editName,
                description: editDesc,
                motto: editMotto,
                logo_url: finalLogoUrl
            });
            await fetchData();
            setLogoFile(null);
            setLogoPreview(null);
            setIsEditing(false);
            alert('¡Equipo actualizado!');
        } catch (err: any) {
            alert(`Error al guardar: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!team || !confirm('¿Estás SEGURO de que quieres eliminar este equipo? Esta acción no se puede deshacer.')) return;
        try {
            await deleteTeam(team.id);
            alert('Equipo eliminado.');
            router.push('/teams');
        } catch (err: any) {
            alert(`Error al eliminar: ${err.message}`);
        }
    };

    const handleLevelTeamAction = async () => {
        if (!team || !user || !confirm('¿Quieres salir de este equipo?')) return;
        try {
            await leaveTeam(team.id, user.id);
            alert('Has salido del equipo.');
            router.push('/teams');
        } catch (err: any) {
            alert(`Error al salir: ${err.message}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p>Cargando información del equipo...</p>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center border border-dashed border-zinc-700">
                    <Shield className="w-10 h-10 text-zinc-600" />
                </div>
                <div className="max-w-xs">
                    <h2 className="text-xl font-bold text-white mb-2">Equipo no encontrado</h2>
                    <p className="text-sm text-zinc-500 mb-4">
                        {error ? `Detalles: ${error}` : 'Este equipo no existe o aún no ha sido configurado.'}
                    </p>
                </div>
                <Link href="/teams" className="px-6 py-2 bg-primary text-black font-bold rounded-xl mt-2 transition-transform active:scale-95">
                    Ir a Equipos
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen pb-24 bg-background selection:bg-primary selection:text-background">
            {/* ── CINEMATIC HERO SECTION ── */}
            <div className="relative h-[45dvh] min-h-[400px] overflow-hidden group">
                <div className="absolute inset-0 bg-surface">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-background z-10" />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className={cn("absolute inset-0", !ambientColor && "bg-[radial-gradient(circle_at_50%_-20%,rgba(var(--primary-rgb),0.15),transparent_70%)]")}
                        style={ambientColor ? { backgroundImage: `radial-gradient(circle at 50% -20%, ${ambientColor}, transparent 70%)` } : undefined}
                    />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
                    <div 
                        className={cn("absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse", !ambientColor && "bg-primary/5")} 
                        style={ambientColor ? { backgroundColor: ambientColor } : undefined}
                    />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-pulse delay-700" />
                </div>

                <div className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-center bg-gradient-to-b from-background/80 to-transparent">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 flex items-center justify-center bg-foreground/5 backdrop-blur-2xl rounded-2xl border border-foreground/10 text-foreground hover:bg-foreground/10 hover:border-primary/50 transition-all active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-3">
                        {isCaptain && (
                            <div className="flex gap-3">
                                {isEditing ? (
                                    <button
                                        onClick={handleSaveTeam}
                                        disabled={isSaving}
                                        className="h-12 px-6 bg-primary text-background rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-foreground hover:text-background transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> GUARDAR</>}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-12 h-12 flex items-center justify-center bg-foreground/5 backdrop-blur-2xl rounded-2xl border border-foreground/10 text-foreground hover:bg-foreground/10 transition-all active:scale-90"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                        {!isCaptain && members.some(m => m.user_id === user?.id) && (
                            <button
                                onClick={handleLevelTeamAction}
                                className="w-12 h-12 flex items-center justify-center bg-red-500/10 backdrop-blur-2xl rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all active:scale-90 shadow-lg shadow-red-500/5"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20">
                    <div className="relative mb-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-32 h-32 md:w-40 md:h-40 bg-surface-elevated rounded-[2.5rem] border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden group shadow-primary/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent z-10" />

                            {(logoPreview || team.logo_url) ? (
                                <img
                                    src={logoPreview || team.logo_url}
                                    alt={team.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <Shield className="w-16 h-16 text-primary group-hover:rotate-12 transition-transform duration-500" />
                            )}

                            {isEditing && (
                                <label className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm cursor-pointer hover:bg-background/40 transition-all text-foreground border-4 border-dashed border-primary/20 rounded-[2rem] m-2">
                                    <Camera className="w-8 h-8 mb-2 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Actualizar</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setLogoFile(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => setLogoPreview(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                </label>
                            )}
                        </motion.div>
                        <div className="absolute -inset-4 border border-primary/20 rounded-[3.5rem] animate-[spin_20s_linear_infinite] pointer-events-none opacity-30" />
                    </div>

                    <div className="text-center space-y-4 max-w-2xl px-6">
                        {isEditing ? (
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-16 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-6 text-2xl font-black text-foreground italic uppercase tracking-tighter text-center focus:border-primary/50 outline-none w-full shadow-inner"
                                    placeholder="Nombre del club"
                                />
                                <input
                                    type="text"
                                    value={editMotto}
                                    onChange={(e) => setEditMotto(e.target.value)}
                                    className="bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-6 py-3 text-primary text-xs font-black uppercase tracking-widest text-center focus:border-primary/30 outline-none w-full shadow-inner"
                                    placeholder="Lema del equipo..."
                                />
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-6 py-4 text-foreground/50 text-sm italic text-center focus:border-primary/30 outline-none min-h-[100px] shadow-inner"
                                    placeholder="Descripción del club..."
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-5xl md:text-7xl font-black text-foreground italic uppercase tracking-[-0.05em] leading-[0.85] drop-shadow-lg"
                                >
                                    {team.name}
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xs md:text-sm text-foreground/50 flex flex-col items-center justify-center gap-2 uppercase font-black tracking-[0.3em] italic"
                                >
                                    {team.motto && (
                                        <span className="text-primary text-[10px] mb-1 tracking-[0.5em]">"{team.motto}"</span>
                                    )}
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-center">{team.description || "Institución Deportiva Federada"}</span>
                                    </div>
                                </motion.p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-12 relative z-30">
                <div className="max-w-4xl mx-auto glass-premium rounded-[3rem] p-1 flex flex-wrap items-center justify-between border border-foreground/10 shadow-2xl bg-surface">
                    <div className="flex-1 min-w-[100px] flex flex-col items-center py-6 px-4 border-r border-foreground/5">
                        <span className="text-3xl font-black text-primary italic tracking-tighter">{team.elo}</span>
                        <span className="text-[9px] font-black uppercase text-foreground/60 tracking-widest mt-1">XP DEL CLUB</span>
                    </div>
                    <div className="flex-1 min-w-[100px] flex flex-col items-center py-6 px-4 border-r border-foreground/5">
                        <span className="text-3xl font-black text-foreground italic tracking-tighter">{team.wins || 0}</span>
                        <span className="text-[9px] font-black uppercase text-foreground/60 tracking-widest mt-1">VICTORIAS</span>
                    </div>
                    <div className="flex-1 min-w-[100px] flex flex-col items-center py-6 px-4 border-r border-foreground/5">
                        <span className="text-3xl font-black text-foreground italic tracking-tighter">{team.draws || 0}</span>
                        <span className="text-[9px] font-black uppercase text-foreground/60 tracking-widest mt-1">EMPATES</span>
                    </div>
                    <div className="flex-1 min-w-[100px] flex flex-col items-center py-6 px-4">
                        <span className="text-3xl font-black text-foreground italic tracking-tighter">{team.losses || 0}</span>
                        <span className="text-[9px] font-black uppercase text-foreground/60 tracking-widest mt-1">DERROTAS</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 mt-10 md:mt-12">
                <div className="flex p-1.5 bg-foreground/5 backdrop-blur-3xl rounded-[2.5rem] border border-foreground/5 gap-1 shadow-inner">
                    {[
                        { id: 'squad', label: 'Plantel', icon: Users },
                        { id: 'tactics', label: 'Tácticas', icon: Layout },
                        { id: 'history', label: 'Historial', icon: Calendar }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 h-12 md:h-14 rounded-[2rem] flex items-center justify-center gap-2.5 transition-all duration-500 relative overflow-hidden",
                                activeTab === tab.id 
                                    ? "bg-primary text-background font-black italic shadow-xl shadow-primary/20" 
                                    : "text-foreground/40 hover:text-foreground/70 hover:bg-foreground/[0.02] italic uppercase text-[9px] md:text-[10px] font-black tracking-widest"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4 md:w-5 md:h-5", activeTab === tab.id ? "text-background" : "text-foreground/20")} />
                            <span className={cn(
                                "transition-all duration-300",
                                activeTab === tab.id ? "text-[11px] md:text-sm" : "hidden sm:inline"
                            )}>
                                {tab.label}
                            </span>
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTabGlow"
                                    className="absolute inset-0 bg-white/10 pointer-events-none"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 mt-12 space-y-12 max-w-4xl mx-auto w-full">
                {!isCaptain && !members.some(m => m.user_id === user?.id && m.status === 'confirmed') && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium p-8 rounded-[3rem] border border-primary/20 bg-primary/[0.02]"
                    >
                        {members.some(m => m.user_id === user?.id && m.status === 'pending') ? (
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/30">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter">¡Convocatoria Recibida!</h3>
                                    <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest leading-relaxed">El club te quiere en sus filas. ¿Estás listo para el desafío?</p>
                                </div>
                                <div className="flex gap-4 w-full max-w-sm">
                                    <button
                                        onClick={() => handleRespondInvitation('decline')}
                                        disabled={respondingId === user?.id}
                                        className="flex-1 h-14 bg-foreground/[0.03] border border-foreground/10 rounded-2xl text-[10px] font-black text-foreground/50 uppercase tracking-widest hover:text-foreground transition-all active:scale-95"
                                    >
                                        DECLINAR
                                    </button>
                                    <button
                                        onClick={() => handleRespondInvitation('accept')}
                                        disabled={respondingId === user?.id}
                                        className="flex-1 h-14 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-all active:scale-95 shadow-xl shadow-primary/20"
                                    >
                                        {respondingId === user?.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'ACEPTAR CUPO'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={async () => {
                                    if (!user || !id) return;
                                    setIsJoining(true);
                                    try {
                                        await joinTeam(id, user.id);
                                        await fetchData();
                                        alert('Solicitud enviada al capitán.');
                                    } catch (err: any) {
                                        alert(`Error: ${err.message}`);
                                    } finally {
                                        setIsJoining(false);
                                    }
                                }}
                                disabled={isJoining || members.some(m => m.user_id === user?.id && m.status === 'pending')}
                                className={cn(
                                    "w-full h-14 md:h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3",
                                    members.some(m => m.user_id === user?.id && m.status === 'pending')
                                        ? "bg-foreground/10 text-foreground/40 cursor-not-allowed border border-foreground/5"
                                        : "bg-primary text-background hover:bg-foreground hover:text-background shadow-primary/10"
                                )}
                            >
                                {isJoining ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : members.some(m => m.user_id === user?.id && m.status === 'pending') ? (
                                    <>SOLICITUD ENVIADA</>
                                ) : (
                                    <><Plus className="w-5 h-5" /> <span className="truncate">SOLICITAR INGRESO</span></>
                                )}
                            </button>
                        )}
                    </motion.div>
                )}

                {activeTab === 'squad' && (
                    <section className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-foreground/[0.03] flex items-center justify-center border border-foreground/10 text-foreground/50">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Plantel Oficial</h2>
                                    <span className="text-[9px] font-black text-foreground/60 uppercase tracking-widest">EL EQUIPO TIENE {team.members_count} PIBES</span>
                                </div>
                            </div>

                            {isCaptain && (
                                <button
                                    onClick={() => setInviteModalOpen(true)}
                                    className="h-11 md:h-12 px-4 md:px-6 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center gap-2"
                                >
                                    <PlusCircle className="w-4 h-4" /> 
                                    <span className="hidden sm:inline">CONVOCAR</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {members.filter(m => m.status === 'confirmed').map((member: any) => (
                                <Link key={member.user_id} href={`/profile?id=${member.user_id}`}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="glass-premium bg-surface border-foreground/5 p-6 rounded-[2.5rem] flex items-center justify-between hover:border-primary/20 hover:bg-foreground/[0.03] transition-all group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-[1.8rem] overflow-hidden border-2 border-surface-elevated shadow-2xl bg-surface-elevated">
                                                    {member.profiles?.avatar_url ? (
                                                        <img src={member.profiles.avatar_url} alt={member.profiles.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40 font-black text-3xl italic">
                                                            {member.profiles?.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                {member.role === 'captain' && (
                                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-primary flex items-center justify-center border-4 border-surface shadow-xl shadow-primary/30">
                                                        <Trophy className="w-3 h-3 text-background" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-black text-foreground italic uppercase tracking-tighter group-hover:text-primary transition-colors leading-none">
                                                        {member.profiles?.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] italic">
                                                        {member.profiles?.position || "AGENTE LIBRE"}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-foreground/10" />
                                                    <span className="text-[10px] font-black text-primary italic uppercase tracking-widest">
                                                        {member.profiles?.elo || 0} XP
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-foreground/[0.02] flex items-center justify-center border border-foreground/5 group-hover:border-primary/30 transition-all">
                                            <ChevronRight className="w-4 h-4 text-foreground/50 group-hover:text-primary" />
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'tactics' && (
                    <TeamTactics teamId={team.id} isCaptain={isCaptain} members={members} />
                )}

                {activeTab === 'history' && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-10 h-10 rounded-2xl bg-foreground/[0.03] flex items-center justify-center border border-foreground/10 text-foreground/50">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Historial de Partidos</h2>
                                <span className="text-[9px] font-black text-foreground/60 uppercase tracking-widest">{teamMatches.length} ENCUENTROS REGISTRADOS</span>
                            </div>
                        </div>

                        {teamMatches.length === 0 ? (
                            <div className="glass-premium p-10 rounded-[3rem] border border-dashed border-foreground/10 text-center bg-foreground/[0.01]">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] italic leading-relaxed">
                                    Aún no se han registrado partidos oficiales.<br/>¡Desafía a otros equipos para empezar!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {teamMatches.map((match) => {
                                    const isHome = match.team_a_id === team.id;
                                    const result = (isHome ? match.team_a_score : match.team_b_score) > (isHome ? match.team_b_score : match.team_a_score) 
                                        ? 'victory' : (match.team_a_score === match.team_b_score ? 'draw' : 'defeat');
                                    
                                    return (
                                        <Link key={match.id} href={`/match?id=${match.id}`}>
                                            <motion.div 
                                                whileHover={{ scale: 1.01 }}
                                                className={cn(
                                                    "glass-premium p-6 rounded-[2.5rem] flex items-center justify-between border transition-all",
                                                    result === 'victory' ? "border-primary/20 bg-primary/5 shadow-lg shadow-primary/5" : 
                                                    result === 'defeat' ? "border-red-500/10 bg-red-500/[0.02] grayscale-[0.5]" : "border-foreground/5 bg-foreground/[0.01]"
                                                )}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg italic",
                                                        result === 'victory' ? "bg-primary text-background" : 
                                                        result === 'defeat' ? "bg-red-500/20 text-red-500" : "bg-foreground/5 text-foreground/40"
                                                    )}>
                                                        {result === 'victory' ? 'W' : result === 'defeat' ? 'L' : 'D'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{match.date}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl font-black text-foreground uppercase italic tracking-tighter">
                                                                {match.team_a_score} - {match.team_b_score}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-foreground/20" />
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {isCaptain && challenges.length > 0 && !isEditing && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                             <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 text-accent">
                                <Swords className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Retos Recibidos</h2>
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest">{challenges.length} DESAFÍOS PENDIENTES</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {challenges.map((challenge) => (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-premium p-6 rounded-[2.5rem] border border-accent/20 bg-accent/[0.02]"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-[1.8rem] bg-surface border border-accent/20 overflow-hidden shadow-xl shadow-accent/10 flex items-center justify-center">
                                                {challenge.challenger_team?.logo_url ? (
                                                    <img src={challenge.challenger_team.logo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Shield className="w-8 h-8 text-accent/40" />
                                                )}
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <span className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                                                    {challenge.challenger_team?.name || "EQUIPO DESCONOCIDO"}
                                                </span>
                                                <div className="flex items-center gap-3 text-[9px] font-black text-foreground/50 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-accent" /> {challenge.match_date}</span>
                                                    <div className="w-1 h-1 rounded-full bg-foreground/20" />
                                                    <span className="text-accent">{challenge.match_time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => handleRespondChallenge(challenge.id, 'declined')}
                                                disabled={respondingChallengeId === challenge.id}
                                                className="h-12 px-6 bg-foreground/[0.03] border border-foreground/10 rounded-2xl text-[10px] font-black text-foreground/50 uppercase tracking-widest hover:text-foreground transition-all active:scale-95 text-center flex items-center justify-center"
                                            >
                                                DECLINAR
                                            </button>
                                            <button
                                                onClick={() => handleRespondChallenge(challenge.id, 'accepted')}
                                                disabled={respondingChallengeId === challenge.id}
                                                className="h-12 px-6 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all active:scale-95 shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                                            >
                                                {respondingChallengeId === challenge.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Check className="w-4 h-4" /> ACEPTAR</>}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── JOIN REQUESTS (CAPTAIN ONLY) ── */}
                {isCaptain && joinRequests.length > 0 && !isEditing && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                <PlusCircle className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Solicitudes de Ingreso</h2>
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">{joinRequests.length} JUGADORES QUIEREN UNIRSE</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {joinRequests.map((req: any) => (
                                <div
                                    key={req.user_id}
                                    className="glass-premium p-6 rounded-[2.5rem] border border-primary/10 bg-primary/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <Link href={`/profile?id=${req.user_id}`} className="flex items-center gap-5 group">
                                        <div className="w-16 h-16 rounded-[1.8rem] overflow-hidden border-2 border-surface-elevated shadow-xl bg-surface-elevated">
                                            {req.profiles?.avatar_url ? (
                                                <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40 font-black text-3xl italic">
                                                    {req.profiles?.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black text-foreground italic uppercase tracking-tighter group-hover:text-primary transition-colors">
                                                {req.profiles?.name}
                                            </span>
                                            <div className="flex items-center gap-3 text-[10px] font-black italic uppercase tracking-widest">
                                                <span className="text-foreground/40">{req.profiles?.position || "DC"}</span>
                                                <div className="w-1 h-1 rounded-full bg-foreground/10" />
                                                <span className="text-primary">{req.profiles?.elo || 0} XP</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleRespondInvitation('decline', req.user_id)}
                                            disabled={respondingId === req.user_id}
                                            className="flex-1 md:flex-none h-12 px-6 bg-foreground/[0.03] border border-foreground/10 rounded-2xl text-[10px] font-black text-foreground/50 uppercase tracking-widest hover:text-foreground transition-all active:scale-95"
                                        >
                                            RECHAZAR
                                        </button>
                                        <button
                                            onClick={() => handleRespondInvitation('accept', req.user_id)}
                                            disabled={respondingId === req.user_id}
                                            className="flex-1 md:flex-none h-12 px-8 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all active:scale-95 shadow-lg shadow-primary/20"
                                        >
                                            {respondingId === req.user_id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'ACEPTAR'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

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
                            className="w-full max-w-lg glass-premium border border-foreground/10 rounded-[3rem] p-8 shadow-2xl relative z-10 overflow-hidden bg-surface"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                        <Plus className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-none">CONVOCATORIA</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50 mt-2">RECLUTA NUEVOS TALENTOS</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setInviteModalOpen(false)}
                                    className="w-14 h-14 bg-foreground/[0.03] rounded-2xl flex items-center justify-center text-foreground/50 hover:text-foreground transition-all border border-foreground/5 active:scale-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {loadingFriends ? (
                                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60 animate-pulse italic">Escaneando Radar...</span>
                                    </div>
                                ) : friends.length === 0 ? (
                                    <div className="text-center py-20 px-8 flex flex-col items-center gap-6">
                                        <div className="w-24 h-24 bg-foreground/[0.02] rounded-[3rem] flex items-center justify-center border border-dashed border-foreground/10">
                                            <Search className="w-8 h-8 text-foreground/50" />
                                        </div>
                                        <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Sin Agentes Disponibles</p>
                                        <Link href="/friends" onClick={() => setInviteModalOpen(false)} className="h-14 px-10 bg-primary text-background font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-foreground hover:text-background transition-all active:scale-95 flex items-center justify-center">
                                            AMPLIAR RED DE ALIANZAS
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-4 -mr-4 custom-scrollbar">
                                        {friends.map(f => {
                                            const otherUserId = f.user_id === user?.id ? f.friend_id : f.user_id;
                                            const isAlreadyInTeam = members.some(m => m.user_id === otherUserId);

                                            return (
                                                <div key={f.id} className="flex items-center justify-between p-5 rounded-[2.5rem] bg-foreground/[0.01] border border-foreground/5 hover:bg-foreground/[0.03] hover:border-primary/20 transition-all group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 rounded-[1.8rem] bg-surface-elevated border border-foreground/5 group-hover:border-primary/40 relative overflow-hidden transition-all duration-700 shadow-2xl">
                                                            {f.profiles?.avatar_url ? (
                                                                <img src={f.profiles.avatar_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-125" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center font-black text-2xl text-primary/20 italic bg-primary/5">
                                                                    {f.profiles?.name?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="text-lg font-black text-foreground uppercase italic tracking-tighter truncate w-32 group-hover:text-primary transition-colors leading-none">{f.profiles?.name}</h4>
                                                        </div>
                                                    </div>

                                                    {isAlreadyInTeam ? (
                                                        <div className="w-12 h-12 rounded-2xl bg-foreground/[0.02] flex items-center justify-center">
                                                            <Check className="w-5 h-5 text-primary/40" />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleInviteFriend(otherUserId)}
                                                            disabled={invitingId === otherUserId}
                                                            className="h-12 px-6 bg-primary text-background font-black text-[9px] uppercase tracking-widest rounded-2xl hover:bg-foreground hover:text-background transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/10"
                                                        >
                                                            {invitingId === otherUserId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CONVOCAR'}
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
        </div>
    );
}

export default function TeamProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p>Cargando información del equipo...</p>
            </div>
        }>
            <TeamProfileContent />
        </Suspense>
    );
}
