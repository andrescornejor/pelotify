'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Star, Trophy, Users, CheckCircle2, X } from 'lucide-react';
import { MatchParticipant, PlayerRating, reportMatchScore, submitPlayerRatings, submitMvpVote } from '@/lib/matches';
import { calculateMatchPoints, POINTS_PER_GOAL, POINTS_PER_MVP, FIRST_WIN_BONUS } from '@/lib/elo';
import { supabase } from '@/lib/supabase';

interface PostMatchModalProps {
    matchId: string;
    participants: MatchParticipant[];
    currentUserId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function PostMatchModal({ matchId, participants, currentUserId, onClose, onSuccess }: PostMatchModalProps) {
    const [step, setStep] = useState<'score' | 'ratings' | 'mvp' | 'success'>('score');
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);

    const myParticipant = participants.find(p => p.user_id === currentUserId);
    const myTeam = myParticipant?.team || 'A';

    // Context for MVP swipe
    const [mvpIndex, setMvpIndex] = useState(0);

    // teammates are those in the same team, excluding self
    const teammates = participants.filter(p => p.team === myTeam && p.user_id !== currentUserId);

    const [playerRatings, setPlayerRatings] = useState<Record<string, number>>(
        Object.fromEntries(teammates.map(t => [t.user_id, 5]))
    );
    const [myGoals, setMyGoals] = useState(0);
    const [selectedMvp, setSelectedMvp] = useState<string | null>(null);
    const [isConsensus, setIsConsensus] = useState(false);

    const handleRatingChange = (userId: string, rating: number) => {
        setPlayerRatings(prev => ({ ...prev, [userId]: rating }));
    };

