"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  Compass, 
  Zap,
  ArrowRight,
  Filter,
  Flame,
  Users,
  Clock,
  ShieldCheck,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  Crown,
  Trophy
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { VenueCard } from '@/components/home';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

const VENUE_CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'popular', label: 'Populares', icon: Flame },
  { id: 'new', label: 'Nuevos', icon: Zap },
  { id: 'top-rated', label: 'Top Rating', icon: Trophy },
];

export default function EstablecimientosList() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating'>('name');
  const { performanceMode } = useSettings();

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('canchas_businesses')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setVenues(data || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = useMemo(() => 
    venues.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.address && v.address.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [venues, searchTerm]
  );

  const stats = useMemo(() => ({
    totalVenues: venues.length,
    totalFields: venues.reduce((acc, v) => acc + (v.fields_count || 0), 0),
  }), [venues]);

  return (
    <div className="min-h-screen bg-background text-foreground font-kanit pb-20">
      
      {/* CINEMATIC HERO */}
      <div className="relative pt-20 pb-16 px-2 sm:px-4 lg:px-6 xl:px-8 overflow-hidden">
         {/* Background decoration */}
         {!performanceMode && (
           <>
             <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/[0.04] rounded-full blur-[150px] -z-10" />
             <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[120px] -z-10" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/[0.02] rounded-full blur-[80px] -z-10 animate-pulse" />
           </>
         )}
         
         <div className="max-w-full mx-auto space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-primary/30 rounded-full shadow-[0_0_20px_rgba(44,252,125,0.6)]" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Red de Complejos</span>
               </div>
               <h1 className="text-5xl sm:text-7xl lg:text-[9rem] font-black italic uppercase leading-[0.85] tracking-tight font-kanit">
                 Sedes <span className="text-primary">Oficiales</span>
               </h1>
               <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest max-w-lg mt-6">
                 Los mejores complejos de Rosario integrados en Pelotify. Reserva instantánea, pagos seguros y la mejor experiencia de juego.
               </p>
            </motion.div>

            {/* STATS ROW */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              {[
                { value: stats.totalVenues, label: 'Complejos Activos', icon: MapPin, color: 'text-primary' },
                { value: '100%', label: 'Verificados', icon: ShieldCheck, color: 'text-emerald-400' },
                { value: '24/7', label: 'Reserva Online', icon: Clock, color: 'text-sky-400' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-primary/20 transition-all group"
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-foreground/[0.04] border border-foreground/[0.06] group-hover:scale-110 transition-transform", stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-black italic tracking-tighter leading-none">{stat.value}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* SEARCH + FILTER BAR */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row gap-4 max-w-4xl"
            >
               <div className="flex-1 relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Busca por nombre o dirección..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-14 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl pl-14 pr-6 text-sm font-bold text-foreground outline-none focus:border-primary/40 focus:bg-foreground/[0.05] transition-all placeholder:text-muted-foreground/50"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
               </div>
            </motion.div>

            {/* CATEGORY PILLS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1"
            >
              {VENUE_CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "shrink-0 flex items-center gap-2 h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border",
                      isActive 
                        ? "bg-primary text-black border-primary shadow-[0_8px_20px_rgba(44,252,125,0.25)]" 
                        : "bg-foreground/[0.03] border-foreground/[0.06] text-muted-foreground hover:text-foreground hover:border-foreground/10"
                    )}
                  >
                    <cat.icon className={cn("w-3.5 h-3.5", isActive ? "text-black" : "text-current")} />
                    {cat.label}
                  </button>
                );
              })}
            </motion.div>
         </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-primary/40" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
              {loading ? 'Cargando...' : `${filteredVenues.length} establecimientos encontrados`}
            </span>
          </div>
        </div>
      </div>

      {/* VENUES GRID */}
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
               {loading ? (
                 [...Array(6)].map((_, i) => (
                    <motion.div 
                      key={`skel-${i}`} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="h-80 rounded-[3rem] bg-foreground/[0.03] border border-foreground/[0.06] overflow-hidden relative"
                    >
                      <div className="absolute inset-0 skeleton-shimmer" />
                    </motion.div>
                 ))
               ) : filteredVenues.length === 0 ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="col-span-full py-24 text-center space-y-6"
                 >
                    <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/[0.06] flex items-center justify-center mx-auto">
                      <Compass className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-black text-foreground italic uppercase tracking-tighter">Sin resultados</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No se encontraron establecimientos con esos criterios.</p>
                    </div>
                    <button 
                      onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                      className="px-6 py-3 bg-primary text-black font-black uppercase text-[9px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-transform"
                    >
                      Limpiar Filtros
                    </button>
                 </motion.div>
               ) : (
                 filteredVenues.map((venue, i) => (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 25 }}
                      layout
                    >
                       <VenueCard venue={venue} performanceMode={performanceMode} />
                    </motion.div>
                 ))
               )}
            </AnimatePresence>
         </div>
      </div>

      {/* FOOTER CTA */}
      {!loading && filteredVenues.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20 space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-foreground/10" />
            <Sparkles className="w-4 h-4 text-primary/40" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-foreground/10" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
            ¿Tenés un complejo? Unite a la red Pelotify
          </p>
        </motion.div>
      )}
    </div>
  );
}
