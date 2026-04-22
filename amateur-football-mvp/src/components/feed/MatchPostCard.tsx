'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, memo } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { getFormatMeta, getMatchSport, getMaxPlayers, getSportMeta, SPORT_META } from '@/lib/sports';

interface MatchPostCardProps {
  matchId: string;
}

const MatchPostCard = memo(function MatchPostCard({ matchId }: MatchPostCardProps) {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*, participants:match_participants(count)')
          .eq('id', matchId)
          .single();

        if (error) {
          console.error('Supabase error fetching match:', error);
          setErrorStatus(error.message);
          setLoading(false);
          return;
        }
        
        if (!data) {
          setErrorStatus('Not found');
          setLoading(false);
          return;
        }

        setMatch(data);
      } catch (err: any) {
        console.error('Catch error fetching match for card:', err);
        setErrorStatus(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="w-full h-32 glass-premium rounded-[2.5rem] animate-pulse flex items-center justify-center border border-white/5 my-4">
        <div className="flex flex-col items-center gap-2">
          <Zap className="w-6 h-6 text-primary/20 animate-pulse" />
          <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Cargando Match...</span>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="w-full p-6 glass-premium rounded-[2.5rem] border border-red-500/20 flex items-center justify-center gap-3 my-4">
        <AlertCircle className="w-5 h-5 text-red-500/50" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">No se pudo cargar el partido</span>
          <span className="text-[8px] font-bold text-red-500/30 uppercase tracking-widest">{errorStatus}</span>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const dateLabel = new Date(match.date + 'T12:00:00').toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  const sport = getMatchSport(match);
  const sportMeta = getSportMeta(sport);
  const format = getFormatMeta(match.type, sport);
  const maxPlayers = getMaxPlayers(match);
  const currentPlayers = match.participants?.[0]?.count || 0;
  const missing = Math.max(0, maxPlayers - currentPlayers);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full glass-premium rounded-[2.5rem] border border-primary/20 flex flex-col sm:flex-row overflow-hidden my-4 group hover:border-primary/40 transition-all shadow-2xl"
    >
      {/* Visual Side */}
      <div className="w-full sm:w-40 h-32 sm:h-auto relative overflow-hidden shrink-0">
        <img 
          src={sportMeta.heroImage}
          alt="" 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/90 sm:hidden" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/90 hidden sm:block" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full glass border border-primary/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
              {SPORT_META[sport].shortLabel}
            </div>
            <div className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5",
              missing > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-white/5 text-white/40 border-white/5"
            )}>
              {missing > 0 && <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />}
              {missing > 0 ? `${missing} ${sportMeta.availabilityLabel}` : 'Completo'}
            </div>
          </div>
          <div className="text-sm font-black text-primary italic uppercase tracking-tighter">
            ${match.price}
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none group-hover:text-primary transition-colors truncate">
            {match.location}
          </h3>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
            {format.label}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary/60" />
              {dateLabel}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary/60" />
              {match.time} HS
            </div>
          </div>
        </div>

        <Link
          href={`/match?id=${match.id}`}
          className="w-full h-14 rounded-2xl bg-primary text-black font-black italic uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <Zap className="w-4 h-4 fill-current" />
          Unirme al {sportMeta.gameLabel}
        </Link>
      </div>
    </motion.div>
  );
});

export default MatchPostCard;
