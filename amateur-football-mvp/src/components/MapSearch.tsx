'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Match } from '@/lib/matches';
import { ROSARIO_VENUES } from '@/lib/venues';
import { Calendar, Users, MapPin, Trophy } from 'lucide-react';
import Link from 'next/link';

// Fix Leaflet marker icon issue
// SVG for the Google-style Red Pin
const GOOGLE_PIN_SVG = `
    <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0ZM15 20.625C11.8934 20.625 9.375 18.1066 9.375 15C9.375 11.8934 11.8934 9.375 15 9.375C18.1066 9.375 20.625 11.8934 20.625 15C20.625 18.1066 18.1066 20.625 15 20.625Z" fill="#EA4335"/>
        <path d="M15 18C16.6569 18 18 16.6569 18 15C18 13.3431 16.6569 12 15 12C13.3431 12 12 13.3431 12 15C12 16.6569 13.3431 18 15 18Z" fill="white"/>
    </svg>
`;

const RedPinIcon = L.divIcon({
  html: GOOGLE_PIN_SVG,
  className: 'custom-pin-icon',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -40],
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
function MapCenter({ coords }: { coords: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    // Debounce map updates to prevent jumping during typing
    const timer = setTimeout(() => {
      if (coords.length === 0) {
        map.setView([-32.9442, -60.6505], 13);
        return;
      }

      if (coords.length === 1) {
        map.setView(coords[0], 15);
      } else {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [coords, map]);

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
}

export default function MapSearch({ matches }: MapSearchProps) {
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
    <div className="w-full h-full rounded-2xl overflow-hidden border border-foreground/10 z-0 bg-surface">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {validMatches.map(({ match, coords }) => {
          const venue = findVenueByLocation(match.location || '');

          const searchQuery = venue?.mapQuery || match.location;
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
          const displayName = venue?.displayName || venue?.name || match.location;

          return (
            <Marker key={match.id} position={coords} icon={RedPinIcon}>
              <Popup minWidth={260} className="premium-search-popup">
                <div className="flex flex-col gap-3 p-1 text-zinc-950">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 bg-primary/20 text-zinc-900 text-[10px] font-black rounded uppercase border border-primary/30">
                        {match.type}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-black rounded uppercase border border-zinc-200">
                        {match.level}
                      </span>
                    </div>
                    <span className="text-zinc-900 font-extrabold text-lg">${match.price}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-950 text-sm leading-tight flex flex-col items-start gap-1 min-h-[36px]">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{displayName}</span>
                      </div>
                      {venue && (
                        <span className="text-[10px] text-zinc-500 font-medium ml-5 italic truncate w-full">
                          {match.location}
                        </span>
                      )}
                    </h4>
                    <div className="flex flex-col gap-1.5 mt-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-700 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" /> {match.date} ·{' '}
                        {match.time.split(':').slice(0, 2).join(':')}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-700 font-bold">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />{' '}
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

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Link
                      href={`/match?id=${match.id}`}
                      className="py-3 bg-zinc-950 text-white text-center font-black text-[10px] uppercase tracking-wider rounded-xl transition-all hover:bg-zinc-800"
                    >
                      Ver Partido
                    </Link>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 bg-primary border border-primary/20 text-zinc-950 text-center font-black text-[10px] uppercase tracking-wider rounded-xl transition-all hover:brightness-105 active:scale-95 shadow-sm shadow-primary/20"
                    >
                      IR CON GOOGLE
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapCenter coords={validMatches.map((v) => v.coords)} />
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background: #f1f3f4 !important;
        }
        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .leaflet-popup-content {
          margin: 14px;
          width: auto !important;
        }
        .custom-pin-icon {
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
        }
      `}</style>
    </div>
  );
}
