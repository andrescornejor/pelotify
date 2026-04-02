'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Share2, 
  ArrowLeft,
  Loader2,
  Check,
  X,
  Shield,
  MessageSquare,
  Activity,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useMatchById, useJoinMatch, useLeaveMatch } from '@/hooks/useMatchQueries';
import { MatchParticipant } from '@/lib/matches';
import { cn } from '@/lib/utils';
import PlayerSlot from '@/components/PlayerSlot';

function EmergencyLobbyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = searchParams.get('id');

  const { data: match, isLoading, error } = useMatchById(id || undefined);
  const joinMutation = useJoinMatch();
  const leaveMutation = useLeaveMatch();

  // If recruitment is disabled or match is completed, go back to normal lobby
  useEffect(() => {
    if (match && (!match.is_recruitment || match.is_completed)) {
      router.replace(`/match?id=${match.id}`);
    }
  }, [match, router]);

  const [copied, setCopied] = useState(false);

  const participants: MatchParticipant[] = match?.participants || [];
  const hasJoined = participants.some(p => p.user_id === user?.id);
  const isCreator = match?.creator_id === user?.id;
  
  const formatNum = parseInt(match?.type?.replace('F', '') || '5');
  const totalSlots = formatNum * 2;
  const missingCount = Math.max(0, totalSlots - participants.length);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!match || !user) return;
    try {
      await joinMutation.mutateAsync({ matchId: match.id, userId: user.id, team: null });
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
            <Zap className="w-10 h-10 text-amber-500" />
          </div>
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/40">Cargando Misión...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-white uppercase italic">Partido no encontrado</h2>
        <button onClick={() => router.push('/')} className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white">
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[50%] bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)]" />
        {/* Animated Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 py-12 flex flex-col min-h-screen">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic">Operativo Urgente</span>
          </div>
          <button 
            onClick={handleShare}
            className={cn(
              "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-90",
              copied ? "bg-green-500/20 border-green-500/50 text-green-500" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
          >
            {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-10 flex-1">
          {/* Urgency Badge & Title */}
          <div className="text-center space-y-4">
             <motion.div
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="inline-block"
             >
                <div className="px-6 py-2 rounded-2xl bg-amber-500 text-black text-[12px] font-black uppercase italic tracking-tighter shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  Faltan {missingCount} Jugadores
                </div>
             </motion.div>
             <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.85] font-kanit">
               Déficit de <br /> <span className="text-amber-500">Refuerzos</span>
             </h1>
             <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
               Misión de reclutamiento inmediata
             </p>
          </div>

          {/* Match Coordinates Card */}
          <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Zap className="w-32 h-32 text-amber-500" />
            </div>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Localización</span>
                      <h3 className="text-2xl font-black italic uppercase text-white truncate max-w-[200px] leading-tight">
                        {match.location}
                      </h3>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                       <Calendar className="w-5 h-5 text-amber-500/40" />
                       <span className="text-xs font-black uppercase truncate">{new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                       <Clock className="w-5 h-5 text-amber-500/40" />
                       <span className="text-xs font-black uppercase">{match.time} HS</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-black text-[9px] text-white/50">
                    <Shield className="w-3 h-3" /> {match.type}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-black text-[9px] text-white/50">
                    <Activity className="w-3 h-3 text-amber-500" /> {match.level || 'Amateur'}
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Inversión</div>
                   <div className="text-xl font-black italic text-white">${match.price}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slot Grid - The "Lobby" aspect */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Unidades Desplegadas</h4>
               <span className="text-[10px] font-black text-amber-500">{participants.length} / {totalSlots}</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
               {/* Occupied Slots */}
               {participants.map((p) => (
                 <motion.div 
                   key={p.id}
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="relative group"
                 >
                    <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-1 flex items-center justify-center relative overflow-hidden">
                       {p.profiles?.avatar_url ? (
                         <img src={p.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                       ) : (
                         <Users className="w-6 h-6 text-white/10" />
                       )}
                       {p.user_id === user?.id && (
                         <div className="absolute inset-0 border-2 border-amber-500 rounded-2xl pointer-events-none" />
                       )}
                    </div>
                    {p.profiles?.name && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-[8px] font-black whitespace-nowrap z-20">
                        {p.profiles.name.toUpperCase()}
                      </div>
                    )}
                 </motion.div>
               ))}

               {/* Empty Slots */}
               {Array.from({ length: missingCount }).map((_, i) => (
                 <motion.div 
                    key={`empty-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ delay: i * 0.1 }}
                    className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center group/empty hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer"
                    onClick={!hasJoined ? handleJoin : undefined}
                 >
                    <Zap className={cn(
                      "w-6 h-6 text-white/5 transition-colors",
                      !hasJoined && "group-hover/empty:text-amber-500 group-hover/empty:animate-pulse"
                    )} />
                 </motion.div>
               ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="sticky bottom-10 mt-12 bg-black/80 backdrop-blur-xl p-6 -mx-6 rounded-t-[3rem] border-t border-white/10">
           {!hasJoined ? (
              <button
                onClick={handleJoin}
                disabled={joinMutation.isPending || missingCount === 0}
                className={cn(
                  "w-full h-20 rounded-3xl font-black italic uppercase text-lg flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl",
                  missingCount > 0 
                    ? "bg-amber-500 text-black hover:scale-[1.02] shadow-amber-500/20" 
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                )}
              >
                {joinMutation.isPending ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                  <>
                    <Zap className="w-6 h-6 fill-current" />
                    {missingCount > 0 ? "Completar Equipo" : "Cupos Agotados"}
                  </>
                )}
              </button>
           ) : (
             <div className="flex gap-4">
                <button
                  onClick={handleShare}
                  className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/10 font-black italic uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                  <Share2 className="w-4 h-4" /> Reclutar Amigos
                </button>
                {!isCreator && (
                  <button
                    onClick={() => leaveMutation.mutateAsync({ matchId: match.id, userId: user!.id })}
                    className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all active:scale-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
             </div>
           )}
           <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] text-center mt-6">
             {hasJoined ? "Estás desplegado en este operativo" : "Unite para asegurar tu lugar de inmediato"}
           </p>
        </div>
      </div>
    </div>
  );
}

export default function EmergencyLobby() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500/20" />
      </div>
    }>
      <EmergencyLobbyContent />
    </Suspense>
  );
}
