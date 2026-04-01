"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  Compass, 
  Map as MapIcon,
  Shield,
  Zap,
  ArrowRight,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EstablecimientosList() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.address && v.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-outfit pb-20">
      
      {/* HEADER SECTION */}
      <div className="relative pt-32 pb-20 px-6 lg:px-20 overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
         <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />
         
         <div className="max-w-7xl mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(44,252,125,0.8)]" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Explorar Sedes</span>
               </div>
               <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-black italic uppercase leading-[0.85] tracking-tight font-kanit">
                 Donde se Juega el <span className="text-primary">FÃƒÂºtbol</span>
               </h1>
               <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest max-w-lg mt-6">
                 Los mejores complejos de Rosario integrados en Pelotify. Reserva instantÃƒÂ¡nea, pagos seguros y la mejor experiencia.
               </p>
            </motion.div>

            {/* SEARCH TRAY */}
            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Busca por nombre o direcciÃƒÂ³n..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-16 bg-surface-elevated/50 border border-white/5 rounded-[2rem] pl-16 pr-8 text-sm font-bold text-foreground outline-none focus:border-primary/40 focus:bg-surface-elevated transition-all shadow-inner"
                  />
               </div>
               <button className="h-16 px-8 bg-surface-elevated border border-white/5 rounded-[1.8rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest hover:bg-surface-bright transition-all">
                  <Filter className="w-4 h-4 text-primary" />
                  Filtros PRO
               </button>
            </div>
         </div>
      </div>

      {/* VENUES GRID */}
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
               {loading ? (
                 [...Array(6)].map((_, i) => (
                    <div key={i} className="h-[450px] rounded-[2rem] bg-surface-elevated/30 border border-white/5 animate-pulse" />
                 ))
               ) : filteredVenues.length === 0 ? (
                 <div className="col-span-full py-20 text-center space-y-4">
                    <Compass className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest leading-none">No se encontraron establecimientos con esos criterios.</p>
                 </div>
               ) : (
                 filteredVenues.map((venue, i) => (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                       <Link href={`/establecimientos/${venue.id}`}>
                          <div className="glass-premium rounded-[2rem] p-4 border-white/5 relative overflow-hidden group hover:border-primary/40 hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-all duration-500 h-full flex flex-col">
                             <div className="h-64 rounded-[2rem] overflow-hidden relative mb-6">
                                <img 
                                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop" 
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                                  alt={venue.name}
                                />
                                <div className="absolute top-4 left-4 px-4 py-2 glass rounded-2xl border border-white/10 shadow-2xl">
                                   <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-accent text-accent" />
                                      <span className="text-[10px] font-black text-white">4.9</span>
                                   </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-8">
                                   <span className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">Ver Perfil Completo <ArrowRight className="w-4 h-4" /></span>
                                </div>
                             </div>

                             <div className="px-4 pb-4 space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                   <h3 className="text-2xl font-black font-kanit italic uppercase tracking-tighter group-hover:text-primary transition-colors leading-none">{venue.name}</h3>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                      <MapPin className="w-3 h-3 text-primary/60" />
                                      {venue.address || "Rosario, Argentina"}
                                   </p>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <Zap className="w-4 h-4 text-primary" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Premium Pitch</span>
                                   </div>
                                   <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                                      <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Disponible</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </Link>
                    </motion.div>
                 ))
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
