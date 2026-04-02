'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPendingRequests,
  acceptFriendRequest,
  deleteFriendship,
  FriendshipData,
} from '@/lib/friends';
import { getMatchInvitations, respondToInvitation } from '@/lib/matches';
import {
  getPendingJoinRequestsForCaptain,
  respondToTeamInvitation,
  getTeamInvitations,
} from '@/lib/teams';
import {
  getPendingChallengesForMember,
  respondToChallenge,
  voteForVenue,
} from '@/lib/teamChallenges';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  Users,
  Calendar,
  Loader2,
  ArrowRight,
  Shield,
  Swords,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
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
  const [teamChallenges, setTeamChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [f, m, t, ti, tc] = await Promise.all([
        getPendingRequests(user.id),
        getMatchInvitations(user.id),
        getPendingJoinRequestsForCaptain(user.id),
        getTeamInvitations(user.id),
        getPendingChallengesForMember(user.id),
      ]);
      setFriendRequests(f);
      setMatchInvites(m || []);
      setTeamRequests(t || []);
      setTeamInvitations(ti || []);
      setTeamChallenges(tc || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
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
      setFriendRequests((prev) => prev.filter((r) => r.id !== id));
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
      setMatchInvites((prev) => prev.filter((m) => m.id !== id));
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
      setTeamRequests((prev) =>
        prev.filter((r) => r.team_id !== teamId || r.user_id !== targetUserId)
      );
      setTeamInvitations((prev) =>
        prev.filter((r) => r.team_id !== teamId || r.user_id !== targetUserId)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleChallengeAction = async (challengeId: string, accept: boolean) => {
    setActionLoading(challengeId);
    try {
      await respondToChallenge(challengeId, accept ? 'accepted' : 'declined');
      setTeamChallenges((prev) => prev.filter((c) => c.id !== challengeId));
    } catch (err: any) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVote = async (challengeId: string, venueName: string) => {
    const actionId = `${challengeId}-vote-${venueName}`;
    setActionLoading(actionId);
    try {
      await voteForVenue(challengeId, user!.id, venueName);
      setTeamChallenges((prev) =>
        prev.map((c) => {
          if (c.id === challengeId) {
            return { ...c, votes: { ...(c.votes || {}), [user!.id]: venueName } };
          }
          return c;
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const hasNotifications =
    friendRequests.length > 0 ||
    matchInvites.length > 0 ||
    teamRequests.length > 0 ||
    teamInvitations.length > 0 ||
    teamChallenges.length > 0;

  const totalNotifs =
    friendRequests.length +
    matchInvites.length +
    teamRequests.length +
    teamInvitations.length +
    teamChallenges.length;

  const panelVariants = {
    initial: isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 },
    animate: { x: 0, y: 0 },
    exit: isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 },
  };

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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed bottom-0 lg:top-0 lg:right-0 h-[92dvh] lg:h-full w-full lg:w-[480px] z-[101] flex flex-col bg-[#08080c] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] lg:shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.5)] border-t lg:border-t-0 lg:border-l border-white/5 lg:rounded-l-[3.5rem] rounded-t-[3.5rem] lg:rounded-tr-none overflow-hidden"
          >
            {/* Header / Mobile Handle */}
            <div className="relative pt-4 sm:pt-6 lg:p-10 lg:pb-6 flex flex-col gap-6 overflow-hidden shrink-0">
              {/* Handle for mobile */}
              <div className="flex lg:hidden justify-center items-center py-2">
                <div className="w-12 h-1.5 rounded-full bg-white/10" />
              </div>

              <div className="p-8 lg:p-0 flex flex-col gap-6">
                {/* Background gradient for header */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[1.75rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(44,252,125,0.1)]">
                      <Bell className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic flex items-center gap-3">
                        Notificaciones
                        {totalNotifs > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center justify-center bg-primary text-background text-[11px] font-black h-6 min-w-[24px] px-2 rounded-full ring-4 ring-primary/10 shadow-lg shadow-primary/20"
                          >
                            {totalNotifs}
                          </motion.span>
                        )}
                      </h2>
                      <p className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.3em] mt-1 italic">
                        Centro de Comandancia
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-12 h-12 flex items-center justify-center transition-all hover:bg-white/[0.05] rounded-full border border-transparent hover:border-white/10 group"
                  >
                    <X className="w-6 h-6 text-foreground/20 group-hover:text-foreground transition-colors" />
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-3 relative z-10 overflow-x-auto no-scrollbar py-2">
                  {[
                    { id: 'all', label: 'Todo', active: true },
                    { id: 'challenges', label: 'Retos', count: teamChallenges.length },
                    { id: 'teams', label: 'Equipos', count: teamRequests.length + teamInvitations.length },
                    { id: 'friends', label: 'Amigos', count: friendRequests.length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      className={`px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-xl flex items-center gap-2 ${
                        filter.active 
                          ? 'bg-primary text-background shadow-primary/20' 
                          : 'bg-white/[0.03] text-foreground/40 border border-white/5 hover:bg-white/[0.06] hover:text-foreground hover:shadow-white/5'
                      }`}
                    >
                      {filter.label}
                      {filter.count! > 0 && <span className={`w-1.5 h-1.5 rounded-full ${filter.active ? 'bg-background/40' : 'bg-primary/60'}`} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-40">
              {isLoading ? (
                <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[2.5rem] border-2 border-primary/10 flex items-center justify-center bg-primary/[0.02]">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                    <div className="absolute inset-x-0 -bottom-6 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="w-1/2 h-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-black text-foreground/80 uppercase italic tracking-[0.2em]">Pateando Servidores</h4>
                    <p className="text-[11px] text-foreground/20 font-black uppercase tracking-widest mt-2">Sincronizando el potrero...</p>
                  </div>
                </div>
              ) : !hasNotifications ? (
                <div className="h-[45vh] flex flex-col items-center justify-center text-center px-10">
                  <div className="relative mb-10">
                    <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full scale-[2]" />
                    <div className="relative w-32 h-32 rounded-[3.5rem] bg-foreground/[0.02] border border-white/5 flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-14 h-14 text-primary/20" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tight">Cancha Despejada</h3>
                  <p className="text-sm text-foreground/30 mt-4 leading-relaxed font-bold uppercase tracking-widest">
                    No hay eventos pendientes. <br/>¡Salí a jugar!
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-10 px-10 py-4 rounded-3xl bg-white/[0.04] border border-white/10 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-95"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: { transition: { staggerChildren: 0.1 } }
                  }}
                  className="flex flex-col gap-5 py-6"
                >
                  {/* Notifications will be rendered here */}
                  <AnimatePresence mode="popLayout">
                    {teamChallenges.map((challenge) => (
                      <NotificationItem key={challenge.id} type="challenge" data={challenge} onAction={handleChallengeAction} onVote={handleVote} actionLoading={actionLoading} userId={user?.id} />
                    ))}
                    {teamRequests.map((req) => (
                      <NotificationItem key={`${req.team_id}-${req.user_id}`} type="team_request" data={req} onAction={(id: string, accept: boolean) => handleTeamAction(req.team_id, req.user_id, accept)} actionLoading={actionLoading} />
                    ))}
                    {teamInvitations.map((inv) => (
                      <NotificationItem key={`${inv.team_id}-${user?.id}`} type="team_invitation" data={inv} onAction={(id: string, accept: boolean) => handleTeamAction(inv.team_id, user!.id, accept)} actionLoading={actionLoading} />
                    ))}
                    {matchInvites.map((inv) => (
                      <NotificationItem key={inv.id} type="match" data={inv} onAction={handleMatchAction} actionLoading={actionLoading} />
                    ))}
                    {friendRequests.map((req) => (
                      <NotificationItem key={req.id} type="friend" data={req} onAction={handleFriendAction} actionLoading={actionLoading} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Bottom Floating Footer / Action Bar */}
            {hasNotifications && (
              <div className="absolute inset-x-0 bottom-0 p-8 pt-0 pointer-events-none">
                <div className="h-20 bg-gradient-to-t from-[#08080c] to-transparent w-full mb-[-1px]" />
                <div className="bg-[#08080c]/80 backdrop-blur-2xl p-6 lg:pb-10 rounded-[2.5rem] border border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
                  <Link
                    href="/friends"
                    onClick={onClose}
                    className="group relative flex items-center justify-between w-full h-[70px] px-8 rounded-[1.75rem] bg-primary text-background overflow-hidden shadow-2xl shadow-primary/20 active:scale-[0.98] transition-transform"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[wave_1.5s_infinite] pointer-events-none" />
                    <div className="flex flex-col items-start relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Centro Comunitario</span>
                      <span className="text-base font-black uppercase tracking-tight italic">Ver Todas las Alianzas</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-background/10 backdrop-blur-md flex items-center justify-center relative z-10 group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface NotificationItemProps {
  type: 'challenge' | 'match' | 'team_request' | 'team_invitation' | 'friend';
  data: any;
  onAction: (id: string, accept: boolean) => void;
  onVote?: (challengeId: string, venueName: string) => void;
  actionLoading: string | null;
  userId?: string;
}

function NotificationItem({ type, data, onAction, onVote, actionLoading, userId }: NotificationItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }
  };

  const getStyle = () => {
    switch (type) {
      case 'challenge': return 'border-amber-500/20 bg-amber-500/[0.04] shadow-amber-500/5';
      case 'match': return 'border-accent/20 bg-accent/[0.04] shadow-accent/5';
      default: return 'border-white/5 bg-white/[0.03] shadow-black/20';
    }
  };

  const isActionLoading = actionLoading === (data.id || (type === 'team_request' ? `${data.team_id}-${data.user_id}` : `${data.team_id}-${userId}`));

  return (
    <motion.div
      variants={itemVariants}
      layout
      className={`relative p-6 sm:p-7 rounded-[2.5rem] border shadow-2xl transition-all duration-300 group overflow-hidden ${getStyle()}`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
        {/* Avatar Section */}
        <div className="shrink-0 relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.75rem] bg-[#0d0d15] border-2 border-white/5 overflow-hidden flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
            {type === 'friend' || type === 'team_request' ? (
              data.profiles?.avatar_url ? (
                <img src={data.profiles.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black italic text-primary">{data.profiles?.name?.charAt(0)}</span>
              )
            ) : type === 'team_invitation' ? (
              data.teams?.logo_url ? (
                <img src={data.teams.logo_url} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-10 h-10 text-primary/30" strokeWidth={1} />
              )
            ) : type === 'challenge' ? (
              <div className="w-full h-full bg-amber-500/10 flex items-center justify-center">
                <Swords className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
              </div>
            ) : (
              <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-accent" strokeWidth={1.5} />
              </div>
            )}
          </div>
          {type === 'challenge' && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 rounded-full border-4 border-[#08080c] flex items-center justify-center shadow-xl"
            >
              <Swords className="w-3.5 h-3.5 text-background" />
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest italic ${
                type === 'challenge' ? 'bg-amber-500/10 text-amber-500' :
                type === 'match' ? 'bg-accent/10 text-accent' :
                'bg-primary/10 text-primary'
              }`}>
                {type === 'challenge' ? 'Pacto de Sangre' :
                 type === 'match' ? 'Invocación' :
                 type === 'team_request' ? 'Mercado de Pases' :
                 type === 'team_invitation' ? 'Fichaje' : 'Social'}
              </span>
              <span className="text-[9px] text-foreground/20 font-black uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> AHORA
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-black text-foreground italic uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
              {type === 'challenge' ? `${data.challenger_team?.name} VS ${data.challenged_team?.name}` : 
               type === 'match' ? data.matches?.location :
               type === 'team_invitation' ? data.teams?.name :
               data.profiles?.name || 'Jugador'}
            </h4>

            <p className="text-xs sm:text-[13px] text-foreground/40 font-medium leading-relaxed max-w-[280px]">
              {type === 'challenge' ? `Un nuevo rival te desafía a dominar el potrero.` :
               type === 'match' ? `Te convocaron para jugar el ${data.matches?.date}.` :
               type === 'team_request' ? `Está pidiendo el pase para unirse a ${data.teams?.name}.` :
               type === 'team_invitation' ? `Te ofrecen contrato para sumarte a sus filas.` :
               `Busca sellar una alianza contigo.`}
            </p>
          </div>

          {/* Voting or Metadata */}
          {type === 'challenge' && data.venue_candidates?.length > 0 && (
            <div className="space-y-3 bg-black/40 p-4 rounded-3xl border border-white/5 shadow-inner">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2 italic">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> Sede en Disputa
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {data.venue_candidates.map((venue: string) => {
                  const isVoted = data.votes?.[userId] === venue;
                  const voteCount = Object.values(data.votes || {}).filter(v => v === venue).length;
                  return (
                    <button
                      key={venue}
                      onClick={() => onVote(data.id, venue)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-[11px] font-black uppercase transition-all ${
                        isVoted ? 'bg-amber-500 border-amber-500 text-background shadow-lg shadow-amber-500/20' : 'bg-white/[0.02] border-white/5 text-foreground/40 hover:bg-white/[0.05] hover:border-white/10'
                      }`}
                    >
                      <span className="truncate max-w-[150px] italic">{venue}</span>
                      <div className="flex items-center gap-3">
                        {voteCount > 0 && <span className="text-[10px] opacity-60 bg-black/20 px-2 py-0.5 rounded-full">{voteCount}</span>}
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isVoted ? 'bg-background border-background' : 'border-white/10'}`}>
                          {isVoted && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAction(data.id, true)}
              disabled={isActionLoading}
              className={`flex-[2] h-14 rounded-[1.5rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] italic transition-all ${
                type === 'challenge' ? 'bg-amber-500 text-background shadow-xl shadow-amber-500/20' :
                type === 'match' ? 'bg-accent text-background shadow-xl shadow-accent/20' :
                'bg-primary text-background shadow-xl shadow-primary/20'
              } hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group/act`}
            >
              {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Check className="w-5 h-5 group-hover/act:scale-125 transition-transform" strokeWidth={4} />
                  <span>Confirmar</span>
                </>
              )}
            </button>
            <button
              onClick={() => onAction(data.id, false)}
              disabled={isActionLoading}
              className="flex-1 h-14 rounded-[1.5rem] bg-white/[0.04] border border-white/5 flex items-center justify-center text-foreground/20 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all active:scale-[0.98]"
            >
              <X className="w-6 h-6" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative background effects for cards */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2 ${
         type === 'challenge' ? 'bg-amber-500' :
         type === 'match' ? 'bg-accent' : 'bg-primary'
      }`} />
    </motion.div>
  );
}
