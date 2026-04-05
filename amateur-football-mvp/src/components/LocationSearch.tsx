'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X, Navigation, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJsApiLoader } from '@react-google-maps/api';

interface LocationResult {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  street?: string;
  housenumber?: string;
  isEstablishment?: boolean;
}

interface LocationSearchProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export default function LocationSearch({ value, onChange, placeholder }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Google Maps script only if API Key is available
  const { isLoaded: isGoogleLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: libraries,
  });

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchWithGoogle = async (searchQuery: string) => {
    if (!GOOGLE_API_KEY || !window.google || !isGoogleLoaded) return null;

    const service = new google.maps.places.AutocompleteService();
    return new Promise<LocationResult[]>((resolve) => {
      service.getPlacePredictions(
        {
          input: searchQuery,
          locationBias: { lat: -32.9468, lng: -60.6393 }, // Rosario bias
          componentRestrictions: { country: 'ar' },
          types: ['establishment', 'geocode'],
        },
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            resolve([]);
            return;
          }

          const formatted = predictions.map((p) => ({
            name: p.structured_formatting.main_text,
            street: p.structured_formatting.secondary_text,
            isEstablishment: p.types.includes('establishment'),
            // We'll reconstruct other fields from description or details if needed
            // For now, main text + secondary is usually enough for a search result
          }));
          resolve(formatted);
        }
      );
    });
  };

  const searchWithPhoton = async (searchQuery: string, retryWithCity = true) => {
    try {
      const lon = -60.6393; // Rosario bias
      const lat = -32.9468;
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=8&lat=${lat}&lon=${lon}`;

      const response = await fetch(url);
      const data = await response.json();

      if (
        data.features.length === 0 &&
        retryWithCity &&
        !searchQuery.toLowerCase().includes('rosario')
      ) {
        return searchWithPhoton(`${searchQuery} Rosario`, false);
      }

      return data.features.map((f: any) => ({
        name: f.properties.name || f.properties.street || 'Dirección desconocida',
        city: f.properties.city,
        state: f.properties.state,
        country: f.properties.country,
        street: f.properties.street,
        housenumber: f.properties.housenumber,
        isEstablishment: !!f.properties.name && !!f.properties.street,
      }));
    } catch (error) {
      console.error('Error searching with Photon:', error);
      return [];
    }
  };

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      let finalResults: LocationResult[] = [];

      // Try Google First
      if (GOOGLE_API_KEY && isGoogleLoaded) {
        const googleResults = await searchWithGoogle(searchQuery);
        if (googleResults && googleResults.length > 0) {
          finalResults = googleResults;
        }
      }

      // If Google failed/unavailable or returned few results, use Photon as fallback/supplement
      if (finalResults.length < 5) {
        const photonResults = await searchWithPhoton(searchQuery);
        // Merge without duplicates (very basic check)
        const existingNames = new Set(finalResults.map((r: LocationResult) => r.name.toLowerCase()));
        const uniquePhoton = photonResults.filter((r: LocationResult) => !existingNames.has(r.name.toLowerCase()));
        finalResults = [...finalResults, ...uniquePhoton].slice(0, 8);
      }

      setResults(finalResults);
      setIsOpen(true);
    } catch (error) {
      console.error('General error searching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== value && query.length >= 3) {
        searchLocations(query);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: LocationResult) => {
    let cleanAddress = '';
    
    if (result.isEstablishment) {
      // For establishments, we usually just want the Name and maybe the street, 
      // but definitely NOT the whole hierarchy (City, State, Country)
      cleanAddress = result.name;
      
      // If we have a street and it's not already in the name, we can append it for clarity,
      // but we strip the city parts from it
      if (result.street) {
        const streetOnly = result.street.split(',')[0].trim();
        if (!cleanAddress.includes(streetOnly)) {
          cleanAddress += `, ${streetOnly}`;
        }
      }
    } else {
      // For general addresses, we keep a bit more but still strip the redundant suffixes
      const addressParts = [
        result.name,
        result.street ? `${result.street} ${result.housenumber || ''}` : '',
      ].filter(Boolean);
      
      cleanAddress = Array.from(new Set(addressParts)).join(', ');
    }

    // Recursive cleaning of common suffixes
    const suffixesToRemove = [
      ', Rosario', ', Santa Fe', ', Argentina', 
      'Rosario', 'Santa Fe', 'Argentina',
      ', Sante Fe' // common typo
    ];
    
    let finalAddress = cleanAddress;
    suffixesToRemove.forEach(s => {
      const regex = new RegExp(s + '$', 'gi');
      finalAddress = finalAddress.replace(regex, '').trim();
    });
    
    // Clean trailing commas
    finalAddress = finalAddress.replace(/,$/, '').trim();

    setQuery(finalAddress);
    onChange(finalAddress);
    setIsOpen(false);
  };

  return (
    <div className="relative group w-full" ref={containerRef}>
      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
        <Search
          className={`w-5 h-5 transition-all duration-300 ${isLoading ? 'text-primary scale-110 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'text-foreground/20 group-focus-within:text-primary'}`}
        />
      </div>

      <input
        type="text"
        placeholder={placeholder || 'Buscá una cancha o establecimiento...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 3 && setIsOpen(true)}
        className="w-full h-16 pl-14 pr-12 rounded-2xl bg-foreground/[0.02] border border-foreground/10 focus:bg-foreground/[0.04] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-bold text-foreground placeholder:text-foreground/10 italic"
      />

      {query && (
        <button
          onClick={() => {
            setQuery('');
            onChange('');
            setResults([]);
          }}
          className="absolute inset-y-0 right-4 flex items-center text-foreground/20 hover:text-primary transition-colors p-2"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-y-0 right-14 flex items-center">
          <Loader2 className="w-4 h-4 text-primary/40 animate-spin" />
        </div>
      )}

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 z-[100] border border-foreground/10 rounded-[2rem] overflow-hidden mt-3 p-1.5 shadow-2xl bg-background/98 md: ring-1 ring-white/5"
          >
            <div className="max-h-[350px] overflow-y-auto no-scrollbar py-1">
              {results.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-4 p-3.5 hover:bg-foreground/5 rounded-2xl transition-all text-left group/item"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${result.isEstablishment ? 'bg-primary/10 text-primary' : 'bg-foreground/5 text-foreground/20'} group-hover/item:scale-110 group-hover/item:shadow-lg`}>
                    {result.isEstablishment ? (
                      <Building2 className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-black text-foreground uppercase tracking-tight italic group-hover/item:text-primary transition-colors truncate">
                      {result.name}
                    </span>
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest line-clamp-1">
                      {[result.street, result.city, result.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Navigation className="w-4 h-4 text-primary" />
                  </div>
                </button>
              ))}
            </div>
            
            {!GOOGLE_API_KEY && (
              <div className="px-5 py-3 border-t border-foreground/5 bg-foreground/[0.02]">
                <p className="text-[9px] font-extrabold text-foreground/20 uppercase tracking-[0.2em] leading-relaxed text-center">
                  Cancha no encontrada? Activa Google Places para mejores resultados
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

