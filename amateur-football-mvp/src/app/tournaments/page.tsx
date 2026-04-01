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
  Trash2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getTournaments, deleteTournament, type Tournament } from '@/lib/tournaments';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

export default function TournamentsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'All' | 'F5' | 'F7' | 'F11'>('All');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { performanceMode: isPerfMode } = useSettings();

  const load = async () => {
    try {
      setLoading(true);
      const data = await getTournaments();
      setTournaments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTournaments = tournaments.filter(
    (t) => activeFilter === 'All' || t.type === activeFilter
  );

  const officialTournaments = filteredTournaments.filter(t => t.is_official);
  const communityTournaments = filteredTournaments.filter(t => !t.is_official);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro quieres eliminar este torneo?')) return;
    try {
      await deleteTournament(id);
      load();
    } catch (err) {
      alert('Error eliminando el torneo');
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background relative overflow-hidden p-4 lg:p-10 pb-32",
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative">
          <div className="space-y-4">
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
              Inscribite en los torneos más competitivos de la ciudad o armá tu propia copa personalizada.
            </p>
          </div>

          <Link href="/tournaments/create">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-16 px-10 bg-primary text-black rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:bg-white transition-all group"
            >
              <Zap className="w-4 h-4 fill-current group-hover:animate-bounce" />
              ARMAR MI PROPIA COPA
            </motion.button>
          </Link>
        </div>

        {/* ── FILTERS ── */}
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
                SALÓN DE LA FAMA
             </button>
          </div>
        </div>

        {/* ── OFFICIAL SECTION ── */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Torneos Oficiales</h2>
            <div className="h-px flex-1 bg-foreground/5" />
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-[3rem] bg-foreground/5 animate-pulse border border-foreground/5" />
              ))
            ) : officialTournaments.length > 0 ? (
              officialTournaments.map((tournament, i) => (
                <TournamentCard key={tournament.id} tournament={tournament} i={i} currentUserId={user?.id} onDelete={handleDelete} />
              ))
            ) : (
              <NoTournaments message="No hay torneos oficiales activos." />
            )}
          </div>
        </section>

        {/* ── COMMUNITY SECTION ── */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Torneos de la Comunidad</h2>
            <div className="h-px flex-1 bg-foreground/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-[3rem] bg-foreground/5 animate-pulse border border-foreground/5" />
              ))
            ) : communityTournaments.length > 0 ? (
              communityTournaments.map((tournament, i) => (
                <TournamentCard key={tournament.id} tournament={tournament} i={i} currentUserId={user?.id} onDelete={handleDelete} />
              ))
            ) : (
              <NoTournaments message="Aún no hay torneos creados por la comunidad." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TournamentCard({ 
  tournament, 
  i, 
  currentUserId,
  onDelete 
}: { 
  tournament: Tournament; 
  i: number;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const isCreator = currentUserId === tournament.creator_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="absolute top-6 right-6 z-20 flex gap-2">
         {isCreator && (
            <button 
               onClick={(e) => {
                  e.preventDefault();
                  onDelete(tournament.id);
               }}
               className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all group/trash"
            >
               <Trash2 className="w-4 h-4 group-hover/trash:animate-shake" />
            </button>
         )}
         {tournament.is_official && (
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center backdrop-blur-md">
               <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
         )}
      </div>

      <Link href={`/tournaments/${tournament.id}`}>
        <div className="glass-premium rounded-[3rem] overflow-hidden border border-foreground/10 h-[480px] flex flex-col relative bg-surface-elevated/40">
          {/* Banner Image */}
          <div className="relative h-48 overflow-hidden shrink-0 bg-zinc-900">
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
                    <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Equipos</span>
                    <div className="flex items-center gap-2">
                       <Users className="w-3 h-3 text-primary/60" />
                       <span className="text-[10px] font-black text-foreground uppercase tracking-widest">MAX {tournament.max_teams}</span>
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
                 <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest leading-none">Matrícula</span>
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
  );
}

function NoTournaments({ message }: { message: string }) {
  return (
    <div className="col-span-full py-20 bg-foreground/[0.02] rounded-[3rem] border-dashed border-2 border-foreground/5 flex flex-col items-center justify-center text-center gap-4">
      <Target className="w-12 h-12 text-foreground/10" />
      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{message}</p>
    </div>
  );
}
