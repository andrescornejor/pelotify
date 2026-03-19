'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Match } from '@/lib/matches';
import { findVenueByLocation } from '@/lib/venues';
import { MapPin, ExternalLink } from 'lucide-react';

const GOOGLE_PIN_SVG = `
    <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0ZM15 20.625C11.8934 20.625 9.375 18.1066 9.375 15C9.375 11.8934 11.8934 9.375 15 9.375C18.1066 9.375 20.625 11.8934 20.625 15C20.625 18.1066 18.1066 20.625 15 20.625Z" fill="#10B981"/>
        <path d="M15 18C16.6569 18 18 16.6569 18 15C18 13.3431 16.6569 12 15 12C13.3431 12 12 13.3431 12 15C12 16.6569 13.3431 18 15 18Z" fill="black"/>
    </svg>
`;

export default function MatchMap({ match }: { match: Match }) {
    const venue = findVenueByLocation(match.location || '');
    const coords: [number, number] = match.lat && match.lng 
        ? [match.lat, match.lng] 
        : venue 
            ? [venue.lat, venue.lng] 
            : [-32.9442, -60.6505];

    // Important: we need to handle marker icon initialization inside useEffect or check for window
    // but DivIcon can be created here if we are careful.
    const PrimaryPinIcon = L.divIcon({
        html: GOOGLE_PIN_SVG,
        className: 'custom-pin-icon',
        iconSize: [30, 42],
        iconAnchor: [15, 42],
    });

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue?.mapQuery || match.location || '')}`;

    return (
        <div className="w-full h-[300px] md:h-[450px] rounded-[3rem] overflow-hidden border border-white/10 relative z-0 group shadow-2xl">
            <MapContainer
                center={coords}
                zoom={16}
                scrollWheelZoom={false}
                className="w-full h-full grayscale-[0.2] contrast-[1.1]"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={coords} icon={PrimaryPinIcon}>
                    <Popup minWidth={220} className="match-detail-popup">
                        <div className="p-2 space-y-3">
                             <div className="space-y-1">
                                <h4 className="font-black text-zinc-950 uppercase italic text-sm leading-none">{venue?.displayName || match.location}</h4>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{match.location}</p>
                             </div>
                             <a 
                                href={mapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all active:scale-95"
                             >
                                <ExternalLink size={12} /> VER EN GOOGLE MAPS
                             </a>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
            
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    border-radius: 24px;
                    padding: 4px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important;
                }
                .leaflet-popup-tip {
                    background: white;
                }
                .custom-pin-icon {
                    filter: drop-shadow(0 8px 12px rgba(0,0,0,0.4));
                }
            `}</style>
        </div>
    );
}
