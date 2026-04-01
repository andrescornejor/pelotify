'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Trophy,
  Users,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Flame,
  Sparkles,
  Medal,
} from 'lucide-react';
import { MatchParticipant } from '@/lib/matches';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface PostMatchModalProps {
  matchId: string;
  match?: any;
  participants: MatchParticipant[];
  currentUserId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PostMatchModal({
  matchId,
  match,
  participants,
  currentUserId,
  onClose,
  onSuccess,
}: PostMatchModalProps) {
  const [step, setStep] = useState<'score' | 'ratings' | 'mvp' | 'success'>('score');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myParticipant = participants.find((p) => p.user_id === currentUserId);
  const myTeam = myParticipant?.team || 'A';

  // Context for MVP swipe
  const [mvpIndex, setMvpIndex] = useState(0);

  // teammates are those in the same team, excluding self
  const teammates = participants.filter((p) => p.team === myTeam && p.user_id !== currentUserId);

  const [playerRatings, setPlayerRatings] = useState<Record<string, number>>(
    Object.fromEntries(teammates.map((t) => [t.user_id, 5]))
  );
  const [myGoals, setMyGoals] = useState(0);
  const [selectedMvp, setSelectedMvp] = useState<string | null>(null);
  const [isConsensus, setIsConsensus] = useState(false);

  const handleRatingChange = (userId: string, rating: number) => {
    setPlayerRatings((prev) => ({ ...prev, [userId]: rating }));
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare arrays for the new atomic backend RPC Call
      const ratingsArray = Object.entries(playerRatings).map(([to_id, r]) => ({
        to_user_id: to_id,
        rating: r,
      }));

      // Single massive transaction for total reliability
      const { data, error } = await supabase.rpc('submit_full_match_report', {
        p_match_id: matchId,
        p_user_id: currentUserId,
        p_team: myTeam,
        p_team_a_score: scoreA,
        p_team_b_score: scoreB,
        p_personal_goals: myGoals,
        p_ratings: ratingsArray.length > 0 ? ratingsArray : null,
        p_mvp_id: selectedMvp,
      });

      if (error) {
        console.error('RPC Error:', error);
        throw new Error('El reporte no se pudo procesar. Intenta nuevamente.');
      }

      if (data?.consensus) {
        setIsConsensus(true);
        // Trigger auto-refresh of UI data via auth metadata silently
        supabase.auth
          .updateUser({ data: { last_match_sync: new Date().toISOString() } })
          .catch(() => {});
      }

      setStep('success');
      triggerConfetti();
    } catch (err: any) {
      console.error('Error submitting post-match:', err);
      alert(err.message || 'Error al guardar el reporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-center p-4 sm:p-6 lg:p-10 pt-16 sm:pt-20 bg-background/90 backdrop-blur-xl overflow-hidden touch-none">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.8 }}
          className="w-full max-w-lg h-[95vh] sm:h-[85vh] lg:h-auto lg:max-h-[90vh] glass-premium rounded-[2rem] border border-foreground/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col"
        >
          {/* Progress Bar Header */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-foreground/5 z-50">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-emerald-400 to-accent"
              initial={{ width: '0%' }}
              animate={{
                width:
                  step === 'score'
                    ? '33%'
                    : step === 'ratings'
                      ? '66%'
                      : step === 'mvp'
                        ? '90%'
                        : '100%',
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="p-6 sm:p-8 flex justify-between items-center relative z-20 border-b border-foreground/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                {step === 'score' ? (
                  <Trophy className="w-6 h-6 text-primary" />
                ) : step === 'ratings' ? (
                  <Flame className="w-6 h-6 text-primary" />
                ) : (
                  <Star className="w-6 h-6 text-accent" />
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                {step === 'score'
                  ? 'Resultado Final'
                  : step === 'ratings'
                    ? 'Tu Rendimiento'
                    : step === 'mvp'
                      ? 'ElegÃƒÂ­ MVP'
                      : 'Completado'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-foreground/5 hover:bg-foreground/10 hover:rotate-90 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5 text-foreground/40 hover:text-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 w-full p-6 sm:p-8">
            {step === 'score' && (
              <motion.div
                key="score"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full justify-between gap-10"
              >
                <div className="text-center space-y-2">
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-foreground/40">
                    MARCADOR OFICIAL
                  </p>
                  <p className="text-sm font-medium text-foreground/60 leading-relaxed">
                    Ã‚Â¿CÃƒÂ³mo saliÃƒÂ³ tu equipo hoy? SÃƒÂ© honesto, el otro equipo tambiÃƒÂ©n enviarÃƒÂ¡ su
                    versiÃƒÂ³n.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 sm:gap-10">
                  {/* Team A */}
                  <div className="flex flex-col items-center gap-4 group">
                    <span
                      className={cn(
                        'text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-foreground/10',
                        myTeam === 'A'
                          ? 'bg-primary/20 text-primary border-primary/30'
                          : 'bg-blue-500/10 text-blue-500'
                      )}
                    >
                      {match?.team_a_name || 'Local'}
                    </span>
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-24 h-32 sm:w-32 sm:h-40 rounded-[2rem] bg-foreground/[0.03] border-4 border-foreground/10 flex flex-col items-center justify-center gap-4 relative z-10 shadow-inner group-hover:border-primary/50 transition-colors">
                        <button
                          onClick={() => setScoreA((prev) => prev + 1)}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all text-white"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                        <span className="text-5xl sm:text-7xl font-black italic tracking-tighter text-foreground leading-none">
                          {scoreA}
                        </span>
                        <button
                          onClick={() => setScoreA((prev) => Math.max(0, prev - 1))}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all text-white"
                        >
                          <Minus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <span className="text-3xl sm:text-5xl font-black text-foreground/10 italic">
                    -
                  </span>

                  {/* Team B */}
                  <div className="flex flex-col items-center gap-4 group">
                    <span
                      className={cn(
                        'text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-foreground/10',
                        myTeam === 'B'
                          ? 'bg-primary/20 text-primary border-primary/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      )}
                    >
                      {match?.team_b_name || 'Visita'}
                    </span>
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-24 h-32 sm:w-32 sm:h-40 rounded-[2rem] bg-foreground/[0.03] border-4 border-foreground/10 flex flex-col items-center justify-center gap-4 relative z-10 shadow-inner group-hover:border-red-500/50 transition-colors">
                        <button
                          onClick={() => setScoreB((prev) => prev + 1)}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all text-white"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                        <span className="text-5xl sm:text-7xl font-black italic tracking-tighter text-foreground leading-none">
                          {scoreB}
                        </span>
                        <button
                          onClick={() => setScoreB((prev) => Math.max(0, prev - 1))}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all text-white"
                        >
                          <Minus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep('ratings')}
                  className="w-full h-16 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  CONFIRMAR MARCADOR
                </button>
              </motion.div>
            )}

            {step === 'ratings' && (
              <motion.div
                key="ratings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8 h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h4 className="text-lg font-black uppercase italic tracking-tighter">
                      Ã‚Â¿CuÃƒÂ¡ntos goles hiciste?
                    </h4>
                  </div>
                  <div className="p-6 bg-foreground/[0.02] border border-foreground/10 rounded-[2rem] flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest max-w-[150px]">
                      Tu rendimiento personal aporta a tu ELO.
                    </span>
                    <div className="flex items-center gap-4 bg-background/50 rounded-full p-2 border border-foreground/5 shadow-inner">
                      <button
                        onClick={() => setMyGoals(Math.max(0, myGoals - 1))}
                        className="w-12 h-12 rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 active:scale-90 transition-all flex items-center justify-center"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-3xl font-black w-8 text-center">{myGoals}</span>
                      <button
                        onClick={() => setMyGoals(myGoals + 1)}
                        className="w-12 h-12 rounded-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 active:scale-90 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-accent rounded-full" />
                    <h4 className="text-lg font-black uppercase italic tracking-tighter">
                      CalificÃƒÂ¡ a tus pibes
                    </h4>
                  </div>
                  <div className="flex flex-col gap-3">
                    {teammates.length === 0 ? (
                      <div className="p-8 text-center text-foreground/40 font-bold uppercase text-[10px] tracking-widest bg-foreground/[0.02] rounded-3xl border border-dashed border-foreground/10">
                        Jugaste sin compaÃƒÂ±eros registrados.
                      </div>
                    ) : (
                      teammates.map((player) => (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          key={player.user_id}
                          className="flex items-center justify-between p-4 bg-foreground/[0.02] rounded-[1.5rem] border border-foreground/5 hover:border-foreground/10 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-background/50 flex flex-col items-center justify-center border border-foreground/10 shadow-inner">
                              {player.profiles?.avatar_url ? (
                                <img
                                  src={player.profiles.avatar_url}
                                  className="w-full h-full rounded-[1rem] object-cover"
                                />
                              ) : (
                                <span className="text-xl font-black italic">
                                  {player.profiles?.name?.[0].toUpperCase() || 'P'}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black uppercase tracking-tight text-foreground truncate max-w-[100px] sm:max-w-xs">
                                {player.profiles?.name || 'Jugador'}
                              </span>
                              <span className="text-[10px] text-foreground/40 uppercase font-black tracking-widest">
                                {player.profiles?.position || 'DC'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 sm:gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <motion.button
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                key={s}
                                onClick={() => handleRatingChange(player.user_id, s)}
                                className={cn(
                                  'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all',
                                  playerRatings[player.user_id] >= s
                                    ? 'bg-accent/20 text-accent border border-accent/20'
                                    : 'bg-foreground/5 text-foreground/20 hover:text-foreground/40'
                                )}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setStep('mvp')}
                  className="w-full h-16 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-auto"
                >
                  SIGUIENTE PASO
                </button>
              </motion.div>
            )}

            {step === 'mvp' && (
              <motion.div
                key="mvp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-start h-full relative overflow-hidden pb-20"
              >
                <div className="w-full text-center space-y-2 mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> BALÃƒâ€œN DE ORO LOCAL
                  </h3>
                  <p className="text-sm font-medium text-foreground/60">
                    Desliza para elegir a la figura. Su ELO sufrirÃƒÂ¡ un boost fenomenal.
                  </p>
                </div>

                <div className="relative w-full max-w-[280px] h-[360px] flex items-center justify-center perspective-1000 z-10 mx-auto">
                  <AnimatePresence>
                    {participants.map((player, idx) => {
                      if (idx < mvpIndex) return null;
                      const isFront = idx === mvpIndex;

                      return (
                        <motion.div
                          key={player.user_id}
                          className="absolute inset-0 bg-background/80 backdrop-blur-3xl rounded-[2rem] border-2 border-accent/20 shadow-[0_30px_60px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center p-6 overflow-hidden"
                          style={{ zIndex: participants.length - idx }}
                          drag={isFront && !selectedMvp ? 'x' : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragEnd={(e, { offset }) => {
                            const swipe = offset.x;
                            if (swipe > 100) setSelectedMvp(player.user_id);
                            else if (swipe < -100) setMvpIndex((prev) => prev + 1);
                          }}
                          initial={{ scale: 0.9, y: 30, opacity: 0 }}
                          animate={{
                            scale: isFront ? 1 : Math.max(0.85, 1 - (idx - mvpIndex) * 0.05),
                            y: isFront ? 0 : (idx - mvpIndex) * 20,
                            opacity: isFront ? 1 : Math.max(0, 1 - (idx - mvpIndex) * 0.3),
                            rotateZ: isFront ? 0 : idx % 2 === 0 ? 3 : -3,
                          }}
                          exit={{
                            x: selectedMvp === player.user_id ? 400 : -400,
                            opacity: 0,
                            rotateZ: selectedMvp === player.user_id ? 20 : -20,
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          whileDrag={{ cursor: 'grabbing', scale: 1.05, rotateZ: 5 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent pointer-events-none" />

                          <div className="w-32 h-32 rounded-[2rem] relative mb-6">
                            <div className="absolute inset-0 bg-accent blur-[40px] opacity-40 rounded-full animate-pulse" />
                            <div className="relative w-full h-full bg-background border border-accent/30 rounded-[2rem] flex items-center justify-center shadow-xl overflow-hidden">
                              {player.profiles?.avatar_url ? (
                                <img
                                  src={player.profiles.avatar_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-5xl font-black italic text-accent">
                                  {player.profiles?.name?.[0].toUpperCase() || 'P'}
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 className="text-3xl font-black italic uppercase text-center leading-none tracking-tighter text-foreground drop-shadow-md">
                            {player.profiles?.name || 'Veterano'}
                          </h4>

                          <div className="flex items-center gap-2 mt-4">
                            <span
                              className={cn(
                                'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border',
                                player.team === 'A'
                                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                  : 'bg-red-500/10 text-red-500 border-red-500/20'
                              )}
                            >
                              EQUIPO {player.team}
                            </span>
                            <span className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest text-accent">
                              {player.profiles?.position || 'DC'}
                            </span>
                          </div>

                          <div className="absolute bottom-6 flex justify-between w-full px-8 pointer-events-none">
                            <div className="flex flex-col items-center opacity-30">
                              <span className="text-[10px] font-black italic tracking-widest text-foreground">
                                OTRO O DÃƒâ€°SPUES
                              </span>
                              <span className="text-xl">Ã°Å¸â€˜Ë†</span>
                            </div>
                            <div className="flex flex-col items-center opacity-100">
                              <span className="text-[10px] font-black italic tracking-widest text-accent">
                                ELEGIR MVP
                              </span>
                              <span className="text-xl">Ã°Å¸â€˜â€°</span>
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
                      className="text-center absolute inset-0 flex flex-col items-center justify-center p-8 bg-foreground/[0.02] rounded-[2rem] border border-dashed border-foreground/10"
                    >
                      <div className="w-20 h-20 bg-foreground/5 rounded-[2rem] flex items-center justify-center mb-6">
                        <Users className="w-10 h-10 text-foreground/20" />
                      </div>
                      <p className="text-2xl text-foreground font-black uppercase tracking-tighter italic mb-4">
                        Ã‚Â¡Nadie fue MVP!
                      </p>
                      <p className="text-[10px] text-foreground/40 uppercase font-black mb-10 px-4 leading-relaxed">
                        Ignoraste a todos los jugadores. Puedes volver o confirmar sin votar.
                      </p>

                      <div className="flex flex-col gap-4 w-full px-4">
                        <button
                          onClick={() => setMvpIndex(0)}
                          className="w-full h-14 bg-foreground/5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-foreground hover:bg-foreground/10 transition-colors border border-foreground/10"
                        >
                          VOLVER A REVISAR
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full h-14 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_15px_30px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 transition-all"
                        >
                          FINALIZAR SIN MVP
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {selectedMvp && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-12 pb-6 px-6 z-30"
                  >
                    <div className="glass-premium p-4 rounded-[2rem] border-2 border-accent bg-accent/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] mb-6">
                      <p className="text-center text-accent font-black uppercase text-sm tracking-widest italic flex items-center justify-center gap-3">
                        <Medal className="w-6 h-6 fill-accent" />
                        Ã‚Â¡VOTASTE A{' '}
                        {participants.find((p) => p.user_id === selectedMvp)?.profiles?.name}!
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setSelectedMvp(null);
                          setMvpIndex(0);
                        }}
                        className="h-16 px-6 sm:px-8 bg-foreground/10 text-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-foreground/20 active:scale-95 transition-all"
                      >
                        DESHACER
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 h-16 bg-accent text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <span className="animate-pulse">ENVIANDO REPORTE...</span>
                        ) : (
                          <>
                            ENVIAR REPORTE OFICIAL <CheckCircle2 className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center gap-8 relative z-50"
              >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />

                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                  className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/30 shadow-[0_0_100px_rgba(16,185,129,0.5)]"
                >
                  <CheckCircle2 className="w-16 h-16 text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </motion.div>

                <div className="space-y-4 max-w-sm">
                  <h3 className="text-4xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                    {isConsensus ? 'Ã‚Â¡Consenso de Resultado!' : 'Ã‚Â¡Reporte Archivo!'}
                  </h3>
                  <p className="text-foreground/60 text-sm font-medium leading-relaxed">
                    {isConsensus
                      ? 'Ambos equipos coinciden. Tu ELO y estadÃƒÂ­sticas ya fueron actualizados masivamente en el sistema.'
                      : 'Estamos esperando que un jugador del equipo rival reporte el mismo resultado para aplicar el cambio de ELO.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="w-full h-16 mt-4 bg-foreground/10 border border-foreground/20 text-foreground font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-foreground/20 active:scale-95 transition-all shadow-xl"
                >
                  VOLVER A LA CANCHA
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
