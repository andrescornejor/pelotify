'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Filter,
  Loader2,
  CheckCircle2,
  LayoutGrid,
  ChevronRight,
  Zap,
  Star,
  Navigation,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { findVenueByLocation } from '@/lib/venues';
import dynamic from 'next/dynamic';
import { useMatchSearch } from '@/hooks/useMatchSearch';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/lib/supabase';
import { type Match } from '@/lib/matches';

const MapSearch = dynamic(() => import('@/components/MapSearch'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-zinc-900 rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const {
    filteredMatches,
    mapMatches,
    joinedIds,
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    onlyAvailable,
    setOnlyAvailable,
    userLocation,
    setUserLocation,
    radiusFilter,
    setRadiusFilter,
  } = useMatchSearch();
  const { performanceMode: isPerfMode } = useSettings();

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        if (!radiusFilter) setRadiusFilter(10); // Default to 10km if not set
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener tu ubicación. Asegurate de dar permisos de GPS.');
      }
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background relative overflow-hidden min-h-screen',
        isPerfMode && 'perf-mode'
      )}
    >
      {/* ── AMBIENT BACKGROUND ── */}
      {!isPerfMode && (
        <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px]" />
        </div>
      )}

      {/* ── HEADER PRO APP STYLE ── */}
      <div
        className={cn(
          'sticky top-0 z-40 pt-4 pb-3 px-4 sm:px-6 lg:px-12 border-b border-foreground/5 shadow-sm transition-all',
          isPerfMode ? 'bg-background' : 'bg-background/80 backdrop-blur-3xl'
        )}
      >
        <div className="flex flex-col gap-4 relative z-10 max-w-screen-2xl mx-auto">
          {/* Location & Title */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/20 animate-ping opacity-20" />
                <MapPin className="w-5 h-5 text-primary relative z-10" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Radar Activo</span>
                <span className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-1.5 truncate">
                  {userLocation ? 'Mi Ubicación' : 'Explorar Zona'}
                  <ChevronRight className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                </span>
              </div>
            </div>
            
            <button
               onClick={handleLocateMe}
               className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border shrink-0",
                 userLocation 
                   ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" 
                   : "bg-foreground/5 text-foreground/50 border-foreground/5 hover:bg-foreground/10"
               )}
            >
              <Navigation className={cn("w-4 h-4", userLocation && "fill-current")} />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-foreground/30 group-focus-within:text-primary transition-all duration-300" />
            </div>
            <input
              type="text"
              placeholder="Buscá por cancha, barrio o tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 lg:h-14 pl-12 pr-4 rounded-[1.2rem] bg-foreground/[0.04] border border-foreground/10 focus:bg-foreground/[0.06] focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm lg:text-base font-bold text-foreground placeholder:text-foreground/40"
            />
          </div>

          {/* Scrollable Filters Row */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
            {/* Format Pills */}
            {(['All', 'F5', 'F7', 'F11'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'flex-shrink-0 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap border',
                  typeFilter === type
                    ? 'bg-foreground text-background border-foreground shadow-md scale-100'
                    : 'bg-transparent text-foreground/60 border-foreground/10 hover:bg-foreground/5 scale-95'
                )}
              >
                {type === 'All' ? 'Todas' : type}
              </button>
            ))}

            {/* Filter: Only Available */}
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all text-[11px] font-black uppercase tracking-wider whitespace-nowrap',
                onlyAvailable
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-black'
                  : 'bg-transparent border-foreground/10 text-foreground/60 hover:bg-foreground/5 font-bold'
              )}
            >
              CUPOS LIBRES <CheckCircle2 className={cn("w-3.5 h-3.5", onlyAvailable ? "text-emerald-400" : "text-foreground/40")} />
            </button>

            {/* Radius Filter */}
            <div className="flex-shrink-0 flex items-center gap-2 bg-transparent px-3 py-2 rounded-xl border border-foreground/10">
              <span className="text-[11px] font-black text-foreground/50 uppercase tracking-wider">Radio:</span>
              <span className="text-[11px] font-black text-primary">{radiusFilter || '∞'} km</span>
              <input
                type="range"
                min="1"
                max="50"
                value={radiusFilter || 0}
                onChange={(e) => setRadiusFilter(parseInt(e.target.value))}
                className="w-20 h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-primary ml-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-6 pb-32 z-10 no-scrollbar">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
               {/* Skeleton Loaders */}
               {[1, 2, 3].map((i) => (
                 <div key={`skel-${i}`} className="w-full rounded-[1.5rem] bg-foreground/[0.02] border border-foreground/[0.05] p-4 flex flex-col gap-4">
                   <div className="flex gap-4">
                     <div className="w-14 h-14 rounded-xl bg-foreground/[0.05] animate-pulse" />
                     <div className="space-y-2 flex-1 pt-1">
                       <div className="h-5 w-2/3 bg-foreground/[0.05] rounded-full animate-pulse" />
                       <div className="h-3 w-1/2 bg-foreground/[0.05] rounded-full animate-pulse" />
                     </div>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                     <div className="h-6 w-24 bg-foreground/[0.05] rounded-full animate-pulse" />
                     <div className="h-10 w-28 bg-foreground/[0.05] rounded-xl animate-pulse" />
                   </div>
                 </div>
               ))}
            </motion.div>
          ) : activeTab === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                  Resultados <span className="text-primary/80">({filteredMatches.length})</span>
                </h2>
              </div>
              
              {filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMatches.map((match: Match, i: number) => {
                    const venue = findVenueByLocation(match.location || '');
                    const displayName = venue?.displayName || venue?.name || match.location;
                    const maxPlayers = match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                    const countObj = match.participants?.[0];
                    const currentPlayers = typeof countObj === 'number' ? countObj : countObj?.count !== undefined ? countObj.count : match.participants?.length || 0;
                    const missing = Math.max(0, maxPlayers - currentPlayers);

                    return (
                      <motion.div
                        key={match.id}
                        initial={isPerfMode ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: 15 }}
                        whileInView={isPerfMode ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={isPerfMode ? { duration: 0 } : { delay: i * 0.03, duration: 0.3 }}
                        whileHover={isPerfMode ? {} : { y: -2 }}
                        className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-[1.5rem] p-4 flex flex-col gap-3 relative overflow-hidden group hover:bg-foreground/[0.04] transition-all shadow-sm"
                      >
                        {/* ── CARD BACKDROP ── */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-colors pointer-events-none" />

                        <div className="flex justify-between items-start z-10 relative">
                          <div className="flex gap-3 items-center min-w-0">
                             {/* Date & Time Block */}
                             <div className="flex flex-col items-center justify-center bg-foreground/5 w-14 h-14 rounded-2xl border border-foreground/5 shadow-inner shrink-0">
                                <span className="text-[10px] font-black text-foreground uppercase tracking-wider">{match.date}</span>
                                <span className="text-[10px] font-bold text-foreground/50 mt-0.5">{match.time}</span>
                             </div>
                             
                             <div className="flex flex-col min-w-0">
                                <h3 className="font-black text-base text-foreground leading-tight tracking-tight truncate">{displayName}</h3>
                                <p className="text-[10px] text-foreground/50 font-bold flex items-center gap-1 mt-1 truncate">
                                  <MapPin className="w-3 h-3 text-primary/60 shrink-0" /> <span className="truncate">{match.location}</span>
                                </p>
                             </div>
                          </div>
                          
                          {/* Missing players tag */}
                          <div className="flex shrink-0 ml-2">
                            {missing === 0 ? (
                              <div className="px-2 py-1 rounded-lg bg-zinc-500/10 text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-zinc-500/20">Lleno</div>
                            ) : (
                              <div className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" /> {missing}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-1 z-10 relative">
                          <div className="px-2.5 py-1 rounded-lg bg-foreground/5 text-[9px] font-black text-foreground/70 uppercase tracking-widest border border-foreground/5">{match.type}</div>
                          <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/10">{match.level || 'MIXTO'}</div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-foreground/5 mt-1 relative z-10" />

                        {/* Bottom Section: Price & Action */}
                        <div className="flex justify-between items-center z-10 relative pt-1">
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[10px] font-black text-foreground/40">$</span>
                            <span className="text-xl font-black text-foreground tracking-tighter">{match.price.toLocaleString()}</span>
                            <span className="text-[9px] text-foreground/30 font-bold ml-1 uppercase">/ pers</span>
                          </div>
                          
                          <Link href={`/match?id=${match.id}`} className="block">
                             <button className={cn(
                               "px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5",
                               joinedIds.has(match.id)
                                 ? "bg-foreground/10 text-foreground/50 border border-foreground/10"
                                 : "bg-foreground text-background shadow-lg hover:shadow-xl hover:bg-primary hover:text-black hover:shadow-primary/20"
                             )}>
                               {joinedIds.has(match.id) ? (
                                 <><CheckCircle2 className="w-3.5 h-3.5" /> Unido</>
                               ) : (
                                 <>Sumarme <ChevronRight className="w-3.5 h-3.5" /></>
                               )}
                             </button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-6 bg-foreground/[0.02] rounded-[2rem] border border-dashed border-foreground/10 mt-4">
                  <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-foreground/30" />
                  </div>
                  <div className="max-w-xs mx-auto space-y-2">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Zona Desierta</h3>
                    <p className="text-[10px] text-foreground/50 font-medium uppercase tracking-wider leading-relaxed">
                      No hay partidos que coincidan con estos filtros.
                    </p>
                  </div>
                  <Link href="/create">
                    <button className="mt-2 px-6 py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                      Armar Pícalo Nuevo
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full h-[calc(100vh-220px)] min-h-[500px] relative overflow-hidden rounded-[2rem] border border-foreground/10 shadow-2xl bg-surface"
            >
              <MapSearch matches={mapMatches} userLocation={userLocation} radius={radiusFilter} />
              {!userLocation && (
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={handleLocateMe}
                    className="px-4 py-2 bg-background/90 backdrop-blur-md text-foreground border border-foreground/10 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2 hover:bg-primary hover:text-black transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Activar GPS
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FLOATING VIEW TOGGLE ── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setActiveTab(activeTab === 'list' ? 'map' : 'list')}
          className="bg-foreground text-background px-6 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.15em] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-2.5 active:scale-95 transition-all hover:bg-primary hover:text-black border border-transparent"
        >
          {activeTab === 'list' ? (
            <><MapIcon className="w-4 h-4" /> VER MAPA</>
          ) : (
            <><ListIcon className="w-4 h-4" /> VER LISTA</>
          )}
        </button>
      </div>
    </div>
  );
}
