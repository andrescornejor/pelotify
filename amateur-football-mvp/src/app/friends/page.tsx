'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getFriends,
  getPendingRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriendship,
  FriendshipData,
  Profile,
  SearchResult,
  getRecommendedPlayers,
} from '@/lib/friends';
import { getMatchInvitations, respondToInvitation } from '@/lib/matches';
import { getTeamInvitations, respondToTeamInvitation } from '@/lib/teams';
import { SocialHubSkeleton } from '@/components/Skeletons';
import {
  Search,
  UserPlus,
  Users,
  Loader2,
  Check,
  X,
  UserMinus,
  Clock,
  UserCheck,
  Calendar,
  Zap,
  Trophy,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import ChatModal from '@/components/ChatModal';
import { MessageSquare } from 'lucide-react';

const PlayerCard = ({
  p,
  i,
  actionLoading,
  handleAcceptRequest,
  handleSendRequest,
  setSearchResults,
}: {
  p: SearchResult;
  i: number;
  actionLoading: string | null;
  handleAcceptRequest: (id: string) => void;
  handleSendRequest: (id: string, name?: string) => void;
  setSearchResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
}) => (
  <motion.div
    key={p.id}
    layout
    initial={{ opacity: 0, scale: 0.9, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
      delay: i * 0.05,
    }}
    className={cn(
      "glass-premium-hover p-10 rounded-[4rem] flex flex-col items-center text-center gap-8 border bg-surface group relative overflow-hidden shadow-2xl transition-all duration-500 hover:bg-foreground/[0.02]",
      p.is_pro ? "border-yellow-500/20 hover:border-yellow-500/40" : "border-foreground/5 hover:border-primary/20"
    )}
  >
    <div className={cn("absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full transition-all pointer-events-none", p.is_pro ? "bg-yellow-500/10 group-hover:bg-yellow-500/20" : "bg-primary/5 group-hover:bg-primary/10")} />

    <Link
      href={`/profile?id=${p.id}`}
      className="flex flex-col items-center gap-6 group/link w-full"
    >
      <div className="w-32 h-32 rounded-[2.5rem] bg-surface-elevated border-2 border-foreground/10 shrink-0 overflow-hidden relative shadow-2xl group-hover/link:scale-110 transition-transform duration-700 group-hover/link:border-primary/40">
        {p.avatar_url ? (
          <img
            src={p.avatar_url}
            alt=""
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/40 font-black text-4xl italic bg-primary/5">
            {p.name?.charAt(0)}
          </div>
        )}
        <div className={cn("absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-110 transition-transform", p.is_pro ? "bg-gradient-to-tr from-yellow-400 to-yellow-600" : "bg-primary/80 md:")}>
          <Zap className="w-4 h-4 text-background" />
        </div>
      </div>

      <div className="space-y-2 w-full">
        <p className="font-black text-2xl text-foreground italic uppercase truncate tracking-tighter group-hover/link:text-primary transition-colors leading-none">
          {p.name}
        </p>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">
            {p.position || 'LÍBERO'}
          </span>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full border border-accent/20">
            <Trophy className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-black text-accent tracking-widest">{p.elo || 0} XP</span>
          </div>
        </div>
      </div>
    </Link>

    <div className="w-full pt-6 border-t border-foreground/5 relative z-20">
      {p.relationshipStatus === 'accepted' ? (
        <div className="w-full h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center gap-3 border border-primary/20 shadow-inner">
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">AMIGO CONFIRMADO</span>
        </div>
      ) : p.relationshipStatus === 'pending_sent' ? (
        <div className="w-full h-14 rounded-2xl bg-foreground/[0.03] text-foreground/30 flex items-center justify-center gap-3 border border-foreground/5 italic">
          <Clock className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">ESPERANDO SEÑAL</span>
        </div>
      ) : p.relationshipStatus === 'pending_received' ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            if (p.friendshipId) handleAcceptRequest(p.friendshipId);
            setSearchResults((prev) =>
              prev.map((item) =>
                item.id === p.id ? { ...item, relationshipStatus: 'accepted' } : item
              )
            );
          }}
          disabled={actionLoading === p.friendshipId}
          className="w-full h-14 rounded-2xl bg-primary text-background text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 active:scale-95 transition-all hover:bg-foreground hover:text-background flex items-center justify-center gap-3 italic"
        >
          {actionLoading === p.friendshipId ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" /> ACEPTAR CONTRATO
            </>
          )}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSendRequest(p.id, p.name);
          }}
          disabled={actionLoading === p.id}
          className="w-full h-14 rounded-2xl bg-primary text-background flex items-center justify-center gap-3 hover:bg-white hover:text-black hover:scale-[1.02] shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 border-2 border-primary group/btn"
        >
          {actionLoading === p.id ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">
                SOLICITAR ALIANZA
              </span>
            </>
          )}
        </button>
      )}
    </div>
  </motion.div>
);

