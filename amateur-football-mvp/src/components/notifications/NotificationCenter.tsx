'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Loader2,
  ArrowRight,
  Shield,
  Swords,
  MapPin,
  Clock,
  Sparkles,
  Inbox,
  UserPlus,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'challenges' | 'teams' | 'friends' | 'matches';

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState<FriendshipData[]>([]);
  const [matchInvites, setMatchInvites] = useState<any[]>([]);
  const [teamRequests, setTeamRequests] = useState<any[]>([]);
  const [teamInvitations, setTeamInvitations] = useState<any[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
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
      setFriendRequests(f || []);
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

  const handleTeamAction = async (teamId: string, targetUserId: string, accept: boolean, id?: string) => {
    const actionId = id || `${teamId}-${targetUserId}`;
    setActionLoading(actionId);
    try {
      await respondToTeamInvitation(teamId, targetUserId, accept ? 'accept' : 'decline');
      setTeamRequests((prev) =>
        prev.filter((r) => (id ? r.id !== id : (r.team_id !== teamId || r.user_id !== targetUserId)))
      );
      setTeamInvitations((prev) =>
        prev.filter((r) => (id ? r.id !== id : (r.team_id !== teamId || r.user_id !== targetUserId)))
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

  const totalNotifs =
    friendRequests.length +
    matchInvites.length +
    teamRequests.length +
    teamInvitations.length +
    teamChallenges.length;

  const filteredNotifications = useMemo(() => {
    const items: any[] = [];
    if (activeFilter === 'all' || activeFilter === 'challenges') {
      items.push(...teamChallenges.map(c => ({ ...c, type: 'challenge' as const })));
    }
    if (activeFilter === 'all' || activeFilter === 'teams') {
      items.push(...teamRequests.map(r => ({ ...r, type: 'team_request' as const })));
      items.push(...teamInvitations.map(i => ({ ...i, type: 'team_invitation' as const })));
    }
    if (activeFilter === 'all' || activeFilter === 'friends') {
      items.push(...friendRequests.map(f => ({ ...f, type: 'friend' as const })));
    }
    if (activeFilter === 'all' || activeFilter === 'matches') {
      items.push(...matchInvites.map(m => ({ ...m, type: 'match' as const })));
    }
    return items;
  }, [activeFilter, teamChallenges, teamRequests, teamInvitations, friendRequests, matchInvites]);

  const panelVariants = {
    initial: isMobile ? { y: '100%' } : { x: '100%' },
    animate: { x: 0, y: 0 },
    exit: isMobile ? { y: '100%' } : { x: '100%' },
  };

  const filterConfigs: { id: FilterType; label: string; icon: any; count: number }[] = [
    { id: 'all', label: 'Todo', icon: Inbox, count: totalNotifs },
    { id: 'challenges', label: 'Retos', icon: Swords, count: teamChallenges.length },
    { id: 'teams', label: 'Equipos', icon: Shield, count: teamRequests.length + teamInvitations.length },
    { id: 'friends', label: 'Amigos', icon: UserPlus, count: friendRequests.length },
    { id: 'matches', label: 'Partidos', icon: Calendar, count: matchInvites.length },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-[2px] lg:backdrop-blur-[4px]"
          />

          {/* Futuristic Panel Container */}
          <motion.div
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="fixed bottom-0 right-0 lg:top-4 lg:right-4 h-[94dvh] lg:h-[calc(100vh-2rem)] w-full lg:w-[480px] z-[101] flex flex-col bg-[#08080c] shadow-2xl border-t lg:border border-white/10 lg:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden"
          >
            {/* Glossy Header */}
            <div className="relative pt-6 sm:pt-8 px-8 sm:px-10 pb-6 flex flex-col gap-6 shrink-0 overflow-hidden border-b border-white/[0.03]">
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase italic">
                      ALERTA <span className="text-primary italic opacity-80">CENTER</span>
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                        Sincronizado vía Pelotify Cloud
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center transition-all bg-white/[0.03] hover:bg-white/[0.1] rounded-xl border border-white/5 active:scale-90"
                >
                  <X className="w-5 h-5 text-foreground/50" />
                </button>
              </div>

              {/* Functional Filter Grid */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {filterConfigs.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 border ${
                      activeFilter === filter.id
                        ? 'bg-primary border-primary text-background'
                        : 'bg-white/[0.03] border-white/5 text-foreground/40 hover:border-white/20'
                    }`}
                  >
                    <filter.icon className="w-3 h-3" />
                    <span>{filter.label}</span>
                    {filter.count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-md ${
                        activeFilter === filter.id ? 'bg-black/20 text-background' : 'bg-primary/20 text-primary'
                      }`}>
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-8 py-6 relative">
              {isLoading ? (
                <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Procesando base de datos...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="h-[50vh] flex flex-col items-center justify-center text-center px-10">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-primary/20" />
                  </div>
                  <h3 className="text-xl font-black text-foreground italic uppercase tracking-widest">SILENCIO TOTAL</h3>
                  <p className="text-[11px] text-foreground/30 mt-3 font-bold uppercase tracking-widest">Todo está bajo control, capitán.</p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: { transition: { staggerChildren: 0.08 } }
                  }}
                  className="flex flex-col gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredNotifications.map((notif) => (
                      <NotificationItem
                        key={`${notif.type}-${notif.id || (notif.team_id + '-' + (notif.user_id || user?.id))}`}
                        type={notif.type}
                        data={notif}
                        onAction={notif.type === 'challenge' ? handleChallengeAction : 
                                 notif.type === 'match' ? handleMatchAction :
                                 notif.type === 'friend' ? handleFriendAction :
                                 (id, accept) => handleTeamAction(notif.team_id, notif.user_id || user!.id, accept)}
                        onVote={handleVote}
                        actionLoading={actionLoading}
                        userId={user?.id}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Bottom Global Action Area */}
            <div className="p-8 border-t border-white/[0.03] bg-gradient-to-b from-transparent to-[#08080c] relative z-20">
              <Link
                href="/friends"
                onClick={onClose}
                className="group w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between px-6 hover:bg-primary/[0.05] hover:border-primary/20 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <UserPlus className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-foreground">Administrar Alianzas</span>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
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
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const config = useMemo(() => {
    switch (type) {
      case 'challenge':
        return {
          icon: Trophy,
          accent: 'bg-amber-500',
          textAccent: 'text-amber-500',
          label: 'RETO PENDIENTE',
          borderColor: 'border-amber-500/20',
          bg: 'bg-amber-500/[0.04]'
        };
      case 'match':
        return {
          icon: Calendar,
          accent: 'bg-accent',
          textAccent: 'text-accent',
          label: 'CITACIÓN',
          borderColor: 'border-accent/20',
          bg: 'bg-accent/[0.04]'
        };
      default:
        return {
          icon: UserPlus,
          accent: 'bg-primary',
          textAccent: 'text-primary',
          label: 'NOTIFICACIÓN SOCIAL',
          borderColor: 'border-primary/20',
          bg: 'bg-primary/[0.04]'
        };
    }
  }, [type]);

  const actionId = data.id || (type === 'team_request' ? `${data.team_id}-${data.user_id}` : `${data.team_id}-${userId}`);
  const isActionLoading = actionLoading === actionId;

  return (
    <motion.div
      variants={itemVariants}
      layout
      className={`relative rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden transition-all duration-300 hover:border-white/10 group`}
    >
      {/* Category Accent Bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${config.accent} opacity-60`} />
      
      <div className="flex flex-col p-5 sm:p-6 gap-4">
        {/* Header Part */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#0a0a0f] border border-white/10 overflow-hidden flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              {type === 'friend' || type === 'team_request' ? (
                data.profiles?.avatar_url ? (
                  <img src={data.profiles.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className={`text-xl font-black italic ${config.textAccent}`}>{data.profiles?.name?.charAt(0)}</span>
                )
              ) : type === 'team_invitation' ? (
                data.teams?.logo_url ? (
                  <img src={data.teams.logo_url} className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-8 h-8 text-primary opacity-40" />
                )
              ) : (
                <config.icon className={`w-8 h-8 ${config.textAccent}`} />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[8px] font-black tracking-[0.2em] uppercase italic ${config.textAccent}`}>
                // {config.label}
              </span>
              <span className="text-[8px] text-white/20 font-bold flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> RECIENTE
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-foreground italic uppercase tracking-tight truncate">
              {type === 'challenge' ? `${data.challenger_team?.name} VS ${data.challenged_team?.name}` :
                type === 'match' ? data.matches?.location :
                type === 'team_invitation' ? data.teams?.name :
                data.profiles?.name || 'Nuevo Contacto'}
            </h4>
            <p className="text-[11px] text-foreground/40 font-medium line-clamp-1 mt-0.5">
              {type === 'challenge' ? `Desafío directo por el honor del potrero.` :
                type === 'match' ? `Evento programado: ${data.matches?.date}` :
                type === 'team_request' ? `Nueva solicitud para ${data.teams?.name}` :
                type === 'team_invitation' ? `Invitación oficial de fichaje` :
                `Desea conectar para futuros partidos`}
            </p>
          </div>
        </div>

        {/* Tactical Info Section (Challenge only) */}
        {type === 'challenge' && data.venue_candidates?.length > 0 && (
          <div className="bg-black/40 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Selección de Sede</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {data.venue_candidates.map((venue: string) => {
                const isVoted = userId ? data.votes?.[userId] === venue : false;
                const voteCount = Object.values(data.votes || {}).filter(v => v === venue).length;
                return (
                  <button
                    key={venue}
                    onClick={() => onVote?.(data.id, venue)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                      isVoted 
                        ? 'bg-amber-500 border-amber-500 text-background' 
                        : 'bg-white/[0.02] border-white/5 text-foreground/30 hover:border-white/10'
                    }`}
                  >
                    <span className="truncate flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5" /> {venue}
                    </span>
                    {voteCount > 0 && <span className="opacity-60 text-[9px]">[{voteCount}]</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Integrated Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => onAction(data.id, true)}
            disabled={isActionLoading}
            className={`h-12 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              config.accent === 'bg-amber-500' ? 'bg-amber-500 text-background' : 
              config.accent === 'bg-accent' ? 'bg-accent text-background' : 'bg-primary text-background'
            } hover:opacity-90 active:scale-[0.97] shadow-lg`}
          >
            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>CONFIRMAR</span>
              </>
            )}
          </button>
          <button
            onClick={() => onAction(data.id, false)}
            disabled={isActionLoading}
            className="h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-foreground/40 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all active:scale-[0.97]"
          >
            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <div className="flex items-center gap-2 uppercase tracking-tighter text-[9px] font-black">
                <X className="w-4 h-4" /> RECHAZAR
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
