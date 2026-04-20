'use client';

import { motion } from 'framer-motion';
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
        'min-h-screen bg-background pt-4 px-3 sm:px-5 lg:px-10 xl:px-16 relative flex flex-col gap-4 sm:gap-8',
        isPerfMode && 'perf-mode'
      )}
    >
      {/* ── RADAR AMBIENT ── */}
      {!isPerfMode && (
        <div className="absolute top-0 left-0 w-full h-[300px] pointer-events-none opacity-20">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)]" />
        </div>
      )}

      {/* ── HEADER & RADAR SCANNER ── */}
      <div
        className={cn(
          'relative lg:sticky top-0 z-30 pt-4 pb-6 -mx-3 px-3 sm:-mx-5 sm:px-5 lg:-mx-10 lg:px-10 xl:-mx-16 xl:px-16 border-b border-foreground/5 shadow-2xl shadow-black/5',
          isPerfMode ? 'bg-background' : 'bg-background/80 backdrop-blur-md'
        )}
      >
        <div className="flex flex-col gap-8 relative z-10 text-center lg:text-left w-full">
          <div className="flex flex-col gap-2 relative">
            {/* Radar Sweep Animation behind title */}
            {!isPerfMode && (
              <div className="absolute -top-10 -left-10 lg:-left-20 w-32 lg:w-48 h-32 lg:h-48 pointer-events-none opacity-20">
                <div className="absolute inset-0 border border-primary/30 rounded-full" />
                <div className="absolute inset-0 border border-primary/10 rounded-full scale-150" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-r-2 border-primary/40 rounded-full"
                  style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(44,252,125,1)]" />
              </div>
            )}

            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full bg-primary',
                  !isPerfMode && 'animate-pulse'
                )}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">
                Sintonizando Frecuencias
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black italic text-foreground uppercase tracking-tightest leading-none">
              Radar de <span className="text-foreground/20">Partidos</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8 space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none">
                  <Search className="w-6 h-6 text-foreground/20 group-focus-within:text-primary transition-all duration-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscá canchas, zonas o tipo de partido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 lg:h-20 pl-16 lg:pl-20 pr-10 rounded-[1.8rem] lg:rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/10 focus:bg-foreground/[0.05] focus:border-primary/30 outline-none transition-all text-lg lg:text-xl font-black text-foreground placeholder:text-foreground/20 placeholder:italic shadow-2xl focus:shadow-primary/5"
                />
                <div className="absolute inset-y-0 right-10 flex items-center">
                  <Filter className="w-6 h-6 text-primary cursor-pointer hover:text-primary transition-colors" />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap items-center gap-3 px-2">
                <div className="flex items-center p-1 bg-foreground/5 rounded-2xl border border-foreground/5 gap-1">
                  {(['All', 'F5', 'F7', 'F11'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={cn(
                        'px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all',
                        typeFilter === type
                          ? 'bg-primary text-black shadow-lg shadow-primary/20'
                          : 'text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5'
                      )}
                    >
                      {type === 'All' ? 'TODOS' : type}
                    </button>
                  ))}
                </div>

                <div className="h-8 w-px bg-foreground/10 mx-1 hidden sm:block" />

                <button
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className={cn(
                    'flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest italic',
                    onlyAvailable
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5'
                      : 'bg-foreground/5 border-foreground/5 text-foreground/40 hover:border-foreground/10'
                  ) + ' active:scale-95'}
                >
                  Solo con cupo
                </button>

                <div className="h-8 w-px bg-foreground/10 mx-1 hidden sm:block" />

                <div className="flex items-center gap-4 bg-foreground/5 p-1 px-4 rounded-2xl border border-foreground/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest leading-none">Radio (km)</span>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={radiusFilter || 0}
                      onChange={(e) => setRadiusFilter(parseInt(e.target.value))}
                      className="w-24 h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <span className="text-[10px] font-black text-primary w-8 italic">{radiusFilter || '∞'}k</span>
                  <button
                    onClick={handleLocateMe}
                    className={cn(
                      "p-2 rounded-xl transition-all active:scale-95",
                      userLocation ? "bg-primary text-black" : "bg-foreground/10 text-foreground/40 hover:bg-foreground/20"
                    )}
                    title="Usar mi ubicación GPS"
                  >
                    <Navigation className={cn("w-3.5 h-3.5", userLocation && "fill-current")} />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 self-center lg:self-end">
              {/* Tab Switcher */}
              <div className="flex p-1 bg-foreground/5 rounded-2xl border border-foreground/5 relative h-14 items-center">
                <button
                  onClick={() => setActiveTab('list')}
                  className={cn(
                    'flex-1 h-full text-[9px] font-black uppercase tracking-[0.1em] rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 italic',
                    activeTab === 'list' ? 'text-black' : 'text-foreground/40 hover:text-foreground/60'
                  )}
                >
                  <LayoutGrid className="w-3 h-3" /> LISTA
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={cn(
                    'flex-1 h-full text-[9px] font-black uppercase tracking-[0.1em] rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 italic',
                    activeTab === 'map' ? 'text-black' : 'text-foreground/40 hover:text-foreground/60'
                  )}
                >
                  <MapPin className="w-3 h-3" /> MAPA
                </button>
                <motion.div
                  layoutId="radar-pill"
                  className="absolute inset-y-1 bg-primary rounded-xl shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
                  initial={false}
                  animate={{
                    left: activeTab === 'list' ? '4px' : '50%',
                    right: activeTab === 'list' ? '50%' : '4px',
                  }}
                  transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-10">
        {isLoading ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-primary/20 rounded-full animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-primary/60 italic">
                Sintonizando Señales...
              </p>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={`skeleton-${i}`}
                className="glass-premium rounded-[1.8rem] lg:rounded-[3rem] p-4 lg:p-8 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-14 relative overflow-hidden border border-foreground/[0.05] bg-foreground/[0.01]"
              >
                <div className="flex lg:flex-col items-center lg:items-start justify-between lg:justify-center gap-2 lg:min-w-[150px] lg:border-r border-foreground/5 lg:pr-14">
                  <div className="flex flex-row lg:flex-col gap-2">
                    <div className="w-16 h-6 bg-foreground/10 rounded-lg animate-pulse" />
                    <div className="w-12 h-6 bg-foreground/5 rounded-lg animate-pulse" />
                  </div>
                  <div className="hidden lg:flex flex-col gap-2 mt-5">
                    <div className="w-20 h-2 bg-foreground/10 rounded-full animate-pulse" />
                    <div className="w-24 h-4 bg-foreground/5 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="w-2/3 h-10 lg:h-14 bg-foreground/10 rounded-2xl animate-pulse" />
                  <div className="w-1/3 h-4 bg-foreground/5 rounded-full animate-pulse" />
                </div>
                <div className="hidden lg:flex items-center gap-14 lg:min-w-[320px] lg:border-l border-foreground/5 lg:pl-10">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                      <div className="w-20 h-2 bg-foreground/10 rounded-full animate-pulse" />
                      <div className="w-12 h-2 bg-foreground/10 rounded-full animate-pulse" />
                    </div>
                    <div className="w-full h-2 bg-foreground/5 rounded-full animate-pulse" />
                    <div className="flex gap-2">
                      <div className="w-4 h-4 bg-foreground/10 rounded-full animate-pulse" />
                      <div className="w-32 h-4 bg-foreground/5 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="w-32 h-16 bg-foreground/10 rounded-2xl animate-pulse" />
                </div>
                <div className="w-full lg:w-[250px] h-12 lg:h-24 bg-foreground/10 rounded-[1.2rem] lg:rounded-[2.2rem] animate-pulse" />
              </div>
            ))}
          </div>
        ) : activeTab === 'list' ? (
          <div className="flex flex-col gap-6">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match: Match, i: number) => (
                <motion.div
                  key={match.id}
                  initial={isPerfMode ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: 15 }}
                  whileInView={isPerfMode ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={isPerfMode ? { duration: 0 } : { delay: i * 0.04, duration: 0.4 }}
                  whileHover={isPerfMode ? {} : { y: -4, scale: 1.01 }}
                  className={cn(
                    'glass-premium rounded-[1.8rem] lg:rounded-[3rem] p-4 lg:p-8 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-14 relative overflow-hidden group border border-foreground/[0.08] bg-foreground/[0.01] transition-all',
                    isPerfMode ? 'duration-0' : 'hover:bg-foreground/[0.03] duration-500'
                  )}
                >
                  {/* ── BACKGROUND DECORATION ── */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors pointer-events-none" />

                  {/* Radar Scan Line */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-primary/40 to-transparent group-hover:h-full transition-all duration-700 pointer-events-none" />

                  {/* ── LEFT SECTION: Context & Level ── */}
                  <div className="flex lg:flex-col items-center lg:items-start justify-between lg:justify-center gap-2 lg:min-w-[150px] relative z-10 lg:border-r border-foreground/5 lg:pr-14">
                    <div className="flex flex-row lg:flex-col gap-2">
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg w-fit shadow-sm">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {match.type}
                        </span>
                      </div>
                      <div className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest italic w-fit">
                        {match.level}
                      </div>
                    </div>
                    <div className="hidden lg:flex flex-col gap-1.5 mt-5">
                      <span className="text-[9px] font-black uppercase text-foreground/30 tracking-[0.2em]">
                        Despliegue
                      </span>
                      <div className="flex items-center gap-2.5 text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-primary/60" />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] italic">
                          {match.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground/60 mt-0.5">
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-foreground/30" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {match.time} HS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── CENTER SECTION: Venue Info ── */}
                  <div className="flex-1 relative z-10 space-y-1 lg:space-y-3 py-0 lg:py-0">
                    {(() => {
                      const venue = findVenueByLocation(match.location || '');
                      const displayName = venue?.displayName || venue?.name || match.location;
                      return (
                        <div className="space-y-0.5 lg:space-y-2">
                          <h3 className="font-black text-2xl lg:text-5xl text-foreground italic uppercase group-hover:text-primary transition-colors tracking-tighter leading-tight">
                            {displayName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10">
                              <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-foreground/40 group-hover:text-primary/60 transition-colors" />
                            </div>
                            <p className="text-[9px] lg:text-xs text-foreground/50 font-bold uppercase tracking-widest max-w-[200px] lg:max-w-sm truncate">
                              {match.location}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Mobile Info Overlay (Single Line Tighter) */}
                    <div className="lg:hidden flex justify-between items-center pt-2 mt-2 border-t border-foreground/5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-primary/40" />
                        <span className="text-[10px] text-foreground/60 font-black uppercase italic tracking-widest">
                          {match.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const maxPlayers = match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                          const currentPlayers = typeof match.participants?.[0] === 'number'
                            ? match.participants[0]
                            : (match.participants?.[0] as any)?.count ?? (match.participants?.length || 0);
                          const missing = Math.max(0, maxPlayers - currentPlayers);

                          return (
                            <>
                              <div
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  missing > 0 ? 'bg-primary animate-pulse' : 'bg-zinc-700'
                                )}
                              />
                              <span
                                className={cn(
                                  'text-[10px] font-black uppercase italic tracking-widest leading-none',
                                  missing > 0 ? 'text-primary' : 'text-foreground/30'
                                )}
                              >
                                {missing > 0 ? `Faltan ${missing}` : 'COMPLETO'}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* ── DESKTOP DETAILS: Availability ── */}
                  <div className="hidden lg:flex items-center gap-14 relative z-10 px-0 lg:px-4 border-l border-foreground/5 lg:min-w-[320px]">
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em]">
                          Disponibilidad
                        </span>
                        {(() => {
                          const maxPlayers = match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                          const realPlayers = typeof match.participants?.[0] === 'number'
                            ? match.participants[0]
                            : (match.participants?.[0] as any)?.count ?? (match.participants?.length || 0);
                          const missing = Math.max(0, maxPlayers - realPlayers);

                          return (
                            <span
                              className={cn(
                                'text-[11px] font-black uppercase tracking-widest italic',
                                missing > 0 ? 'text-primary' : 'text-foreground/20'
                              )}
                            >
                              {realPlayers} / {maxPlayers}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden border border-foreground/5 relative">
                        {(() => {
                          const maxPlayers =
                            match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                          const countObj = match.participants?.[0];
                          const currentPlayers =
                            typeof countObj === 'number'
                              ? countObj
                              : countObj?.count !== undefined
                                ? countObj.count
                                : match.participants?.length || 0;
                          const percent = (currentPlayers / maxPlayers) * 100;
                          return (
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${percent}%` }}
                              transition={{ duration: 1, ease: 'circOut' }}
                              className={cn(
                                'h-full rounded-full transition-colors relative',
                                percent >= 100 ? 'bg-zinc-700' : 'bg-primary'
                              )}
                            >
                              {percent < 100 && (
                                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                              )}
                            </motion.div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-3">
                        {(() => {
                          const maxPlayers =
                            match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                          const countObj = match.participants?.[0];
                          const currentPlayers =
                            typeof countObj === 'number'
                              ? countObj
                              : countObj?.count !== undefined
                                ? countObj.count
                                : match.participants?.length || 0;
                          const missing = Math.max(0, maxPlayers - currentPlayers);
                          return (
                            <>
                              <Users
                                className={cn(
                                  'w-5 h-5',
                                  missing > 0 ? 'text-primary animate-pulse' : 'text-foreground/10'
                                )}
                              />
                              <span
                                className={cn(
                                  'text-xs font-black uppercase tracking-[0.2em] italic',
                                  missing > 0 ? 'text-foreground/40' : 'text-foreground/10'
                                )}
                              >
                                {missing > 0 ? `Se buscan ${missing} pibes` : 'Pelotón completo'}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex flex-col items-end min-w-[140px] border-l border-foreground/5 pl-14">
                      <span className="text-[9px] font-black uppercase text-foreground/20 tracking-[0.2em] mb-1.5">
                        Matrícula
                      </span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[14px] font-black text-foreground/40 italic">$</span>
                        <span className="text-5xl font-black text-foreground leading-none tracking-tighter italic tabular-nums group-hover:text-primary/90 transition-colors">
                          {match.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── ACTION SECTION (Mobile Tighter) ── */}
                  <div className="lg:w-[300px] relative z-20 flex flex-col gap-3 lg:gap-5 lg:pl-10 lg:border-l border-foreground/5">
                    <div className="lg:hidden flex items-center justify-between px-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[14px] font-black text-foreground/20 italic">$</span>
                        <span className="text-2xl font-black text-foreground italic tracking-tight">
                          {match.price.toLocaleString()}
                        </span>
                      </div>
                      <Link
                        href={`/match?id=${match.id}`}
                        className="text-primary text-[10px] font-black uppercase italic tracking-widest flex items-center gap-1"
                      >
                        DETALLES <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <Link
                      href={`/match?id=${match.id}`}
                      className={cn(
                        'w-full h-12 lg:h-24 rounded-[1.2rem] lg:rounded-[2.2rem] text-[10px] lg:text-[12px] font-black uppercase tracking-[0.3em] transition-all text-center flex items-center justify-center gap-3 active:scale-95 shadow-xl relative overflow-hidden',
                        joinedIds.has(match.id)
                          ? 'bg-foreground/5 text-foreground/40 border border-foreground/5'
                          : 'bg-primary text-black shadow-primary/20 hover:bg-white hover:text-black transition-colors'
                      )}
                    >
                      {joinedIds.has(match.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>RECLUTADO</span>
                        </>
                      ) : (
                        <>
                          <span>SOLICITAR INGRESO</span>
                          <ChevronRight className="w-4 h-4 lg:hidden" />
                        </>
                      )}
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-40 text-center gap-12 glass-premium rounded-[4rem] border-dashed border-2 border-foreground/5 bg-foreground/[0.01]">
                <div className="relative group">
                  <div className="w-32 h-32 bg-foreground/5 rounded-[2.5rem] flex items-center justify-center animate-float shadow-inner border border-foreground/10">
                    <Search className="w-14 h-14 text-foreground/20 group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute inset-0 border border-primary/20 rounded-[2.5rem] animate-pulse" />
                </div>
                <div className="max-w-xl mx-auto space-y-4">
                  <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">
                    Zona Desierta
                  </h3>
                  <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.3em] leading-relaxed">
                    No hay partidos por acá. Probá buscando otra cosa o armá uno nuevo.
                  </p>
                </div>
                <Link href="/create">
                  <button className="h-16 px-12 bg-foreground/5 text-foreground/40 hover:bg-primary hover:text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.8rem] border border-foreground/10 hover:border-primary transition-all shadow-2xl hover:shadow-primary/20">
                    ARMAR NUEVO PARTIDO
                  </button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[60vh] sm:h-[500px] lg:h-full lg:min-h-[600px] relative overflow-hidden rounded-[2rem] lg:rounded-[4rem] border border-foreground/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-surface">
            <MapSearch matches={mapMatches} userLocation={userLocation} radius={radiusFilter} />
            <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-20 flex flex-col gap-3">
              <div className="px-3 py-1.5 lg:px-5 lg:py-2.5 bg-background/60 backdrop-blur-md border border-foreground/10 rounded-2xl flex items-center gap-2 lg:gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  userLocation ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" : "bg-foreground/20"
                )} />
                <span className="text-[9px] font-black text-foreground uppercase tracking-widest">
                  {userLocation ? 'GPS ACTIVO' : 'GPS INACTIVO'}
                </span>
              </div>
              {!userLocation && (
                <button
                  onClick={handleLocateMe}
                  className="px-5 py-2.5 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  ACTIVAR RADAR GPS
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
