'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingRequests, acceptFriendRequest, deleteFriendship, FriendshipData } from '@/lib/friends';
import { getMatchInvitations, respondToInvitation } from '@/lib/matches';
import { getPendingJoinRequestsForCaptain, respondToTeamInvitation, getTeamInvitations } from '@/lib/teams';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, XCircle, Users, Calendar, Loader2, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
    const { user } = useAuth();
    const [friendRequests, setFriendRequests] = useState<FriendshipData[]>([]);
    const [matchInvites, setMatchInvites] = useState<any[]>([]);
    const [teamRequests, setTeamRequests] = useState<any[]>([]);
    const [teamInvitations, setTeamInvitations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [f, m, t, ti] = await Promise.all([
                getPendingRequests(user.id),
                getMatchInvitations(user.id),
                getPendingJoinRequestsForCaptain(user.id),
                getTeamInvitations(user.id)
            ]);
            setFriendRequests(f);
            setMatchInvites(m);
            setTeamRequests(t);
            setTeamInvitations(ti);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen, user]);

    const handleFriendAction = async (id: string, accept: boolean) => {
        setActionLoading(id);
        try {
            if (accept) {
                await acceptFriendRequest(id);
            } else {
                await deleteFriendship(id);
            }
            setFriendRequests(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleMatchAction = async (id: string, accept: boolean) => {
        setActionLoading(id);
        try {
            await respondToInvitation(id, accept ? 'confirmed' : 'rejected');
            setMatchInvites(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleTeamAction = async (teamId: string, targetUserId: string, accept: boolean) => {
        const actionId = `${teamId}-${targetUserId}`;
        setActionLoading(actionId);
        try {
            await respondToTeamInvitation(teamId, targetUserId, accept ? 'accept' : 'decline');
            setTeamRequests(prev => prev.filter(r => r.team_id !== teamId || r.user_id !== targetUserId));
            setTeamInvitations(prev => prev.filter(r => r.team_id !== teamId || r.user_id !== targetUserId));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const hasNotifications = friendRequests.length > 0 || matchInvites.length > 0 || teamRequests.length > 0 || teamInvitations.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-16 right-4 left-4 lg:left-auto lg:right-6 lg:top-24 lg:w-[400px] z-[101] glass-premium rounded-[2.5rem] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6)] border border-white/5 bg-[#08080c]/95 backdrop-blur-3xl"
                    >
                        <div className="p-6 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Bell className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-black text-foreground uppercase tracking-widest text-xs">Centro de Operaciones</h3>
                                    <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">Novedades y Reclutamiento</span>
                                </div>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="w-10 h-10 flex items-center justify-center transition-all hover:bg-white/[0.05] rounded-2xl border border-transparent hover:border-white/10"
                            >
                                <X className="w-4 h-4 text-foreground/30" />
                            </button>
                        </div>

                        <div className="max-h-[65vh] overflow-y-auto no-scrollbar p-0 flex flex-col">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
                                        <div className="absolute inset-0 w-10 h-10 border-t-2 border-primary rounded-full animate-spin" />
                                    </div>
                                    <span className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando...</span>
                                </div>

                            ) : !hasNotifications ? (
                                <div className="py-12 flex flex-col items-center gap-3 text-center px-6">
                                    <div className="w-16 h-16 rounded-full bg-foreground/[0.03] flex items-center justify-center mb-2">
                                        <Bell className="w-8 h-8 text-foreground/10" />
                                    </div>
                                    <span className="text-sm font-bold text-foreground/40">Todo al día</span>
                                    <p className="text-xs text-foreground/30">No tienes notificaciones pendientes por ahora.</p>
                                </div>
                            ) : (
                                <motion.div 
                                    variants={{
                                        show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
                                    }}
                                    initial="hidden"
                                    animate="show"
                                    className="p-4 flex flex-col gap-3"
                                >
                                    {/* Team Join Requests (Captain) */}
                                    <AnimatePresence mode="popLayout">
                                        {teamRequests.map((req) => {
                                            const actionId = `${req.team_id}-${req.user_id}`;
                                            return (
                                                <motion.div 
                                                    key={actionId}
                                                    variants={{
                                                        hidden: { opacity: 0, y: 15, scale: 0.96, filter: 'blur(4px)' },
                                                        show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                                                    }}
                                                    layout
                                                    transition={{ 
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 30
                                                    }}
                                                    className="p-4 rounded-3xl bg-primary/[0.02] border border-primary/10 hover:bg-primary/[0.04] hover:border-primary/30 transition-all flex flex-col gap-3 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#0a0a10] border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden shadow-lg group-hover:border-primary/40 transition-colors">
                                                            {req.profiles?.avatar_url ? (
                                                                <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="font-black text-primary text-xl italic">{req.profiles?.name?.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-black text-foreground italic uppercase tracking-tight truncate leading-none mb-1 group-hover:text-primary transition-colors">
                                                                {req.profiles?.name || 'Jugador'}
                                                            </p>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">Quiere unirse a </span>
                                                                <span className="text-[9px] text-primary font-black uppercase tracking-widest truncate max-w-[100px]">{req.teams?.name}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleTeamAction(req.team_id, req.user_id, true)}
                                                                disabled={actionLoading === actionId}
                                                                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background hover:scale-105 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
                                                            >
                                                                {actionLoading === actionId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" strokeWidth={3} />}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleTeamAction(req.team_id, req.user_id, false)}
                                                                disabled={actionLoading === actionId}
                                                                className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-foreground/20 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all active:scale-95 disabled:opacity-50"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>

                                    {/* Team Invitations (Player) */}
                                    <AnimatePresence mode="popLayout">
                                        {teamInvitations.map((inv) => {
                                            const actionId = `${inv.team_id}-${user?.id}`;
                                            return (
                                                <motion.div 
                                                    key={actionId}
                                                    variants={{
                                                        hidden: { opacity: 0, y: 15, scale: 0.96, filter: 'blur(4px)' },
                                                        show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                                                    }}
                                                    layout
                                                    transition={{ 
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 30
                                                    }}
                                                    className="p-4 rounded-3xl bg-accent/[0.02] border border-accent/10 hover:bg-accent/[0.04] hover:border-accent/30 transition-all flex flex-col gap-3 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#0a0a10] border-2 border-accent/20 flex items-center justify-center shrink-0 overflow-hidden shadow-lg group-hover:border-accent/40 transition-colors">
                                                            {inv.teams?.logo_url ? (
                                                                <img src={inv.teams.logo_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Shield className="w-6 h-6 text-accent" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-black text-foreground italic uppercase tracking-tight truncate leading-none mb-1 group-hover:text-accent transition-colors">
                                                                {inv.teams?.name || 'Equipo'}
                                                            </p>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-accent font-black uppercase tracking-widest italic animate-pulse">¡Convocatoria Abierta!</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleTeamAction(inv.team_id, user!.id, true)}
                                                                disabled={actionLoading === actionId}
                                                                className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-background hover:scale-105 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-accent/20"
                                                            >
                                                                {actionLoading === actionId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" strokeWidth={3} />}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleTeamAction(inv.team_id, user!.id, false)}
                                                                disabled={actionLoading === actionId}
                                                                className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-foreground/20 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all active:scale-95 disabled:opacity-50"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>

                                    {/* Friend Requests */}
                                    <AnimatePresence mode="popLayout">
                                        {friendRequests.map((req) => (
                                            <motion.div 
                                                key={req.id}
                                                variants={{
                                                    hidden: { opacity: 0, y: 15, scale: 0.96, filter: 'blur(4px)' },
                                                    show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                                                }}
                                                layout
                                                transition={{ 
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30
                                                }}
                                                className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-primary/20 transition-all flex items-center gap-4 group"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-[#0a0a10] border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden shadow-lg group-hover:border-primary/40 transition-colors">
                                                    {req.profiles?.avatar_url ? (
                                                        <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-black text-primary text-xl italic">{req.profiles?.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-black text-foreground italic uppercase tracking-tight truncate group-hover:text-primary transition-colors">{req.profiles?.name || 'Jugador'}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Users className="w-3 h-3 text-foreground/30" />
                                                        <span className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">Solicitud de Alianza</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleFriendAction(req.id, true)}
                                                        disabled={actionLoading === req.id}
                                                        className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-background hover:scale-105 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
                                                    >
                                                        {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" strokeWidth={3} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleFriendAction(req.id, false)}
                                                        disabled={actionLoading === req.id}
                                                        className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-foreground/20 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Match Invites */}
                                    <AnimatePresence mode="popLayout">
                                        {matchInvites.map((inv) => (
                                            <motion.div 
                                                key={inv.id}
                                                variants={{
                                                    hidden: { opacity: 0, y: 15, scale: 0.96, filter: 'blur(4px)' },
                                                    show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                                                }}
                                                layout
                                                transition={{ 
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30
                                                }}
                                                className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-accent/20 transition-all flex flex-col gap-4 group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 shadow-lg group-hover:rotate-3 transition-transform">
                                                        <Calendar className="w-6 h-6 text-accent" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[14px] font-black text-foreground italic uppercase tracking-tight truncate leading-tight group-hover:text-accent transition-colors">{inv.matches?.location}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-accent font-black uppercase tracking-widest italic">{inv.matches?.date}</span>
                                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                                            <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">{inv.matches?.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleMatchAction(inv.id, true)}
                                                        disabled={actionLoading === inv.id}
                                                        className="flex-[2] py-3 bg-accent text-background text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-xl shadow-accent/10 active:scale-95"
                                                    >
                                                        {actionLoading === inv.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar Asistencia'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMatchAction(inv.id, false)}
                                                        disabled={actionLoading === inv.id}
                                                        className="flex-1 py-3 bg-white/[0.03] border border-white/[0.05] text-foreground/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-foreground hover:bg-white/[0.08] transition-all disabled:opacity-50 active:scale-95"
                                                    >
                                                        Declinar
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>

                        {hasNotifications && (
                            <div className="p-5 border-t border-white/[0.04] bg-white/[0.01]">
                                <Link 
                                    href="/friends" 
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] font-black uppercase text-foreground/40 hover:text-primary transition-all tracking-[0.2em] group"
                                >
                                    Ir al Centro Comunitario
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
