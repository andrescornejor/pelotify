'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowRight, PlusCircle, Search } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';

export const MatchBanner = ({ nextMatch, performanceMode }: { nextMatch: any, performanceMode: boolean }) => {
  const countdownText = useCountdown(nextMatch);

  if (!nextMatch) {
    return (
      <div className="relative group/agenda overflow-hidden rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-8 border border-white/5 bg-gradient-to-b from-surface/50 to-transparent">
        {/* Cinematic Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover/agenda:opacity-100 transition-opacity duration-700" />
        
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover/agenda:scale-150 transition-transform duration-1000 opacity-20" />
          <Calendar className="w-16 h-16 text-foreground/10 group-hover/agenda:text-primary/30 transition-colors duration-500" />
        </div>

        <div className="space-y-2 relative z-10">
          <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit">Agenda Libre</h4>
          <p className="text-[11px] font-medium text-foreground/40 leading-relaxed max-w-[200px]">
            No tenés próximos partidos.<br/>¡Salí a reclutar leyendas!
          </p>
        </div>

        <Link href="/search" className="w-full relative z-10">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(44,252,125,0.2)] hover:shadow-[0_20px_40px_rgba(44,252,125,0.4)] transition-all active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>RECLUTAR</span>
          </motion.button>
        </Link>

        <div className="flex flex-col gap-2 pt-4 border-t border-white/5 w-full opacity-60">
          <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Sugerencia de hoy</span>
          <p className="text-[9px] font-medium text-foreground/40 italic leading-relaxed">
            "Un equipo unido vale más que 11 estrellas individuales."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Matchup Visualization */}
      <div className="relative flex items-center justify-between gap-4 px-4">
        {/* Connecting Line */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Team A */}
        <div className="flex flex-col items-center gap-4 relative z-10 flex-1">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background border-2 border-white/5 flex items-center justify-center shadow-2xl group-hover/match:border-primary/30 transition-all duration-500 overflow-hidden p-3"
          >
             <JerseyVisualizer 
               primaryColor="#18181b" 
               secondaryColor="#2cfc7d" 
               pattern="vertical"
               className="w-full h-full"
             />
          </motion.div>
          <div className="text-center space-y-1">
            <span className="text-[11px] font-black uppercase italic tracking-tighter text-foreground font-kanit block truncate max-w-[100px]">{(nextMatch.team_a_name && nextMatch.team_a_name !== 'Team A') ? nextMatch.team_a_name : 'LOCAL'}</span>
            <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">LOCAL</span>
          </div>
        </div>

        {/* VS Center */}
        <div className="flex flex-col items-center gap-3 relative z-10 shrink-0">
          <div className="w-14 h-14 rounded-full bg-background border border-white/10 flex flex-col items-center justify-center shadow-inner group-hover/match:scale-110 transition-transform duration-500">
            <span className="text-2xl font-black italic text-primary font-kanit leading-none">VS</span>
          </div>
          {countdownText && (
            <div className="absolute -bottom-10 whitespace-nowrap px-3 py-1 rounded-lg bg-primary text-background text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 animate-bounce">
              {countdownText}
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center gap-4 relative z-10 flex-1">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-surface to-background border-2 border-white/5 flex items-center justify-center shadow-2xl group-hover/match:border-emerald-500/30 transition-all duration-500 overflow-hidden p-3"
          >
             <JerseyVisualizer 
               primaryColor="#10b981" 
               secondaryColor="#ffffff" 
               pattern="hoops"
               className="w-full h-full"
             />
          </motion.div>
          <div className="text-center space-y-1">
            <span className="text-[11px] font-black uppercase italic tracking-tighter text-foreground font-kanit block truncate max-w-[100px]">{(nextMatch.team_b_name && nextMatch.team_b_name !== 'Team B') ? nextMatch.team_b_name : 'VISITANTE'}</span>
            <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">VISITA</span>
          </div>
        </div>
      </div>
      
      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 group/info hover:bg-foreground/[0.05] transition-all">
           <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-white/5 shadow-inner">
              <Calendar className="w-5 h-5 text-primary/40 group-hover/info:text-primary transition-colors" />
           </div>
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">FECHA</span>
              <span className="text-[10px] font-black text-foreground">{new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
           </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 group/info hover:bg-foreground/[0.05] transition-all">
           <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-white/5 shadow-inner">
              <Clock className="w-5 h-5 text-primary/40 group-hover/info:text-primary transition-colors" />
           </div>
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">HORA</span>
              <span className="text-[10px] font-black text-foreground">{nextMatch.time} HS</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/[0.03] border border-white/5 group/info hover:bg-primary/10 transition-all cursor-pointer">
        <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center border border-white/5 shadow-inner group-hover/info:bg-primary/20">
           <MapPin className="w-5 h-5 text-foreground/20 group-hover/info:text-primary transition-colors" />
        </div>
        <div className="flex flex-col min-w-0">
           <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">UBICACIÓN</span>
           <span className="text-[10px] font-medium text-foreground/70 truncate group-hover/info:text-foreground transition-colors">{nextMatch.location || 'Sede por confirmar'}</span>
        </div>
      </div>
      
      <div className="flex gap-3 pt-2">
       <Link href={`/match?id=${nextMatch.id}`} className="flex-1">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-primary hover:text-background transition-all active:scale-95"
        >
          ENTRAR AL MATCH <ArrowRight className="w-4 h-4" />
        </motion.button>
       </Link>
       <button className="w-14 h-14 rounded-2xl glass-premium border-white/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/40 transition-all active:scale-95">
          <PlusCircle className="w-6 h-6" />
       </button>
      </div>
    </div>
  );
};
