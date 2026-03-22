'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { findVenueByLocation } from '@/lib/venues';
import { MapPin, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

// Fix Leaflet marker icon
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
});

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

interface VenueMapProps {
  location: string;
  lat?: number;
  lng?: number;
}

export default function VenueMap({ location, lat, lng }: VenueMapProps) {
  const venue = findVenueByLocation(location);
  const coords: [number, number] | null =
    lat && lng ? [lat, lng] : venue ? [venue.lat, venue.lng] : null;

  if (!coords) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue?.mapQuery || location)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-foreground/[0.03] flex items-center justify-center border border-foreground/10 text-foreground/50">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
              Ubicación de la cancha
            </h2>
            <span className="text-[9px] font-black text-foreground/60 uppercase tracking-widest">
              {location}
            </span>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 px-6 bg-primary/10 border border-primary/20 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center gap-2 group active:scale-95"
        >
          <ExternalLink className="w-4 h-4" />
          <span>COMO LLEGAR</span>
        </a>
      </div>

      <div className="w-full h-80 rounded-[3rem] overflow-hidden border border-foreground/10 relative z-0 bg-surface shadow-2xl">
        <MapContainer center={coords} zoom={15} scrollWheelZoom={false} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={coords} icon={RedPinIcon} />
          <MapResize />
        </MapContainer>

        <style jsx global>{`
          .custom-pin-icon {
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
          }
          .leaflet-container {
            background: #f1f3f4 !important;
          }
        `}</style>
      </div>
    </div>
  );
}