    const handleSubmit = async () => {
        try {
            // 1. Submit Report for Consensus (CRITICAL PATH)
            const report = {
                match_id: matchId,
                reporter_id: currentUserId,
                team: myTeam as 'A' | 'B',
                team_a_score: scoreA,
                team_b_score: scoreB,
                personal_goals: myGoals
            };

            const result = await reportMatchScore(report);
            
            // 2. Prepare and fire secondary updates (NON-BLOCKING)
            const ratings: PlayerRating[] = Object.entries(playerRatings).map(([to_id, r]) => ({
                match_id: matchId,
                from_user_id: currentUserId,
                to_user_id: to_id,
                rating: r
            }));

            // We fire these without 'await' to prevent UI hanging if network is slow
            (async () => {
                try {
                    await submitPlayerRatings(matchId, ratings, myGoals);
                    if (selectedMvp) {
                        await submitMvpVote(matchId, currentUserId, selectedMvp);
                    }
                    // Fire and forget badge calculation
                    await supabase.rpc('award_match_badges', {
                        p_match_id: matchId,
                        p_user_id: currentUserId,
                        p_goals: myGoals
                    });
                } catch (e) {
                    console.warn("Background match update error:", e);
                }
            })();

            // 3. Handle Consensus Visuals
            if (result.consensus) {
                setIsConsensus(true);
                
                // Background metadata update to refresh session (header, etc)
                // We don't await this to keep UI snappy
                (async () => {
                    try {
                        const { data: userData } = await supabase.auth.getUser();
                        if (userData?.user) {
                            // We trigger an Auth update to force context refresh,
                            // but we DO NOT increment stats manually to avoid duplication/errors.
                            // The AuthContext will re-fetch the profile from DB automatically.
                            await supabase.auth.updateUser({
                                data: {
                                    last_match_sync: new Date().toISOString()
                                }
                            });
                        }
                    } catch (e) { console.warn("Background metadata sync error:", e); }
                })();
            }
            
            // 4. GO TO SUCCESS STEP IMMEDIATELY (DATA RECORDED)
            setStep('success');
        } catch (err: any) {
            console.error('Error submitting post-match:', err);
            alert(err.message || 'Error al guardar el reporte.');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {step === 'score' && (
                        <div className="p-6 flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-primary" /> ¿Cómo salió el partido?
                                </h3>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-foreground/40" />
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-8 py-4">
                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-sm font-bold text-foreground/40 uppercase">Equipo A</span>
                                    <input
                                        type="number"
                                        value={scoreA}
                                        onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                                        className="w-20 h-20 text-4xl font-black text-center bg-foreground/[0.02] border-2 border-primary/20 rounded-2xl outline-none focus:border-primary transition-colors text-foreground"
                                    />
                                </div>
                                <span className="text-4xl font-black text-foreground/10">-</span>
                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-sm font-bold text-foreground/40 uppercase">Equipo B</span>
                                    <input
                                        type="number"
                                        value={scoreB}
                                        onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                                        className="w-20 h-20 text-4xl font-black text-center bg-foreground/[0.02] border-2 border-primary/20 rounded-2xl outline-none focus:border-primary transition-colors text-foreground"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('ratings')}
                                className="w-full py-4 bg-primary text-background font-black text-sm uppercase tracking-widest rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all"
                            >
                                Siguiente: Calificar equipo
                            </button>
                        </div>
                    )}

                    {step === 'ratings' && (
                        <div className="p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    <Users className="w-6 h-6 text-primary" /> Valora a tu equipo
                                </h3>
                            </div>

                            <div className="flex flex-col gap-4">
                                {teammates.map((player) => (
                                    <div key={player.user_id} className="flex items-center justify-between p-3 bg-foreground/[0.02] rounded-2xl border border-foreground/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {player.profiles?.name?.[0].toUpperCase() || 'P'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{player.profiles?.name || 'Jugador'}</span>
                                                <span className="text-[10px] text-foreground/40 uppercase font-black">{player.profiles?.position || 'DC'}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleRatingChange(player.user_id, s)}
                                                    className={`transition-colors ${playerRatings[player.user_id] >= s ? 'text-primary' : 'text-foreground/10'}`}
                                                >
                                                    <Star className="w-5 h-5 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {teammates.length === 0 && (
                                    <p className="text-center py-4 text-foreground/30 text-sm italic">Jugaste solo, no hay compañeros para calificar.</p>
                                )}
                            </div>

                            <div className="border-t border-foreground/5 pt-6 flex flex-col gap-4">
                                <h4 className="text-xs font-black text-foreground/40 uppercase tracking-widest">Tus estadísticas personales</h4>
                                <div className="flex items-center justify-between p-3 bg-foreground/[0.02] rounded-2xl border border-foreground/5">
                                    <span className="text-sm font-bold text-foreground">¿Cuántos goles marcaste?</span>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setMyGoals(Math.max(0, myGoals - 1))} className="w-8 h-8 rounded-full bg-foreground/5 text-foreground/40 font-bold hover:text-foreground hover:bg-foreground/10">-</button>
                                        <span className="text-lg font-black text-primary w-4 text-center">{myGoals}</span>
                                        <button onClick={() => setMyGoals(myGoals + 1)} className="w-8 h-8 rounded-full bg-foreground/5 text-foreground/40 font-bold hover:text-foreground hover:bg-foreground/10">+</button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('mvp')}
                                className="w-full py-4 bg-primary text-background font-black text-sm uppercase tracking-widest rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all"
                            >
                                Siguiente: Elegir MVP
                            </button>
                        </div>
                    )}

                    {step === 'mvp' && (
                        <div className="p-6 flex flex-col items-center justify-start min-h-[550px] relative overflow-hidden">
                            <div className="w-full flex justify-between items-center mb-8 relative z-20">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    <Star className="w-6 h-6 text-accent animate-pulse" /> Elegir MVP
                                </h3>
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest bg-foreground/5 px-3 py-1 rounded-full">
                                    {selectedMvp ? 'VOTO LISTO' : 'DESLIZA'}
                                </p>
                            </div>

                            <div className="relative w-full max-w-[280px] h-[380px] mt-4 flex items-center justify-center perspective-1000 z-10">
                                <AnimatePresence>
                                    {participants.map((player, idx) => {
                                        if (idx < mvpIndex) return null;
                                        
                                        const isFront = idx === mvpIndex;
                                        
                                        return (
                                            <motion.div
                                                key={player.user_id}
                                                className="absolute top-0 left-0 w-full h-full glass-premium bg-surface rounded-[3rem] border border-foreground/10 shadow-2xl flex flex-col items-center justify-center p-6"
                                                style={{ zIndex: participants.length - idx }}
                                                drag={isFront && !selectedMvp ? "x" : false}
                                                dragConstraints={{ left: 0, right: 0 }}
                                                onDragEnd={(e, { offset }) => {
                                                    const swipe = offset.x;
                                                    if (swipe > 100) {
                                                        setSelectedMvp(player.user_id);
                                                    } else if (swipe < -100) {
                                                        setMvpIndex(prev => prev + 1);
                                                    }
                                                }}
                                                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                                                animate={{ 
                                                    scale: isFront ? 1 : Math.max(0.8, 1 - (idx - mvpIndex) * 0.05), 
                                                    y: isFront ? 0 : (idx - mvpIndex) * 15, 
                                                    opacity: isFront ? 1 : Math.max(0, 1 - (idx - mvpIndex) * 0.2),
                                                    rotateZ: isFront ? 0 : (idx % 2 === 0 ? 2 : -2)
                                                }}
                                                exit={{ 
                                                    x: selectedMvp === player.user_id ? 400 : -400, 
                                                    opacity: 0,
                                                    rotateZ: selectedMvp === player.user_id ? 20 : -20
                                                }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                                whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
                                            >
                                                {/* Card Content */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[3rem] pointer-events-none" />
                                                
                                                <div className="w-32 h-32 rounded-full relative mb-6">
                                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                                    <div className="relative w-full h-full bg-surface-elevated border-4 border-background rounded-full flex items-center justify-center shadow-xl shadow-primary/20 overflow-hidden">
                                                        {player.profiles?.avatar_url ? (
                                                            <img src={player.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-4xl font-black italic text-primary">{player.profiles?.name?.[0].toUpperCase() || 'P'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <h4 className="text-3xl font-black italic uppercase text-center leading-none tracking-tighter">
                                                    {player.profiles?.name || 'Jugador'}
                                                </h4>
                                                
                                                <div className="flex items-center gap-2 mt-4">
                                                    <span className="px-3 py-1 bg-foreground/5 rounded-full text-[10px] font-black uppercase tracking-widest text-foreground/50">
                                                        Equipo {player.team}
                                                    </span>
                                                    <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                                                        {player.profiles?.position || 'DC'}
                                                    </span>
                                                </div>

                                                {/* Swipe Indicators */}
                                                <div className="absolute bottom-8 flex justify-between w-full px-6 pointer-events-none">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-red-500 font-black italic tracking-widest opacity-30 text-xs">NOPE</span>
                                                        <span className="text-[8px] text-foreground/20 font-bold uppercase">&larr; Desliza</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-accent font-black italic tracking-widest opacity-30 text-xs">MVP</span>
                                                        <span className="text-[8px] text-foreground/20 font-bold uppercase">Desliza &rarr;</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                
                                {mvpIndex >= participants.length && !selectedMvp && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        className="text-center absolute inset-0 flex flex-col items-center justify-center p-6 bg-surface/50 rounded-[3rem] border border-dashed border-foreground/20"
                                    >
                                        <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
                                            <Users className="w-8 h-8 text-foreground/30" />
                                        </div>
                                        <p className="text-foreground font-black uppercase tracking-widest text-lg italic mb-2">Sin Figura</p>
                                        <p className="text-[10px] text-foreground/40 uppercase font-black mb-8 px-4 text-center">Has decidido no elegir a nadie. Podés volver a ver los candidatos o finalizar.</p>
                                        
                                        <div className="flex flex-col gap-3 w-full">
                                            <button onClick={() => setMvpIndex(0)} className="w-full py-4 bg-foreground/5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-foreground hover:bg-foreground/10 transition-colors">
                                                VOLVER A REVISAR
                                            </button>
                                            <button onClick={handleSubmit} className="w-full py-4 bg-primary text-background rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
                                                FINALIZAR SIN MVP
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            
                            {selectedMvp && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute inset-x-0 bottom-6 px-6 flex flex-col gap-4 z-30"
                                >
                                    <div className="glass-premium p-4 rounded-2xl border border-accent/20 bg-accent/5 backdrop-blur-md">
                                        <p className="text-center text-accent font-black uppercase text-xs tracking-widest italic flex items-center justify-center gap-2">
                                            <Star className="w-4 h-4 fill-accent" />
                                            MVP: {participants.find(p => p.user_id === selectedMvp)?.profiles?.name}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setSelectedMvp(null); setMvpIndex(0); }} className="w-1/3 py-4 bg-foreground/10 text-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-foreground/20 transition-all">
                                            DESHACER
                                        </button>
                                        <button onClick={handleSubmit} className="w-2/3 py-4 bg-accent text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> REPORTE FINAL
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="p-10 flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-primary" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-2xl font-black text-foreground uppercase italic">
                                    {isConsensus ? '¡Resultado Confirmado!' : '¡Reporte Enviado!'}
                                </h3>
                                <p className="text-foreground/40 text-sm">
                                    {isConsensus 
                                        ? 'Ambos equipos coinciden. Tu ELO y estadísticas ya fueron actualizados.'
                                        : 'Estamos esperando que el rival reporte el mismo resultado para actualizar el ELO oficial.'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    onClose();
                                    if (onSuccess) onSuccess();
                                }}
                                className="w-full py-4 bg-foreground/5 border border-foreground/10 text-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-foreground/10 transition-all"
                            >
                                Volver al Home
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
