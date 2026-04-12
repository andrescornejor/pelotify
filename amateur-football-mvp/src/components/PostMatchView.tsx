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
  User2,
  Swords,
} from 'lucide-react';
import { Match, MatchParticipant } from '@/lib/matches';
import { cn } from '@/lib/utils';
import { findVenueByLocation } from '@/lib/venues';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { ShareStory } from './ShareStory';
import { SportsreelPlayer } from './SportsreelPlayer';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

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
      profiles?: {
        name?: string;
        avatar_url?: string;
      };
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
  const { user } = useAuth();
  
  const teamA = participants.filter((p) => p.team === 'A');
  const teamB = participants.filter((p) => p.team === 'B');

  const scoreA = match.team_a_score ?? 0;
  const scoreB = match.team_b_score ?? 0;
  const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Draw';

  const teamAName = (match as any).team_a_name || 'Local';
  const teamBName = (match as any).team_b_name || 'Visitante';

  useEffect(() => {
    if (!user || winner === 'Draw') return;

    const myEntry = participants.find(p => p.user_id === user.id);
    const myTeam = myEntry?.team;

    if (!myTeam) return;

    const didIWin = myTeam === winner;

    const duration = 3000;
    const end = Date.now() + duration;

    const colors = didIWin ? ['#2cfc7d', '#10b981', '#ffffff'] : ['#f43f5e', '#ef4444', '#000000'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [user, participants, winner]);

  return (
    <div className="space-y-10 pb-20">

      {/* ═══════════════════════════════════════════════════════════════════
          CINEMATIC HERO SCOREBOARD
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-[3.5rem] sm:rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl group/hero"
      >
        {/* Stadium Background */}
        <div className="absolute inset-0 bg-black" />
        <img 
          src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2000&auto=format&fit=crop" 
          alt="Stadium"
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity group-hover/hero:scale-105 group-hover/hero:opacity-50 transition-all duration-[3s]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')] opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        {/* Dynamic Light Rays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-60">
          <div className="absolute -left-1/4 -top-1/4 w-[150%] h-[150%] bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent rotate-[-15deg] blur-2xl group-hover/hero:rotate-[5deg] transition-all duration-[5s]" />
          <div className="absolute -right-1/4 -top-1/4 w-[150%] h-[150%] bg-gradient-to-bl from-rose-500/20 via-transparent to-transparent rotate-[15deg] blur-2xl group-hover/hero:rotate-[-5deg] transition-all duration-[5s]" />
        </div>

        {/* Winner Highlight */}
        {winner !== 'Draw' && (
          <div className={cn(
            "absolute bottom-0 w-1/2 h-1/2 blur-[100px] pointer-events-none opacity-50",
            winner === 'A' ? "left-0 bg-indigo-500" : "right-0 bg-rose-500"
          )} />
        )}

        <div className="relative z-10 px-4 sm:px-10 md:px-16 py-12 sm:py-16 md:py-24">
          
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-10 sm:mb-16"
          >
            <div className="flex items-center gap-4 px-8 py-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(44,252,125,0.8)]" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.5em] text-white/80">
                Resultado Oficial
              </span>
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(44,252,125,0.8)]" />
            </div>
          </motion.div>

          {/* MAIN SCORE SECTION */}
          <div className="flex items-center justify-between xl:justify-center gap-2 sm:gap-6 md:gap-16">
            
            {/* TEAM A */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex flex-col items-center gap-6 flex-1 xl:flex-none xl:w-72"
            >
              <div className={cn(
                "w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden group/badge",
                winner === 'A' || winner === 'Draw' 
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-800 border-2 border-indigo-400 shadow-[0_0_50px_rgba(79,70,229,0.4)]"
                  : "bg-indigo-950/50 border-2 border-indigo-500/20"
              )}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <Shield className={cn(
                  "w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 relative z-10 transition-transform duration-700 group-hover/badge:scale-110",
                  winner === 'A' || winner === 'Draw' ? "text-white" : "text-white/40"
                )} />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className={cn(
                  "text-lg sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none px-2 text-center",
                  winner === 'A' || winner === 'Draw' ? "text-white text-shadow-sm" : "text-white/50"
                )}>
                  {teamAName}
                </h3>
                {winner === 'A' && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                    <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 leading-none">Victor</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* THE SCORES */}
            <div className="flex items-center gap-3 sm:gap-6 md:gap-10 shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                {winner === 'A' && <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-40 animate-pulse rounded-full" />}
                <span className={cn(
                  "text-[5.5rem] sm:text-[9rem] md:text-[13rem] font-black italic tracking-tighter leading-[0.7] block relative z-10",
                  winner === 'A' ? "text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200 drop-shadow-[0_0_30px_rgba(79,70,229,0.5)]" 
                  : winner === 'Draw' ? "text-white drop-shadow-xl" 
                  : "text-white/30"
                )}>
                  {scoreA}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-4 sm:gap-6 opacity-30"
              >
                <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                {winner === 'B' && <div className="absolute inset-0 bg-rose-500 blur-[80px] opacity-40 animate-pulse rounded-full" />}
                <span className={cn(
                  "text-[5.5rem] sm:text-[9rem] md:text-[13rem] font-black italic tracking-tighter leading-[0.7] block relative z-10",
                  winner === 'B' ? "text-transparent bg-clip-text bg-gradient-to-b from-white to-rose-200 drop-shadow-[0_0_30px_rgba(225,29,72,0.5)]" 
                  : winner === 'Draw' ? "text-white drop-shadow-xl" 
                  : "text-white/30"
                )}>
                  {scoreB}
                </span>
              </motion.div>
            </div>

            {/* TEAM B */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex flex-col items-center gap-6 flex-1 xl:flex-none xl:w-72"
            >
              <div className={cn(
                "w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden group/badge",
                winner === 'B' || winner === 'Draw' 
                  ? "bg-gradient-to-br from-rose-500 to-rose-800 border-2 border-rose-400 shadow-[0_0_50px_rgba(225,29,72,0.4)]"
                  : "bg-rose-950/50 border-2 border-rose-500/20"
              )}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <Shield className={cn(
                  "w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 relative z-10 transition-transform duration-700 group-hover/badge:scale-110",
                  winner === 'B' || winner === 'Draw' ? "text-white" : "text-white/40"
                )} />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className={cn(
                  "text-lg sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none px-2 text-center",
                  winner === 'B' || winner === 'Draw' ? "text-white text-shadow-sm" : "text-white/50"
                )}>
                  {teamBName}
                </h3>
                {winner === 'B' && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                    <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 leading-none">Victor</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom Footnote Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 sm:mt-16 flex justify-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-8 py-4 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-white/50">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
                  {(() => { const v = findVenueByLocation(match.location); return v?.displayName || v?.name || match.location; })()}
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <div className="flex items-center gap-2 text-white/50">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">{formatDate(match.date)}</span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* ── SHARE ACTION ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center -mt-8 relative z-20"
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
          className="h-16 sm:h-20 px-12 sm:px-16 rounded-[2.5rem] text-sm sm:text-base font-black italic shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-105"
        />
      </motion.div>

      {/* ── SPORTSREEL VIDEO ── */}
      {match.sportsreel_url && (
        <div className="w-full pt-8">
           <SportsreelPlayer url={match.sportsreel_url} />
        </div>
      )}

      {/* ── SPLIT LAYOUT FOR STATS & MVP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-4">
        
        {/* GOAL SCORERS */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-premium rounded-[3rem] p-6 sm:p-8 md:p-10 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <Goal className="w-64 h-64 -rotate-12" />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Artilleros</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Goles Oficiales</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center gap-2">
                <Goal className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest">{stats.goalScorers.reduce((a, b) => a + b.goals, 0)} TOTAL</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {stats.goalScorers.length > 0 ? (
                stats.goalScorers.map((scorer, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="flex items-center justify-between p-4 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner hover:border-primary/30 transition-colors group/scorer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-[1.2rem] bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover/scorer:border-primary/50 transition-colors">
                        {scorer.profiles?.avatar_url ? (
                          <img src={scorer.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User2 className="w-5 h-5 text-white/20 group-hover/scorer:text-primary transition-colors" />
                        )}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="text-sm font-black italic uppercase tracking-tighter text-foreground group-hover/scorer:text-primary transition-colors truncate">
                          {scorer.profiles?.name || scorer.name || 'Jugador'}
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 truncate">
                          {scorer.team === 'A' ? teamAName : teamBName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-2xl border border-white/5 shrink-0">
                      <span className="text-2xl font-black italic text-primary">{scorer.goals}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-16 flex flex-col items-center gap-4 opacity-50">
                   <div className="w-16 h-16 rounded-full border-2 border-dashed border-foreground/20 flex items-center justify-center">
                     <Goal className="w-8 h-8" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-foreground/50">RED EN CERO</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* MVP CARD */}
        <div className="lg:col-span-5 h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group/mvp relative h-full min-h-[400px] overflow-hidden rounded-[3rem] p-1 shadow-[0_30px_60px_rgba(250,204,21,0.2)] transition-transform hover:-translate-y-2 duration-500"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 50%, #e11d48 100%)',
            }}
          >
            {/* Inner dynamic content */}
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300 via-transparent to-transparent opacity-0 group-hover/mvp:opacity-50 transition-opacity duration-1000 mix-blend-overlay pointer-events-none" />
            <div className="w-full h-full bg-zinc-950/95 backdrop-blur-xl rounded-[2.8rem] relative overflow-hidden flex flex-col p-8 md:p-10">
              
              {/* Background Art */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse pointer-events-none" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

              <div className="flex items-center gap-4 relative z-10 mb-auto">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                  <Star className="w-6 h-6 text-black fill-black" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 italic uppercase tracking-tighter">
                    TOTS MVP
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500/50 italic">
                    Elegido por los jugadores
                  </p>
                </div>
              </div>

              {stats.mvp ? (
                <div className="flex flex-col items-center gap-6 mt-8 relative z-10 w-full">
                  <div className="relative group/avatar w-full flex justify-center">
                    {/* Golden Backing */}
                    <div className="absolute inset-0 max-w-[200px] mx-auto bg-gradient-to-b from-yellow-400 via-amber-600 to-zinc-900 rounded-[2rem] blur-xl opacity-30 group-hover/avatar:opacity-60 transition-opacity duration-500" />
                    
                    <div className="w-40 h-48 sm:w-48 sm:h-56 relative z-10 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-950 border-[3px] border-yellow-500/50 shadow-2xl overflow-hidden group-hover/avatar:border-yellow-400 group-hover/avatar:shadow-[0_0_40px_rgba(250,204,21,0.4)] transition-all duration-500">
                      {stats.mvp.avatar_url ? (
                        <img src={stats.mvp.avatar_url} alt="" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-[3s]" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User2 className="w-16 h-16 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end items-center pb-4">
                         <span className="text-3xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-500 drop-shadow-md">
                           {stats.mvp.name}
                         </span>
                      </div>
                    </div>
                    {/* Votes Badge */}
                    <div className="absolute -bottom-4 right-[10%] sm:right-[15%] w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex flex-col items-center justify-center border-4 border-zinc-950 shadow-xl group-hover/avatar:scale-110 transition-transform">
                       <span className="text-xl font-black text-black leading-none">{stats.mvp.votes}</span>
                       <span className="text-[7px] font-black uppercase text-black/80 tracking-widest leading-none">Votos</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                   <Star className="w-16 h-16 text-yellow-500/20" />
                   <p className="mt-4 text-[10px] font-black uppercase text-yellow-500/30 italic tracking-[0.4em]">Sin Escrutinio</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>

      <div className="px-4 pt-10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full flex items-center justify-center gap-4 py-6 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em] text-foreground/20 hover:text-primary transition-all group/scroll"
        >
          <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover/scroll:border-primary/30 transition-colors">
            <ArrowRight className="w-4 h-4 -rotate-90 group-hover/scroll:-translate-y-1 transition-transform" />
          </div>
          VOLVER AL INICIO
        </button>
      </div>

    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
}
