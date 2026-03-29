'use client';

import { MapPin, ExternalLink } from 'lucide-react';
import { findVenueByLocation } from '@/lib/venues';

interface VenueMapProps {
  location: string;
}

export default function VenueMap({ location }: VenueMapProps) {
  const venue = findVenueByLocation(location);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue?.mapQuery || location)}`;

  return (
    <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center p-6 text-center gap-4 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner border border-primary/5">
        <MapPin className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-black italic uppercase tracking-tighter text-foreground">
          {location.split(',')[0]}
        </h3>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest max-w-[200px] leading-relaxed">
          {location.split(',').slice(1).join(',')}
        </p>
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 h-10 px-5 bg-foreground/5 border border-foreground/10 rounded-2xl text-[9px] font-black text-foreground/50 uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all flex items-center gap-2 active:scale-95"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Ver en Google Maps
      </a>

      {/* Decorative dots grid */}
      <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-foreground rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
