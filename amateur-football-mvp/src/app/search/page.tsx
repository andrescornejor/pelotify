'use client';

import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Navigation,
  SlidersHorizontal,
  Map,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { findVenueByLocation } from '@/lib/venues';
import dynamic from 'next/dynamic';
import { useMatchSearch } from '@/hooks/useMatchSearch';
import { useSettings } from '@/contexts/SettingsContext';
import { type Match } from '@/lib/matches';

const MapSearch = dynamic(() => import('@/components/MapSearch'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
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
        if (radiusFilter === 50) setRadiusFilter(15);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener tu ubicación. Asegurate de dar permisos de GPS.');
      }
    );
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-24">
      
      {/* ── STICKY HEADER (PedidosYa Style) ── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm px-4 pt-4 pb-3 sm:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          
          {/* Location Selector */}
          <div className="flex items-center justify-between">
            <button 
              onClick={handleLocateMe}
              className="flex items-center gap-2 max-w-[70%] group text-left"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Entregar en / Jugar cerca de
                </span>
                <span className="text-zinc-900 dark:text-zinc-100 font-bold truncate text-sm">
                  {userLocation ? 'Ubicación Actual (GPS Activo)' : 'Ubicación Global (Elige tu zona)'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Radio</span>
              <select 
                title="Radio en Km"
                value={radiusFilter || 50}
                onChange={(e) => setRadiusFilter(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-none text-right cursor-pointer"
              >
                <option value="5">A 5 km</option>
                <option value="10">A 10 km</option>
                <option value="15">A 15 km</option>
                <option value="50">Ilimitado</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Buscá canchas, zonas o nivel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 font-medium text-base shadow-inner focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Horizontal Filters Pill Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={cn(
                "flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                onlyAvailable 
                  ? "bg-primary/10 border-primary text-primary dark:bg-primary/20" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Solo con cupo
            </button>
            {(['All', 'F5', 'F7', 'F11'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "px-4 h-9 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                  typeFilter === type
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                )}
              >
                {type === 'All' ? 'Todos los formatos' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-6">
        
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-[140px] bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'list' ? (
          <div className="flex flex-col gap-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match: Match, i: number) => {
                const venue = findVenueByLocation(match.location || '');
                const displayName = venue?.displayName || venue?.name || match.location;
                
                const maxPlayers = match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                const countObj = match.participants?.[0];
                const currentPlayers = typeof countObj === 'number' 
                  ? countObj 
                  : countObj?.count !== undefined ? countObj.count : (match.participants?.length || 0);
                const missing = Math.max(0, maxPlayers - currentPlayers);

                return (
                  <Link 
                    key={match.id}
                    href={`/match?id=${match.id}`}
                    className="group"
                  >
                    <motion.div
                      initial={isPerfMode ? { opacity: 1 } : { opacity: 0, y: 10 }}
                      animate={isPerfMode ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      {/* Left icon / status */}
                      <div className="w-20 flex-shrink-0 flex flex-col items-center justify-center gap-2 border-r border-zinc-100 dark:border-zinc-800 pr-4">
                        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                          <span className="text-zinc-600 dark:text-zinc-300 font-black text-sm">{match.type}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{match.level}</span>
                      </div>

                      {/* Middle Details */}
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                          {displayName}
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium truncate mb-2">
                          {match.location}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-red-500" />
                            {match.date} a las {match.time}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            ${match.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Right Availability & Action */}
                      <div className="hidden sm:flex flex-col items-end justify-center pl-4 gap-2">
                        <span className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-md",
                          missing > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                        )}>
                          {missing > 0 ? `Faltan ${missing}` : 'Completo'}
                        </span>
                        {joinedIds.has(match.id) && (
                          <span className="text-[10px] font-bold text-primary uppercase">Ya estás anotado</span>
                        )}
                      </div>
                      
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:hidden text-zinc-300 dark:text-zinc-700">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </motion.div>
                  </Link>
                )
              })
            ) : (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No encontramos partidos</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-6">
                  Modificá los filtros, ampliá el radio de búsqueda o anímate a organizar uno vos mismo.
                </p>
                <Link href="/create">
                  <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
                    Organizar un partido
                  </button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[60vh] sm:h-[70vh] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner bg-zinc-100 dark:bg-zinc-900 relative">
            <MapSearch matches={mapMatches} userLocation={userLocation} radius={radiusFilter} />
          </div>
        )}
      </div>

      {/* Floating Map/List Toggle (PedidosYa Map View Button style) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setActiveTab(activeTab === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3.5 rounded-full font-bold shadow-xl shadow-black/20 hover:scale-105 transition-transform"
        >
          {activeTab === 'list' ? (
            <>
              <Map className="w-4 h-4" /> Ver en mapa
            </>
          ) : (
            <>
              <List className="w-4 h-4" /> Ver lista
            </>
          )}
        </button>
      </div>

    </div>
  );
}
