'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface MatchPostCardProps {
  matchId: string;
}

export default function MatchPostCard({ matchId }: MatchPostCardProps) {
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

  const maxPlayers = match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
  const currentPlayers = match.participants?.[0]?.count || 0;
  const missing = Math.max(0, maxPlayers - currentPlayers);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full premium-card flex flex-col sm:flex-row overflow-hidden my-6 group"
    >
      {/* Visual Side */}
      <div className="w-full sm:w-48 h-40 sm:h-auto relative overflow-hidden shrink-0">
        <img 
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600" 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent sm:bg-gradient-to-r" />
        <div className="absolute top-4 left-4 z-10">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] font-display">
            {match.type}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-4 px-4 sm:hidden">
             <div className="text-2xl font-black italic uppercase text-white font-display drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
               {match.location}
             </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 p-6 flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border flex items-center gap-2",
              missing > 0 ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-white/40 border-white/5"
            )}>
              {missing > 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              {missing > 0 ? `${missing} lugares` : 'Partido Completo'}
            </div>
            
            <div className="text-xl font-display text-primary italic">
              <span className="text-[10px] font-bold text-white/20 mr-1 not-italic">AR$</span>
              {match.price}
            </div>
          </div>

          <div className="hidden sm:block">
            <h3 className="text-2xl lg:text-3xl font-display text-foreground leading-tight group-hover:text-primary transition-colors truncate">
              {match.location}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary/60" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-display">Fecha</span>
                <span className="text-xs font-bold text-white/80 uppercase">{dateLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary/60" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-display">Horario</span>
                <span className="text-xs font-bold text-white/80 uppercase">{match.time} HS</span>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={`/match?id=${match.id}`}
          className="w-full h-14 rounded-2xl bg-primary text-black font-display text-sm tracking-wide flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all press-effect"
        >
          <Zap className="w-4 h-4 fill-current" />
          Unirme al Partido
        </Link>
      </div>
    </motion.div>
  );
}
