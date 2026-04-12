'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Match } from '@/lib/matches';
import { ROSARIO_VENUES } from '@/lib/venues';
import { Calendar, Users, MapPin, Trophy, Navigation, Target } from 'lucide-react';
import Link from 'next/link';

// Fix Leaflet marker icon issue
// SVG for the Google-style Red Pin, replaced with Neon Green Pin
const NEON_PIN_SVG = `
    <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0ZM15 20.625C11.8934 20.625 9.375 18.1066 9.375 15C9.375 11.8934 11.8934 9.375 15 9.375C18.1066 9.375 20.625 11.8934 20.625 15C20.625 18.1066 18.1066 20.625 15 20.625Z" fill="#2cfc7d"/>
        <path d="M15 18C16.6569 18 18 16.6569 18 15C18 13.3431 16.6569 12 15 12C13.3431 12 12 13.3431 12 15C12 16.6569 13.3431 18 15 18Z" fill="#000000"/>
    </svg>
`;

// SVG for User Location (Glowing Blue/Purple)
const USER_PIN_SVG = `
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="10" fill="#60a5fa" stroke="#000000" stroke-width="3"/>
        <circle cx="15" cy="15" r="15" fill="#3b82f6" fill-opacity="0.3"/>
    </svg>
`;

const NeonPinIcon = L.divIcon({
  html: NEON_PIN_SVG,
  className: 'custom-pin-icon',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -40],
});

const UserPinIcon = L.divIcon({
  html: USER_PIN_SVG,
  className: 'user-pin-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Helper for accent-insensitive search
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

import { findVenueByLocation } from '@/lib/venues';

// Custom hook to handle map resizing and positioning with debounce
function MapCenter({ coords, userCoords }: { coords: [number, number][]; userCoords: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    // Debounce map updates to prevent jumping during typing
    const timer = setTimeout(() => {
      // If we have user coordinates and no matches, center on user
      if (coords.length === 0 && userCoords) {
        map.setView(userCoords, 14);
        return;
      }

      if (coords.length === 0) {
        map.setView([-32.9442, -60.6505], 13);
        return;
      }

      if (coords.length === 1) {
        map.setView(coords[0], 15);
      } else {
        const bounds = L.latLngBounds(coords);
        if (userCoords) bounds.extend(userCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [coords, map, userCoords]);

  // Constant size invalidation
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 1000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  return null;
}

interface MapSearchProps {
  matches: Match[];
  userLocation?: { lat: number; lng: number } | null;
  radius?: number | null;
}

export default function MapSearch({ matches, userLocation, radius }: MapSearchProps) {
  const defaultCenter: [number, number] = [-32.9442, -60.6505]; // Rosario City Center

  // Helper to get coordinates for a match
  const getMatchCoords = (match: Match): [number, number] | null => {
    if (match.lat && match.lng) return [match.lat, match.lng];

    const venue = findVenueByLocation(match.location || '');
    if (venue) return [venue.lat, venue.lng];

    return null;
  };

  const validMatches = matches
    .map((m) => ({ match: m, coords: getMatchCoords(m) }))
    .filter((item) => item.coords !== null) as { match: Match; coords: [number, number] }[];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-foreground/10 z-0 bg-surface relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={UserPinIcon}>
              <Popup>Estás acá</Popup>
            </Marker>
            {radius && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radius * 1000}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
              />
            )}
          </>
        )}

        {validMatches.map(({ match, coords }) => {
          const venue = findVenueByLocation(match.location || '');

          const searchQuery = venue?.mapQuery || match.location;
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
          const displayName = venue?.displayName || venue?.name || match.location;

          return (
            <Marker key={match.id} position={coords} icon={NeonPinIcon}>
              <Popup minWidth={260} className="premium-search-popup neon-theme">
                <div className="flex flex-col gap-3 p-2 text-white">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black rounded uppercase border border-primary/30">
                        {match.type}
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 text-white/60 text-[10px] font-black rounded uppercase border border-white/10">
                        {match.level}
                      </span>
                    </div>
                    <span className="text-white font-black italic text-lg opacity-80">${match.price}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight flex flex-col items-start gap-1 min-h-[36px]">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="line-clamp-1 italic">{displayName}</span>
                      </div>
                      {venue && (
                        <span className="text-[10px] text-white/40 font-medium ml-5 italic truncate w-full">
                          {match.location}
                        </span>
                      )}
                    </h4>
                    <div className="flex flex-col gap-1.5 mt-3 bg-zinc-900/50 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-[11px] text-white/70 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-primary/50" /> {match.date} ·{' '}
                        {match.time.split(':').slice(0, 2).join(':')}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/70 font-bold">
                        <Users className="w-3.5 h-3.5 text-primary/50" />{' '}
                        {(() => {
                          const maxPlayers =
                            match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                          const countObj = match.participants?.[0];
                          const currentPlayers =
                            typeof countObj === 'number' ? countObj : countObj?.count || 0;
                          const missing = Math.max(0, maxPlayers - currentPlayers);

                          if (missing === 0) return 'Cupo Completo';
                          if (missing === 1) return 'Falta 1 jugador';
                          return `Faltan ${missing} jugadores`;
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link
                      href={`/match?id=${match.id}`}
                      className="py-3.5 bg-white/5 border border-white/10 text-white text-center font-black text-[10px] uppercase tracking-widest rounded-xl transition-all hover:bg-white/10"
                    >
                      Sumarse
                    </Link>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3.5 bg-primary text-black text-center font-black text-[10px] uppercase tracking-widest rounded-xl transition-all hover:brightness-105 active:scale-95 shadow-glow-primary"
                    >
                      IR AL PREDIO
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapCenter
          coords={validMatches.map((v) => v.coords)}
          userCoords={userLocation ? [userLocation.lat, userLocation.lng] : null}
        />
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background: #000000 !important;
        }
        .premium-search-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 15, 15, 0.8) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 0;
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.7) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .premium-search-popup .leaflet-popup-tip {
          background: rgba(15, 15, 15, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .premium-search-popup .leaflet-popup-content {
          margin: 12px;
          width: auto !important;
        }
        .custom-pin-icon {
          filter: drop-shadow(0 0 15px rgba(44, 252, 125, 0.5));
        }
        .user-pin-icon {
          filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.6));
        }
      `}</style>
    </div>
  );
}

