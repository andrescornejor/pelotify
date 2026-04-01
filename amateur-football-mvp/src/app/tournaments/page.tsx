'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Search,
  ChevronRight,
  Filter,
  Flame,
  Star,
  Target,
  Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getTournaments, type Tournament } from '@/lib/tournaments';
import { useSettings } from '@/contexts/SettingsContext';

export default function TournamentsPage() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'F5' | 'F7' | 'F11'>('All');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { performanceMode: isPerfMode } = useSettings();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getTournaments();
        setTournaments(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTournaments = tournaments.filter(
    (t) => activeFilter === 'All' || t.type === activeFilter
  );

  return (
    <div className={cn(
      "min-h-screen bg-background relative overflow-hidden p-4 lg:p-10",
      isPerfMode && "perf-mode"
    )}>
      {/* ── AMBIENT DECORATION ── */}
      {!isPerfMode && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="relative z-10 max-w-screen-2xl mx-auto space-y-12">
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(44,252,125,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">
              Circuitos de Élite
            </span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-black italic text-foreground uppercase tracking-tightest leading-none">
            PRO <span className="text-foreground/20">LEAGUE</span>
          </h1>
          <p className="text-[10px] lg:text-xs font-black text-foreground/40 uppercase tracking-[0.3em] max-w-xl">
            Inscribite en los torneos más competitivos de la ciudad. Sumá puntos para el ranking global y dominá el potrero.
          </p>
        </div>

        {/* ── FILTERS & STATS ── */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center p-1 bg-foreground/5 rounded-2xl border border-foreground/5 gap-1">
            {(['All', 'F5', 'F7', 'F11'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={cn(
                  'px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all',
                  activeFilter === type
                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                    : 'text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5'
                )}
              >
                {type === 'All' ? 'TODOS' : type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end">
                <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Premios acumulados</span>
                <span className="text-2xl font-black text-primary italic">$250.000+</span>
             </div>
             <div className="h-10 w-px bg-foreground/10 mx-2 hidden lg:block" />
             <button className="h-14 px-8 bg-foreground/5 text-foreground border border-foreground/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center gap-3">
                <Trophy className="w-4 h-4" />
                HISTORIAL DE CAMPEONES
             </button>
          </div>
        </div>

        {/* ── TOURNAMENT GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-[400px] rounded-[3rem] bg-foreground/5 animate-pulse border border-foreground/5" />
            ))
          ) : filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament, i) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <Link href={`/tournaments/${tournament.id}`}>
                  <div className="glass-premium rounded-[3rem] overflow-hidden border border-foreground/10 h-[480px] flex flex-col relative bg-surface-elevated/40">
                    {/* Banner Image */}
                    <div className="relative h-48 overflow-hidden shrink-0">
                      <img 
                        src={tournament.banner_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"} 
                        alt={tournament.name}
                        className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated to-transparent" />
                      <div className="absolute top-6 left-6 flex gap-2">
                        <span className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase rounded-lg shadow-xl shrink-0">
                          {tournament.type}
                        </span>
                        <span className={cn(
                          "px-3 py-1 text-white text-[9px] font-black uppercase rounded-lg border shrink-0",
                          tournament.status === 'upcoming' ? "bg-blue-500/20 border-blue-500/40" : "bg-emerald-500/20 border-emerald-500/40"
                        )}>
                          {tournament.status === 'upcoming' ? 'Inscripciones' : 'En Curso'}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-8">
                         <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary fill-primary" />
                            <span className="text-xs font-black italic text-foreground tracking-widest uppercase">Golden Cup IV</span>
                         </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-1 justify-between gap-6">
                      <div className="space-y-4">
                        <h3 className="text-3xl font-black italic uppercase text-foreground leading-tight tracking-tighter group-hover:text-primary transition-colors">
                          {tournament.name}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/5 shadow-inner">
                              <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Inicia</span>
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-3 h-3 text-primary/60" />
                                 <span className="text-[10px] font-black text-foreground uppercase tracking-widest truncate">{tournament.start_date}</span>
                              </div>
                           </div>
                           <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/5 shadow-inner">
                              <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Cupos</span>
                              <div className="flex items-center gap-2">
                                 <Users className="w-3 h-3 text-primary/60" />
                                 <span className="text-[10px] font-black text-foreground uppercase tracking-widest">0 / {tournament.max_teams}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed border-foreground/20">
                           <MapPin className="w-4 h-4 text-foreground/40" />
                           <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest truncate">{tournament.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-foreground/5">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest leading-none">Inscripción</span>
                           <span className="text-2xl font-black text-foreground italic tracking-tighter tabular-nums group-hover:text-primary/90 transition-colors">
                              ${tournament.entry_fee ? tournament.entry_fee.toLocaleString() : 'GRATIS'}
                           </span>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-black shadow-xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                           <ChevronRight className="w-6 h-6 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-48 glass-premium rounded-[4rem] border-dashed border-2 border-foreground/10 flex flex-col items-center justify-center text-center gap-8">
              <div className="relative">
                 <Target className="w-20 h-20 text-foreground/10 animate-pulse" />
                 <div className="absolute inset-0 border-2 border-primary/20 rounded-full scale-150 animate-ping" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-3xl font-black italic uppercase text-foreground">Radar Despejado</h3>
                 <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">No hay torneos activos en tu zona por ahora. ¡Vuelve pronto!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
