'use client';

import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Users,
  MapPin,
  Calendar,
  Clock,
  Goal,
  ArrowRight,
  Medal,
  Crown,
  Shield,
  Check,
  Target,
  User2,
} from 'lucide-react';
import { Match, MatchParticipant } from '@/lib/matches';
import { cn } from '@/lib/utils';
import PlayerSlot from './PlayerSlot';
import { findVenueByLocation } from '@/lib/venues';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { ShareStory } from './ShareStory';
import { SportsreelPlayer } from './SportsreelPlayer';

const VenueMap = dynamic(() => import('./VenueMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-foreground/5 rounded-[3rem] animate-pulse flex items-center justify-center border border-foreground/10">
      <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
    </div>
  ),
});

interface PostMatchViewProps {
  match: Match;
  participants: MatchParticipant[];
  stats: {
    goalScorers: Array<{
      id: string;
      name: string;
      goals: number;
      team: 'A' | 'B';
    }>;
    mvp: {
      id: string;
      name: string;
      avatar_url?: string;
      votes: number;
    } | null;
  };
}

export default function PostMatchView({ match, participants, stats }: PostMatchViewProps) {
  const teamA = participants.filter((p) => p.team === 'A');
  const teamB = participants.filter((p) => p.team === 'B');

  const scoreA = match.team_a_score ?? 0;
  const scoreB = match.team_b_score ?? 0;
  const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Draw';

  return (
    <div className="space-y-12 pb-20">

      {/* ── SHARE ACTION ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center -mt-6 relative z-20"
      >
        <ShareStory
          type="match"
          data={{
            match_id: match.id,
            location: (() => {
              const venue = findVenueByLocation(match.location);
              return venue?.displayName || venue?.name || match.location;
            })(),
            score_a: scoreA,
            score_b: scoreB,
            mvp: stats.mvp,
            scorers: stats.goalScorers
          }}
          className="h-20 px-12 rounded-[2.5rem] text-sm shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-105"
        />
      </motion.div>

      {/* ── SPORTSREEL VIDEO ── */}
      {match.sportsreel_url && (
        <div className="max-w-4xl mx-auto w-full">
           <SportsreelPlayer url={match.sportsreel_url} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── MAIN CONTENT (STATS & TEAMS) ── */}
        <div className="lg:col-span-8 space-y-12">
          {/* GOAL SCORERS SECTION */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-premium rounded-[3.5rem] p-8 md:p-10 border border-foreground/10 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-10 px-2">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <Trophy className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                    Artilleros
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">
                    Goles oficiales validados
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-black text-foreground/20 uppercase tracking-widest border border-foreground/5 px-4 py-2 rounded-xl">
                TOTAL: {stats.goalScorers.reduce((acc, curr) => acc + curr.goals, 0)} GOLES
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.goalScorers.length > 0 ? (
                stats.goalScorers.map((scorer, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="flex items-center justify-between p-5 rounded-[2rem] bg-foreground/[0.02] border border-white/5 transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center overflow-hidden shadow-xl group-hover/scorer:scale-105 transition-transform">
                        {scorer.profiles?.avatar_url ? (
                          <img
                            src={scorer.profiles.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                             <User2 className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground uppercase italic tracking-tighter">
                          {scorer.profiles?.name || 'Jugador'}
                        </span>
                        <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                          Artillero Pelotify
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900 px-5 py-3 rounded-2xl border border-white/5 shadow-inner">
                      <span className="text-3xl font-black text-primary italic leading-none">
                        {scorer.goals}
                      </span>
                      <Goal className="w-5 h-5 text-primary/40 shrink-0" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-4 opacity-30 group/empty">
                   <div className="w-20 h-20 rounded-full border-2 border-dashed border-foreground/20 flex items-center justify-center group-hover/empty:rotate-45 transition-transform duration-700">
                     <Goal className="w-10 h-10" />
                   </div>
                   <p className="text-[12px] font-black uppercase tracking-[0.6em] italic text-foreground/40">
                     RED EN CERO
                   </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── SIDEBAR: MVP & MATCH INFO ── */}
        <div className="lg:col-span-4 space-y-12">
          {/* MVP PRESTIGE CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-premium rounded-[3.5rem] p-8 md:p-10 border border-primary/30 bg-primary/5 relative overflow-hidden group shadow-[0_40px_80px_rgba(16,185,129,0.15)]"
          >
            {/* Animated Aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_70%)] animate-pulse" />

            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform duration-1000 group-hover:rotate-12">
              <Star className="w-40 h-40 text-primary fill-primary" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl">
                  <Medal className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter text-primary">
                    Man of Match
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">
                    Votación popular
                  </p>
                </div>
              </div>

              {stats.mvp ? (
                <div className="flex flex-col items-center gap-10 py-6">
                  <div className="relative">
                    {/* Golden Frame */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-yellow-500 via-primary to-emerald-500 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" />

                    <div className="w-44 h-44 rounded-[2.8rem] bg-zinc-950 border-4 border-primary relative z-10 shadow-2xl group-hover:scale-105 transition-all duration-700 overflow-hidden">
                      {stats.mvp.avatar_url ? (
                        <img
                          src={stats.mvp.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Star className="w-16 h-16 text-primary/40 fill-primary/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <div className="px-5 py-2 bg-primary rounded-[1rem] shadow-[0_10px_20px_rgba(16,185,129,0.4)]">
                          <span className="text-[11px] font-black text-black uppercase tracking-widest leading-none flex items-center gap-2">
                            <Check className="w-3 h-3" /> {stats.mvp.votes} Votos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-zinc-950 z-20 group-hover:rotate-12 transition-transform duration-500">
                      <Trophy className="w-7 h-7 text-black" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h4 className="text-4xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                      {stats.mvp.name}
                    </h4>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-[1px] w-8 bg-primary/30" />
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic">
                        Figura Absoluta
                      </p>
                      <div className="h-[1px] w-8 bg-primary/30" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center gap-6 text-center">
                  <div className="w-24 h-24 rounded-[2rem] bg-foreground/5 flex items-center justify-center border-2 border-dashed border-foreground/10 group-hover:rotate-45 transition-transform duration-700">
                    <Star className="w-10 h-10 text-foreground/20" />
                  </div>
                  <p className="text-xs font-black uppercase text-foreground/30 italic tracking-[0.4em]">
                    Escrutinio Vacío
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* MATCH INFO SUMMARY */}
          <div className="glass-premium rounded-[3.5rem] p-8 md:p-10 border border-foreground/10 space-y-8 relative overflow-hidden group/info">
            <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 blur-[50px] -mr-16 -mt-16 rounded-full group-hover/info:scale-150 transition-transform duration-1000" />

            <div className="flex items-center gap-4 relative z-10 px-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground/40 italic">
                Resumen de Jornada
              </h3>
            </div>

            <div className="space-y-4 relative z-10">
              {[
                {
                  icon: Calendar,
                  label: 'FECHA',
                  value: formatDate(match.date),
                  color: 'text-primary',
                },
                { icon: Clock, label: 'HORA', value: match.time, color: 'text-primary' },
                {
                  icon: MapPin,
                  label: 'ESTADIO',
                  value: (() => {
                    const venue = findVenueByLocation(match.location);
                    return venue?.displayName || venue?.name || match.location;
                  })(),
                  color: 'text-blue-500',
                },
                {
                  icon: Shield,
                  label: 'NIVEL',
                  value: match.level || 'Competitivo',
                  color: 'text-accent',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-5 rounded-[2rem] bg-foreground/[0.03] border border-white/5 hover:bg-foreground/[0.06] transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                      <item.icon className={cn('w-4 h-4', item.color)} />
                    </div>
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-black text-foreground uppercase italic tracking-tighter">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-premium rounded-[3.5rem] p-8 border border-foreground/10 relative overflow-hidden group/map">
            <VenueMap location={match.location} />
          </div>

          <div className="px-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full flex items-center justify-center gap-3 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 hover:text-primary transition-all group/scroll"
            >
              VOLVER AL TOP{' '}
              <ArrowRight className="w-4 h-4 -rotate-90 group-hover/scroll:-translate-y-1 transition-transform" />
            </button>
          </div>
          </div>
        </div>
      </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-');
  const months = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
}
