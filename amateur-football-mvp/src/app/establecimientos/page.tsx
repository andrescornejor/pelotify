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
import { VenueCard } from '@/components/home';
import { useSettings } from '@/contexts/SettingsContext';

export default function EstablecimientosList() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.address && v.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-kanit pb-20">
      
      {/* HEADER SECTION */}
      <div className="relative pt-24 pb-20 px-3 sm:px-5 lg:px-10 xl:px-16 overflow-hidden">
         {!performanceMode && (
           <>
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
             <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />
           </>
         )}
         
         <div className="max-w-full mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(44,252,125,0.8)]" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Red de Complejos</span>
               </div>
               <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-black italic uppercase leading-[0.85] tracking-tight font-kanit">
                 Sedes <span className="text-primary">Oficiales</span>
               </h1>
               <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest max-w-lg mt-6">
                 Los mejores complejos de Rosario integrados en Pelotify. Reserva instantánea, pagos seguros y la mejor experiencia de juego.
               </p>
            </motion.div>

            {/* SEARCH TRAY */}
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
               <div className="flex-1 relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Busca por nombre o dirección..." 
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
      <div className="max-w-full mx-auto px-3 sm:px-5 lg:px-10 xl:px-16">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
               {loading ? (
                 [...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 rounded-[3rem] bg-surface-elevated/30 border border-white/5 animate-pulse" />
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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                       <VenueCard venue={venue} performanceMode={performanceMode} />
                    </motion.div>
                 ))
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
