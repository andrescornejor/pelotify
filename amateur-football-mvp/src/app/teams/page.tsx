'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, Search, PlusCircle, Trophy, ArrowRight, Camera, Loader2, Sparkles, Filter, Swords, Clock, MapPin, CalendarDays, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeams, createTeam, Team } from '@/lib/teams';
import { createTeamChallenge } from '@/lib/teamChallenges';
import { uploadTeamLogo } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { TeamsSkeleton } from '@/components/Skeletons';
import Link from 'next/link';
import { AVAILABLE_TIMES } from '@/lib/constants';

export default function TeamsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'my_team' | 'explore' | 'create'>('explore');

    const [teams, setTeams] = useState<Team[]>([]);
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Challenge Modal State
    const [challengeModalOpen, setChallengeModalOpen] = useState(false);
    const [targetTeam, setTargetTeam] = useState<Team | null>(null);
    const [challengeDate, setChallengeDate] = useState('');
    const [challengeTime, setChallengeTime] = useState('');
    const [challengeLocation, setChallengeLocation] = useState('');
    const [challengeMessage, setChallengeMessage] = useState('');
    const [isSendingChallenge, setIsSendingChallenge] = useState(false);

    const fetchTeams = async () => {
        try {
            const data = await getTeams(user?.id);
            // Identify user's team if confirmed
            const userTeam = data.find(t => t.captain_id === user?.id || t.has_requested); // Simplified logic. Ideally, we should check status === 'confirmed' globally.
            // But since 'getTeams' might only reflect request status boolean for now:

            if (userTeam) {
                setMyTeam(userTeam);
                setActiveTab('my_team');
            }

            // Filter out user's team for explore view
            setTeams(data.filter(t => t.id !== userTeam?.id));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [user?.id]);

    if (authLoading || isLoading) {
        return <TeamsSkeleton />;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const isCaptain = myTeam?.captain_id === user.id;

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            let logoUrl = '';
            if (logoFile) {
                logoUrl = await uploadTeamLogo(logoFile, newTeamName);
            }
            const team = await createTeam(newTeamName, newTeamDesc, user.id, logoUrl);
            router.push(`/team?id=${team.id}`);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const openChallengeModal = (team: Team) => {
        setTargetTeam(team);
        setChallengeModalOpen(true);
    };

    const handleSendChallenge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!myTeam || !targetTeam) return;

        setIsSendingChallenge(true);
        try {
            await createTeamChallenge(
                myTeam.id,
                targetTeam.id,
                challengeDate,
                challengeTime,
                challengeLocation,
                challengeMessage
            );
            alert('¡Desafío enviado con éxito!');
            setChallengeModalOpen(false);
            setTargetTeam(null);
        } catch (err: any) {
            console.error(err);
            alert('Error al enviar el desafío: ' + err.message);
        } finally {
            setIsSendingChallenge(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 p-4 sm:p-6 lg:px-10 lg:pt-0 xl:px-14 2xl:px-16 max-w-screen-2xl mx-auto min-h-screen bg-background relative overflow-hidden snap-y snap-proximity overflow-y-auto">
            {/* Ambient Effects */}
            <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/3 blur-[120px] rounded-full pointer-events-none" />

            {/* Header & Tabs */}
            <div className="sticky top-[70px] lg:top-[92px] z-30 pt-4 pb-6 bg-background/80 backdrop-blur-xl -mx-4 px-4 lg:-mx-16 lg:px-16 border-b border-foreground/5 shadow-2xl shadow-black/5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 max-w-screen-2xl mx-auto">
                    <div className="flex flex-col">
                        <h1 className="text-4xl md:text-5xl font-black italic text-foreground uppercase tracking-tighter leading-none">Asociación <span className="text-foreground/40">de Clubes</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-2">Gestioná, Explorá, Desafiá</p>
                    </div>

                    <div className="flex p-1 bg-foreground/[0.03] rounded-2xl border border-foreground/5 relative w-full md:w-auto h-14 items-center">
                        {myTeam && (
                            <button
                                onClick={() => setActiveTab('my_team')}
                                className={cn(
                                    "flex-1 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 italic",
                                    activeTab === 'my_team' ? 'text-background' : 'text-foreground/50 hover:text-foreground/80'
                                )}
                            >
                                Mi Institución
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={cn(
                                "flex-1 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 italic",
                                activeTab === 'explore' ? 'text-background' : 'text-foreground/50 hover:text-foreground/80'
                            )}
                        >
                            Radar Global
                        </button>
                        {!myTeam && (
                            <button
                                onClick={() => setActiveTab('create')}
                                className={cn(
                                    "flex-1 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 italic",
                                    activeTab === 'create' ? 'text-background' : 'text-foreground/50 hover:text-foreground/80'
                                )}
                            >
                                Fundar Club
                            </button>
                        )}
                        <motion.div
                            layoutId="teams-tab-pill"
                            className="absolute inset-y-1 bg-primary rounded-xl shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
                            initial={false}
                            animate={{
                                left: activeTab === 'my_team' ? '4px' : activeTab === 'explore' ? (myTeam ? 'calc(50% + 2px)' : '4px') : myTeam ? '100%' : 'calc(50% + 2px)',
                                right: activeTab === 'my_team' ? '50%' : activeTab === 'explore' ? (myTeam ? '4px' : '50%') : '4px',
                            }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 35 }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'my_team' && myTeam && (
                    <motion.div
                        key="my_team"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="relative overflow-hidden rounded-[3rem] p-8 md:p-12 border border-primary/20 shadow-2xl shadow-primary/5 group bg-surface">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-0 opacity-50" />
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                                <Link href={`/team?id=${myTeam.id}`}>
                                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] bg-surface-elevated border-4 border-foreground/5 shadow-2xl overflow-hidden flex items-center justify-center relative group-hover:border-primary/50 transition-colors">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-foreground/10 to-transparent z-10" />
                                        {myTeam.logo_url ? (
                                            <img src={myTeam.logo_url} alt={myTeam.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <Shield className="w-20 h-20 text-primary/40 group-hover:text-primary transition-colors duration-500" />
                                        )}
                                    </div>
                                </Link>

                                <div className="flex-1 text-center md:text-left space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex flex-col md:flex-row items-center gap-3">
                                            <h2 className="text-4xl md:text-6xl font-black italic text-foreground uppercase tracking-tighter leading-none">{myTeam.name}</h2>
                                            {isCaptain && (
                                                <div className="bg-primary text-background px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm shadow-primary/20">
                                                    <Trophy className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Capitán</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">{myTeam.description || "Institución Deportiva Federada"}</p>
                                    </div>

                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <div className="bg-foreground/[0.03] border border-foreground/5 px-4 py-2 rounded-2xl flex items-center justify-center flex-col">
                                            <span className="text-2xl font-black text-primary italic">{myTeam.elo}</span>
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/60">PUNTOS ELO</span>
                                        </div>
                                        <div className="bg-foreground/[0.03] border border-foreground/5 px-4 py-2 rounded-2xl flex items-center justify-center flex-col">
                                            <span className="text-2xl font-black text-foreground italic">{myTeam.members_count}</span>
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/60">PIBES</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href={`/team?id=${myTeam.id}`}
                                            className="h-14 px-8 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-all active:scale-95 shadow-lg shadow-primary/20"
                                        >
                                            <Shield className="w-4 h-4" /> GESTIONAR CLUB
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'explore' && (
                    <motion.div
                        key="explore"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-12"
                    >
                        {/* Search & Filter Bar */}
                        <div className="flex gap-4 relative z-10">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="BUSCÁ TU PRÓXIMO RIVAL..."
                                    className="w-full h-16 bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] pl-14 pr-6 text-[11px] font-black uppercase tracking-[0.3em] text-foreground outline-none focus:border-primary/40 focus:bg-foreground/[0.04] transition-all shadow-inner"
                                />
                            </div>
                            <button className="w-16 h-16 bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] flex items-center justify-center text-foreground/50 hover:text-foreground transition-all shadow-inner">
                                <Filter className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Teams Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {teams.map((team) => (
                                <motion.div
                                    key={team.id}
                                    whileHover={{ y: -5 }}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] blur-xl" />

                                    <div className="glass-premium p-8 border border-foreground/5 space-y-8 relative overflow-hidden group-hover:border-primary/30 transition-all rounded-[3rem] bg-surface">
                                        <div className="flex justify-between items-start">
                                            <div className="w-20 h-20 bg-surface-elevated rounded-[1.5rem] border border-foreground/5 flex items-center justify-center overflow-hidden group-hover:scale-110 shadow-2xl transition-transform duration-700 relative">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-foreground/10 to-transparent z-10" />
                                                {team.logo_url ? (
                                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Shield className="w-10 h-10 text-primary/30 group-hover:text-primary transition-colors" />
                                                )}
                                            </div>
                                            <div className="bg-surface-elevated border border-foreground/5 rounded-2xl px-4 py-2 flex flex-col items-center">
                                                <span className="text-xl font-black text-primary italic uppercase tracking-tighter leading-none">{team.elo}</span>
                                                <span className="text-[8px] font-black text-foreground/60 uppercase tracking-widest mt-0.5">NIVEL</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter truncate leading-none">{team.name}</h3>
                                            <div className="flex items-center gap-3 text-[9px] font-black text-foreground/50 uppercase tracking-widest py-1">
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-foreground" /> {team.members_count}/</span>
                                                <div className="w-1 h-1 rounded-full bg-foreground/30" />
                                                <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-primary" /> CLUB PRO</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Link
                                                href={`/team?id=${team.id}`}
                                                className="flex-[2] h-12 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-foreground/[0.06] transition-all flex items-center justify-center"
                                            >
                                                Ver Detalles
                                            </Link>

                                            {isCaptain && (
                                                <button
                                                    onClick={() => openChallengeModal(team)}
                                                    className="flex-[3] h-12 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                                                >
                                                    <Swords className="w-4 h-4" /> Lanzar Reto
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {teams.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
                                <div className="w-24 h-24 bg-foreground/[0.02] rounded-[3rem] flex items-center justify-center border border-dashed border-foreground/10">
                                    <Search className="w-8 h-8 text-foreground/50" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Sin Oponentes en la Mira</p>
                                    <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">El ecosistema está vacío. Sé el pionero fundando tu club.</p>
                                </div>
                                {!myTeam && (
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="h-14 px-10 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 hover:bg-foreground hover:text-background transition-all active:scale-95"
                                    >
                                        Fundar Club
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'create' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="max-w-2xl mx-auto w-full pt-4 relative z-10"
                    >
                        <form onSubmit={handleCreateTeam} className="glass-premium p-10 md:p-14 rounded-[3rem] border border-foreground/5 space-y-10 relative overflow-hidden bg-surface shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <PlusCircle className="w-32 h-32 text-primary" />
                            </div>

                            <div className="flex flex-col items-center gap-6 relative z-10">
                                <label className="group relative cursor-pointer">
                                    <div className="w-40 h-40 bg-surface-elevated rounded-[2.5rem] border-2 border-dashed border-foreground/10 group-hover:border-primary/50 overflow-hidden flex flex-col items-center justify-center transition-all shadow-xl">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 group-hover:scale-110 transition-transform">
                                                <Camera className="w-10 h-10 text-foreground/50 group-hover:text-primary transition-colors" />
                                                <span className="text-[8px] font-black text-foreground/50 uppercase tracking-[0.3em] text-center px-4">Subir Escudo Oficial</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm">
                                            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                                        </div>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                                <div className="text-center space-y-1">
                                    <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter">Legalizar Institución</h2>
                                    <p className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.3em]">Crea el perfil oficial de tu equipo</p>
                                </div>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.3em] pl-2">Denominación Oficial</label>
                                    <input
                                        type="text"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        placeholder="EJ: REAL MADRID ARG"
                                        className="w-full h-16 bg-foreground/[0.01] border border-foreground/5 rounded-2xl px-6 text-sm font-black uppercase text-foreground outline-none focus:border-primary/50 focus:bg-foreground/[0.03] transition-all shadow-inner"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase text-foreground/50 tracking-[0.3em] pl-2">Información Táctica (Opcional)</label>
                                    <textarea
                                        value={newTeamDesc}
                                        onChange={(e) => setNewTeamDesc(e.target.value)}
                                        placeholder="Visión, filosofía o días de entrenamiento..."
                                        className="w-full h-32 bg-foreground/[0.01] border border-foreground/5 rounded-2xl p-6 text-xs text-foreground/60 font-bold uppercase tracking-[0.1em] outline-none focus:border-primary/50 focus:bg-foreground/[0.03] transition-all resize-none shadow-inner"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreating || !newTeamName.trim()}
                                    className="w-full h-16 bg-primary text-background font-black italic text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-foreground hover:text-background transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            PROCESANDO FIRMAS...
                                        </>
                                    ) : (
                                        <>
                                            FUNDAR EQUIPO
                                            <Shield className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── CHALLENGE MODAL ── */}
            <AnimatePresence>
                {challengeModalOpen && targetTeam && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setChallengeModalOpen(false)}
                            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="w-full max-w-xl glass-premium border border-foreground/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 overflow-hidden bg-surface"
                        >
                            {/* Decorative Background Glows */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                                        <Swords className="w-8 h-8 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none">Lanzar Reto</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mt-2">Vs. {targetTeam.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setChallengeModalOpen(false)}
                                    className="w-12 h-12 bg-foreground/[0.03] border border-foreground/5 rounded-2xl flex items-center justify-center text-foreground/50 hover:text-foreground transition-all active:scale-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSendChallenge} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                                            <CalendarDays className="w-3 h-3 text-primary" /> Fecha
                                        </label>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                                            {Array.from({ length: 14 }).map((_, i) => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + i);
                                                const dateStr = d.toISOString().split('T')[0];
                                                const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
                                                const dayNumber = d.getDate();
                                                const isSelected = challengeDate === dateStr;

                                                return (
                                                    <button
                                                        key={dateStr}
                                                        type="button"
                                                        onClick={() => setChallengeDate(dateStr)}
                                                        className={`flex-shrink-0 w-14 h-16 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center ${
                                                            isSelected 
                                                            ? 'bg-primary border-primary text-black' 
                                                            : 'bg-foreground/[0.02] border-foreground/5 text-foreground/40 hover:border-foreground/20'
                                                        }`}
                                                    >
                                                        <span className="text-lg font-black italic leading-none">{dayNumber}</span>
                                                        <span className="text-[7px] font-black uppercase tracking-widest">{dayName}</span>
                                                    </button>
                                                );
                                            })}
                                            <div className="relative flex-shrink-0 group">
                                                <input
                                                    type="date"
                                                    value={challengeDate}
                                                    onChange={(e) => setChallengeDate(e.target.value)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                                                />
                                                <div className={`w-14 h-16 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center ${
                                                    challengeDate && !Array.from({ length: 14 }).some((_, i) => {
                                                        const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0] === challengeDate;
                                                    })
                                                    ? 'bg-primary border-primary text-black'
                                                    : 'bg-foreground/[0.02] border-foreground/5 text-foreground/40'
                                                }`}>
                                                    <CalendarDays className="w-4 h-4" />
                                                    <span className="text-[7px] font-black uppercase tracking-widest">OTRO</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                                            <Clock className="w-3 h-3 text-primary" /> Hora
                                        </label>
                                        <div className="relative group">
                                            <select
                                                required
                                                value={challengeTime}
                                                onChange={(e) => setChallengeTime(e.target.value)}
                                                className="w-full h-14 bg-foreground/[0.02] border border-foreground/5 rounded-2xl px-4 text-xs font-bold uppercase text-foreground outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled className="bg-background">¿A qué hora?</option>
                                                {AVAILABLE_TIMES.map(t => {
                                                    const [h, m] = t.split(':');
                                                    const hour = parseInt(h);
                                                    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                                    return (
                                                        <option key={t} value={t} className="bg-background text-foreground">
                                                            {displayHour}:{m} {ampm}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20 group-focus-within:text-primary">
                                                <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                                        <MapPin className="w-3 h-3 text-primary" /> Predio / Lugar
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Predio La Finta, Cancha 1"
                                        value={challengeLocation}
                                        onChange={(e) => setChallengeLocation(e.target.value)}
                                        className="w-full h-14 bg-foreground/[0.02] border border-foreground/5 rounded-2xl px-5 text-xs font-bold uppercase tracking-wide text-foreground outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] pl-2">
                                        Mensajito para el rival (Opcional)
                                    </label>
                                    <textarea
                                        placeholder="Preparen las canilleras..."
                                        value={challengeMessage}
                                        onChange={(e) => setChallengeMessage(e.target.value)}
                                        className="w-full h-24 bg-foreground/[0.02] border border-foreground/5 rounded-2xl p-5 text-xs text-foreground/80 font-bold uppercase tracking-wide outline-none focus:border-primary/50 transition-colors resize-none"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSendingChallenge}
                                        className="w-full h-16 bg-accent text-foreground font-black italic text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-accent/20 hover:bg-foreground hover:text-background transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSendingChallenge ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> PROCESANDO RETO...
                                            </>
                                        ) : (
                                            <>
                                                <Swords className="w-5 h-5" /> ENVIAR DESAFÍO OFICIAL
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="pb-24 lg:pb-0" />
        </div>
    );
}