export default function FriendsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  // State
  const [friends, setFriends] = useState<FriendshipData[]>([]);
  const [requests, setRequests] = useState<FriendshipData[]>([]);
  const [matchInvites, setMatchInvites] = useState<any[]>([]);
  const [teamInvites, setTeamInvites] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recommendedPlayers, setRecommendedPlayers] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string } | null>(null);

  // Loading states
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ show: boolean; name: string } | null>(null);

  // Initial fetch
  useEffect(() => {
    if (!user) return;
    const fetchInitialData = async () => {
      try {
        const [f, r, mi, ti, rec] = await Promise.all([
          getFriends(user.id),
          getPendingRequests(user.id),
          getMatchInvitations(user.id),
          getTeamInvitations(user.id),
          getRecommendedPlayers(user.id),
        ]);
        setFriends(f);
        setRequests(r);
        setMatchInvites(mi);
        setTeamInvites(ti);
        setRecommendedPlayers(rec);
      } catch (err) {
        console.error('Error loading friends:', err);
      } finally {
        setIsLoadingInit(false);
      }
    };
    fetchInitialData();
  }, [user]);

  // Search effect
  useEffect(() => {
    if (activeTab !== 'search' || !user || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(user.id, searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeTab, user]);

  // Actions
  const handleSendRequest = async (friendId: string, friendName?: string) => {
    if (!user) return;
    setActionLoading(friendId);
    try {
      await sendFriendRequest(user.id, friendId);
      
      // Update both lists to ensure visual feedback regardless of where the button was clicked
      setSearchResults((prev) =>
        prev.map((p) => (p.id === friendId ? { ...p, relationshipStatus: 'pending_sent' } : p))
      );
      setRecommendedPlayers((prev) =>
        prev.map((p) => (p.id === friendId ? { ...p, relationshipStatus: 'pending_sent' } : p))
      );

      // Show floating notification
      setShowToast({ show: true, name: friendName || 'Jugador' });
      setTimeout(() => setShowToast(null), 4000);

    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      await acceptFriendRequest(friendshipId);
      const req = requests.find((r) => r.id === friendshipId);
      if (req) {
        setFriends((prev) => [...prev, { ...req, status: 'accepted' }]);
        setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRemove = async (friendshipId: string, isRemove = false) => {
    if (isRemove && !confirm('¿Eliminar de tu lista de amigos?')) return;

    setActionLoading(friendshipId);
    try {
      await deleteFriendship(friendshipId);
      if (isRemove) {
        setFriends((prev) => prev.filter((f) => f.id !== friendshipId));
      } else {
        setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMatchInviteResponse = async (id: string, status: 'confirmed' | 'rejected') => {
    setActionLoading(id);
    try {
      await respondToInvitation(id, status);
      setMatchInvites((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTeamInviteResponse = async (teamId: string, action: 'accept' | 'decline') => {
    if (!user) return;
    setActionLoading(teamId);
    try {
      await respondToTeamInvitation(teamId, user.id, action);
      setTeamInvites((prev) => prev.filter((inv) => inv.team_id !== teamId));
      if (action === 'accept') {
        alert('¡Ahora eres parte del equipo!');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoadingInit) {
    return <SocialHubSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-[90vh] bg-background p-3 sm:p-5 lg:px-10 lg:pt-4 xl:px-16 max-w-full mx-auto space-y-8 relative overflow-hidden">
      {/* ── AMBIENT GLOWS ── */}
      <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

      {/* ── HEADER ── */}
      <div className="flex flex-col items-center text-center gap-4 relative z-10 px-4 mb-2">
        <div className="flex items-center gap-4 justify-center">
          <div className="h-[1px] w-12 bg-primary/40" />
          <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic">
            Comunidad & Alianzas
          </span>
          <div className="h-[1px] w-12 bg-primary/40" />
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.9] italic uppercase tracking-tighter drop-shadow-2xl">
          Social <span className="text-primary">Hub</span>
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-foreground/40 max-w-lg mx-auto">
          Conecta con otros jugadores, gestiona tus convocatorias y expande tu red
        </p>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 w-full max-w-full relative z-20">
        <div className="glass-premium p-4 md:p-6 rounded-[2rem] border border-foreground/5 flex flex-col items-center justify-center gap-2 group hover:border-primary/20 transition-all">
          <Users className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">
            {friends.length}
          </div>
          <div className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.2em]">
            AMIGOS
          </div>
        </div>
        <div className="glass-premium p-4 md:p-6 rounded-[2rem] border border-foreground/5 flex flex-col items-center justify-center gap-2 group hover:border-primary/20 transition-all">
          <UserPlus className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">
            {requests.length}
          </div>
          <div className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.2em]">
            SOLICITUDES
          </div>
        </div>
        <div className="glass-premium p-4 md:p-6 rounded-[2rem] border border-foreground/5 flex flex-col items-center justify-center gap-2 group hover:border-accent/20 transition-all text-accent">
          <Calendar className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">
            {matchInvites.length}
          </div>
          <div className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.2em]">
            PARTIDOS
          </div>
        </div>
        <div className="glass-premium p-4 md:p-6 rounded-[2rem] border border-foreground/5 flex flex-col items-center justify-center gap-2 group hover:border-blue-500/20 transition-all text-blue-500">
          <Shield className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">
            {teamInvites.length}
          </div>
          <div className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.2em]">
            EQUIPOS
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="relative z-20 px-4 w-full max-w-full">
        <div className="flex p-2 bg-foreground/[0.02] md: rounded-[2.5rem] border border-foreground/[0.05] relative shadow-2xl">
          <button
            onClick={() => setActiveTab('friends')}
            className={cn(
              'flex-1 flex items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.8rem] transition-all relative',
              activeTab === 'friends'
                ? 'text-background'
                : 'text-foreground/40 hover:text-foreground/70'
            )}
          >
            {activeTab === 'friends' && (
              <motion.div
                layoutId="social-nav-pill"
                className="absolute inset-0 bg-primary rounded-[1.8rem] shadow-[0_10px_40px_rgba(16,185,129,0.4)]"
                transition={{ type: 'spring' as const, stiffness: 500, damping: 40 }}
              />
            )}
            <Users className="w-4 h-4 relative z-10" />
            <span className="relative z-10">AMIGOS</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              'flex-1 flex items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.8rem] transition-all relative',
              activeTab === 'requests'
                ? 'text-background'
                : 'text-foreground/40 hover:text-foreground/70'
            )}
          >
            {activeTab === 'requests' && (
              <motion.div
                layoutId="social-nav-pill"
                className="absolute inset-0 bg-primary rounded-[1.8rem] shadow-[0_10px_40px_rgba(16,185,129,0.4)]"
                transition={{ type: 'spring' as const, stiffness: 500, damping: 40 }}
              />
            )}
            <UserPlus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">SOLICITUDES</span>
            {(requests.length > 0 || matchInvites.length > 0 || teamInvites.length > 0) && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] relative z-10" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={cn(
              'flex-1 flex items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.8rem] transition-all relative',
              activeTab === 'search'
                ? 'text-background'
                : 'text-foreground/40 hover:text-foreground/70'
            )}
          >
            {activeTab === 'search' && (
              <motion.div
                layoutId="social-nav-pill"
                className="absolute inset-0 bg-primary rounded-[1.8rem] shadow-[0_10px_40px_rgba(16,185,129,0.4)]"
                transition={{ type: 'spring' as const, stiffness: 500, damping: 40 }}
              />
            )}
            <Search className="w-4 h-4 relative z-10" />
            <span className="relative z-10">DESCUBRIR</span>
          </button>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── FRIENDS TAB ── */}
            {activeTab === 'friends' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 w-full">
                <AnimatePresence mode="popLayout">
                  {friends.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full flex flex-col items-center justify-center py-32 text-center gap-10 glass-premium rounded-[4rem] border-dashed border-2 border-foreground/5 bg-foreground/[0.01] shadow-none"
                    >
                      <div className="w-32 h-32 bg-foreground/[0.02] rounded-[3rem] border border-foreground/5 flex items-center justify-center animate-float shadow-2xl">
                        <Users className="w-12 h-12 text-foreground/70" />
                      </div>
                      <div className="max-w-sm space-y-4">
                        <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">
                          Sin Amigos Aún
                        </h3>
                        <p className="text-[10px] text-foreground/60 font-black uppercase tracking-[0.3em] leading-relaxed">
                          Todavía no tenés amigos agregados. ¡Buscá gente y sumá pibes!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('search')}
                        className="h-14 px-12 bg-primary text-background font-black uppercase text-[10px] tracking-[0.4em] rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 hover:bg-foreground hover:text-background"
                      >
                        Descubrir Jugadores
                      </button>
                    </motion.div>
                  ) : (
                    friends.map((f, i) => (
                      <motion.div
                        key={f.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn("glass-premium p-8 rounded-[3rem] flex flex-col gap-6 border group transition-all relative overflow-hidden bg-surface", f.profiles?.is_pro ? "border-yellow-500/20 hover:border-yellow-500/40" : "border-foreground/5 hover:border-primary/20")}
                      >
                        <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[50px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity", f.profiles?.is_pro ? "bg-yellow-500/10" : "bg-primary/5")} />

                        <Link
                          href={`/profile?id=${f.profiles?.id}`}
                          className="flex items-center gap-6 group/link"
                        >
                          <div className="w-20 h-20 rounded-[2rem] bg-surface-elevated border-2 border-foreground/10 shrink-0 overflow-hidden relative group-hover:border-primary/40 group-hover:scale-105 transition-all duration-500 shadow-2xl">
                            {f.profiles?.avatar_url ? (
                              <img
                                src={f.profiles.avatar_url}
                                alt=""
                                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary/40 font-black text-3xl italic bg-primary/[0.02]">
                                {f.profiles?.name?.charAt(0)}
                              </div>
                            )}
                            <div className={cn("absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-bl-xl shadow-lg", f.profiles?.is_pro ? "bg-gradient-to-tr from-yellow-400 to-yellow-600" : "bg-primary/80 md:")}>
                              <Zap className="w-3.5 h-3.5 text-background" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="font-black text-2xl text-foreground italic uppercase truncate tracking-tighter group-hover/link:text-primary transition-colors">
                              {f.profiles?.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60">
                                {f.profiles?.position || 'Jugador Polivalente'}
                              </span>
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-center justify-between pt-4 border-t border-foreground/5">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-widest text-foreground/70">
                                EXPERIENCIA
                              </span>
                              <div className="flex items-center gap-2">
                                <Trophy className="w-3.5 h-3.5 text-accent" />
                                <span className="text-sm font-black text-foreground italic tracking-tighter">
                                  {f.profiles?.elo || 0}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-widest text-foreground/70">
                                RANGO
                              </span>
                              <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">
                                PREMIER
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() =>
                                setChatRecipient({
                                  id: f.profiles?.id || '',
                                  name: f.profiles?.name || 'Jugador',
                                })
                              }
                              className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all flex items-center justify-center group/chat shadow-lg shadow-primary/5 active:scale-95"
                            >
                              <MessageSquare className="w-5 h-5 group-hover/chat:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleRejectRemove(f.id, true)}
                              disabled={actionLoading === f.id}
                              className="w-12 h-12 rounded-2xl bg-foreground/[0.02] text-foreground/80 hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center justify-center border border-foreground/5 group-hover:border-foreground/10"
                            >
                              {actionLoading === f.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <UserMinus className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── REQUESTS TAB ── */}
            {activeTab === 'requests' && (
              <div className="space-y-16 px-4 w-full">
                {/* ── FRIEND REQUESTS ── */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                        <UserPlus className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                          Peticiones de Amistad
                        </h3>
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                          Aspirantes a tu red de contactos
                        </span>
                      </div>
                    </div>
                    <div className="px-5 py-2 bg-primary/5 rounded-full border border-primary/20 shadow-sm">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {requests.length} PENDIENTES
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.length === 0 ? (
                      <div className="col-span-full text-center py-20 glass-premium rounded-[3rem] border-dashed border-2 border-foreground/5 opacity-40 bg-foreground/[0.01]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/70 italic">
                          No hay peticiones de alianza en espera
                        </p>
                      </div>
                    ) : (
                      requests.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn("glass-premium p-6 rounded-[2.5rem] flex items-center gap-6 border transition-all group shadow-none", r.profiles?.is_pro ? "border-yellow-500/20 bg-yellow-500/[0.01] hover:bg-yellow-500/[0.03]" : "border-primary/20 bg-primary/[0.01] hover:bg-primary/[0.03]")}
                        >
                          <Link
                            href={`/profile?id=${r.profiles?.id}`}
                            className="flex-1 flex items-center gap-6 group/link"
                          >
                            <div className="w-16 h-16 rounded-2xl bg-surface-elevated border-2 border-primary/30 shrink-0 overflow-hidden shadow-2xl group-hover/link:scale-105 transition-transform duration-500">
                              {r.profiles?.avatar_url ? (
                                <img
                                  src={r.profiles.avatar_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary/40 font-black text-2xl italic bg-primary/[0.02]">
                                  {r.profiles?.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="font-black text-lg text-foreground uppercase italic truncate tracking-tighter group-hover/link:text-primary transition-colors">
                                {r.profiles?.name || 'Nuevo Aspirante'}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <p className="text-[10px] text-foreground/50 font-black uppercase tracking-widest">
                                  Convocatoria Activa
                                </p>
                              </div>
                            </div>
                          </Link>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptRequest(r.id)}
                              disabled={actionLoading === r.id}
                              className="w-12 h-12 rounded-2xl bg-primary text-background hover:bg-foreground transition-all flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90"
                            >
                              {actionLoading === r.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectRemove(r.id)}
                              disabled={actionLoading === r.id}
                              className="w-12 h-12 rounded-2xl bg-foreground/[0.03] text-foreground/50 hover:text-foreground transition-all flex items-center justify-center border border-foreground/5 active:scale-90"
                            >
                              {actionLoading === r.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <X className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* ── MATCH INVITATIONS ── */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-lg">
                        <Calendar className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                          Eventos y Convocatorias
                        </h3>
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                          Llamados directos al campo de juego
                        </span>
                      </div>
                    </div>
                    <div className="px-5 py-2 bg-accent/5 rounded-full border border-accent/20 shadow-sm">
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">
                        {matchInvites.length} PENDIENTES
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matchInvites.length === 0 ? (
                      <div className="col-span-full text-center py-20 glass-premium rounded-[3rem] border-dashed border-2 border-foreground/5 opacity-40 bg-foreground/[0.01]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/70 italic">
                          No hay llamados activos en este ciclo
                        </p>
                      </div>
                    ) : (
                      matchInvites.map((inv, i) => (
                        <motion.div
                          key={inv.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass-premium overflow-hidden rounded-[3rem] border border-accent/20 bg-accent/[0.01] hover:bg-accent/[0.03] transition-all group flex flex-col shadow-none"
                        >
                          <div className="p-8 flex items-start gap-6 bg-gradient-to-br from-accent/[0.05] to-transparent">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 shadow-2xl group-hover:rotate-6 transition-transform">
                              <Star className="w-8 h-8 text-accent fill-accent/10" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <p className="font-black text-2xl text-foreground italic uppercase truncate tracking-tighter group-hover:text-accent transition-colors leading-none">
                                {inv.matches?.location}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-accent uppercase tracking-[0.2em]">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {inv.matches?.date}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em]">
                                  <Clock className="w-3.5 h-3.5 opacity-50" />
                                  {inv.matches?.time}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 pt-0 flex gap-4">
                            <button
                              onClick={() => handleMatchInviteResponse(inv.id, 'confirmed')}
                              disabled={actionLoading === inv.id}
                              className="flex-1 h-14 rounded-2xl bg-accent text-background text-[10px] font-black uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-all shadow-xl shadow-accent/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                              {actionLoading === inv.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>CONFIRMAR ASISTENCIA</>
                              )}
                            </button>
                            <button
                              onClick={() => handleMatchInviteResponse(inv.id, 'rejected')}
                              disabled={actionLoading === inv.id}
                              className="w-14 h-14 rounded-2xl bg-foreground/[0.03] text-foreground/50 hover:text-foreground transition-all border border-foreground/5 active:scale-95 flex items-center justify-center"
                            >
                              {actionLoading === inv.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <X className="w-6 h-6" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* ── TEAM INVITATIONS ── */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg">
                        <Shield className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                          Fichajes de Equipos
                        </h3>
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                          Convocatorias para unirte a planteles oficiales
                        </span>
                      </div>
                    </div>
                    <div className="px-5 py-2 bg-blue-500/5 rounded-full border border-blue-500/20 shadow-sm">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                        {teamInvites.length} PENDIENTES
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teamInvites.length === 0 ? (
                      <div className="col-span-full text-center py-20 glass-premium rounded-[3rem] border-dashed border-2 border-foreground/5 opacity-40 bg-foreground/[0.01]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/70 italic">
                          No hay convocatorias de equipos en este ciclo
                        </p>
                      </div>
                    ) : (
                      teamInvites.map((inv, i) => (
                        <motion.div
                          key={inv.team_id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass-premium overflow-hidden rounded-[3rem] border border-primary/20 bg-primary/[0.01] hover:bg-primary/[0.03] transition-all group flex flex-col shadow-none"
                        >
                          <div className="p-8 flex items-start gap-6 bg-gradient-to-br from-primary/[0.05] to-transparent">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-surface-elevated flex items-center justify-center shrink-0 border border-foreground/10 shadow-2xl group-hover:rotate-6 transition-transform relative overflow-hidden">
                              {inv.teams?.logo_url ? (
                                <img
                                  src={inv.teams.logo_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Shield className="w-8 h-8 text-primary/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <p className="font-black text-2xl text-foreground italic uppercase truncate tracking-tighter group-hover:text-primary transition-colors leading-none">
                                {inv.teams?.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-black text-foreground/50 uppercase tracking-widest italic">
                                  CONVOCATORIA ABIERTA
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 pt-0 flex gap-4">
                            <button
                              onClick={() => handleTeamInviteResponse(inv.team_id, 'accept')}
                              disabled={actionLoading === inv.team_id}
                              className="flex-1 h-14 rounded-2xl bg-primary text-background text-[10px] font-black uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                              {actionLoading === inv.team_id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>UNIRSE AL PLANTEL</>
                              )}
                            </button>
                            <button
                              onClick={() => handleTeamInviteResponse(inv.team_id, 'decline')}
                              disabled={actionLoading === inv.team_id}
                              className="w-14 h-14 rounded-2xl bg-foreground/[0.03] text-foreground/50 hover:text-foreground transition-all border border-foreground/5 active:scale-95 flex items-center justify-center"
                            >
                              {actionLoading === inv.team_id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <X className="w-6 h-6" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── SEARCH TAB ── */}
            {activeTab === 'search' && (
              <div className="space-y-12 px-4 w-full mx-auto">
                <div className="relative group w-full max-w-7xl mx-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-[2.6rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200" />
                  <div className="relative bg-background rounded-[2.5rem]">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                      <Search
                        className={cn(
                          'w-6 h-6 transition-colors duration-300',
                          searchQuery.length > 0 ? 'text-primary' : 'text-foreground/30'
                        )}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Busca por nombre o posición..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-20 pl-16 pr-32 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 focus:bg-foreground/[0.04] focus:border-primary/50 outline-none transition-all text-lg font-bold text-foreground placeholder:text-foreground/20 placeholder:italic shadow-2xl"
                    />
                    <div className="absolute inset-y-0 right-6 flex items-center">
                      <div
                        className={cn(
                          'px-4 py-2 rounded-xl border transition-all duration-500 flex items-center gap-2',
                          isSearching
                            ? 'bg-primary text-background border-primary'
                            : 'bg-primary/5 text-primary border-primary/20'
                        )}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full bg-current',
                            isSearching && 'animate-pulse'
                          )}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                          {isSearching ? 'BUSCANDO' : 'READY'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isSearching ? (
                  <div className="relative py-32 flex flex-col items-center justify-center overflow-hidden rounded-[3rem] border border-primary/10 bg-primary/[0.01]">
                    {/* Radar Pulse Background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-64 h-64 border border-primary/20 rounded-full animate-radar-pulse"
                          style={{ animationDelay: `${i * 1}s` }}
                        />
                      ))}
                    </div>

                    <div className="relative z-10 space-y-8 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full border-2 border-primary border-t-transparent animate-spin p-2 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                        <div className="w-full h-full rounded-full border border-primary/30 border-b-transparent animate-spin-reverse" />
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <h3 className="text-xl font-black text-primary italic uppercase tracking-[0.4em] animate-pulse">
                          Buscando Jugadores
                        </h3>
                        <div className="w-32 h-1 bg-foreground/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            animate={{ width: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : searchQuery.length > 0 ? (
                  searchResults.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-32 glass-premium rounded-[4rem] border-dashed border-2 border-foreground/5 opacity-40 bg-foreground/[0.01]"
                    >
                      <p className="text-xl font-black uppercase tracking-[0.2em] text-foreground/60 italic">
                        Sin señales detectadas
                      </p>
                      <p className="text-[10px] text-foreground/80 font-bold uppercase tracking-widest mt-2">
                        Prueba con otro término de búsqueda
                      </p>
                    </motion.div>
                  ) : (
                    <div className="relative max-w-full mx-auto py-10">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-40 w-full animate-scan-line pointer-events-none z-0" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10 px-4">
                        <AnimatePresence mode="popLayout">
                          {searchResults.map((p, i) => (
                            <PlayerCard
                              key={p.id}
                              p={p}
                              i={i}
                              actionLoading={actionLoading}
                              handleAcceptRequest={handleAcceptRequest}
                              handleSendRequest={handleSendRequest}
                              setSearchResults={setSearchResults}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] w-8 bg-primary/30" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] italic">
                          Jugadores Destacados
                        </span>
                        <div className="h-[1px] w-8 bg-primary/30" />
                      </div>
                      <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">
                        Radar <span className="text-primary">Global</span>
                      </h2>
                      <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest max-w-sm">
                        Explora la comunidad y encuentra nuevos aliados para tu próximo partido
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10 px-4">
                      <AnimatePresence mode="popLayout">
                        {recommendedPlayers.map((p, i) => (
                          <PlayerCard
                            key={p.id}
                            p={p}
                            i={i}
                            actionLoading={actionLoading}
                            handleAcceptRequest={handleAcceptRequest}
                            handleSendRequest={handleSendRequest}
                            setSearchResults={setRecommendedPlayers}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <ChatModal
        isOpen={!!chatRecipient}
        onClose={() => setChatRecipient(null)}
        recipientId={chatRecipient?.id}
        recipientName={chatRecipient?.name}
      />

      {/* ── SUCCESS TOAST ── */}
      <AnimatePresence>
        {showToast?.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
          >
            <div className="glass-premium p-6 rounded-[2rem] border border-primary/30 bg-primary/5 md: shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-progress-glow" />
              
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <Check className="w-8 h-8 text-background" strokeWidth={3} />
                </motion.div>
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-black text-foreground italic uppercase tracking-tighter">
                  Solicitud Enviada
                </h4>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                  Jugador: <span className="text-foreground">{showToast.name}</span>
                </p>
              </div>

              <button 
                onClick={() => setShowToast(null)}
                className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-foreground/20" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
