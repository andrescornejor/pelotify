'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationResult {
    name: string;
    city?: string;
    state?: string;
    country?: string;
    street?: string;
    housenumber?: string;
}

interface LocationSearchProps {
    value: string;
    onChange: (address: string) => void;
    placeholder?: string;
}

export default function LocationSearch({ value, onChange, placeholder }: LocationSearchProps) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<LocationResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const searchLocations = async (searchQuery: string, retryWithCity = true) => {
        if (searchQuery.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            // Photon API (OpenStreetMap based)
            // Adding lon/lat for Rosario to bias results
            const lon = -60.6393;
            const lat = -32.9468;
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=8&lat=${lat}&lon=${lon}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.features.length === 0 && retryWithCity && !searchQuery.toLowerCase().includes('rosario')) {
                // Try once more appending Rosario if no results found
                return searchLocations(`${searchQuery} Rosario`, false);
            }

            const formattedResults = data.features.map((f: any) => ({
                name: f.properties.name || f.properties.street || 'Dirección desconocida',
                city: f.properties.city,
                state: f.properties.state,
                country: f.properties.country,
                street: f.properties.street,
                housenumber: f.properties.housenumber
            }));

            setResults(formattedResults);
            setIsOpen(true);
        } catch (error) {
            console.error('Error searching locations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Simple debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query !== value) {
                searchLocations(query);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (result: LocationResult) => {
        const addressParts = [
            result.name,
            result.street ? `${result.street} ${result.housenumber || ''}` : '',
            result.city,
            result.state
        ].filter(Boolean);
        
        const fullAddress = Array.from(new Set(addressParts)).join(', ');
        setQuery(fullAddress);
        onChange(fullAddress);
        setIsOpen(false);
    };

    return (
        <div className="relative group w-full" ref={containerRef}>
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                <Search className={`w-5 h-5 transition-colors ${isLoading ? 'text-primary animate-pulse' : 'text-foreground/20 group-focus-within:text-primary'}`} />
            </div>
            
            <input
                type="text"
                placeholder={placeholder || "Buscar cancha o dirección..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 3 && setIsOpen(true)}
                className="w-full h-16 pl-14 pr-12 rounded-2xl bg-foreground/[0.02] border border-foreground/10 focus:bg-foreground/[0.04] focus:border-primary/30 outline-none transition-all text-sm font-bold text-foreground placeholder:text-foreground/10 italic"
            />

            {query && (
                <button 
                    onClick={() => { setQuery(''); onChange(''); setResults([]); }}
                    className="absolute inset-y-0 right-4 flex items-center text-foreground/20 hover:text-foreground/60 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 5, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 z-[100] border border-foreground/10 rounded-3xl overflow-hidden mt-2 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-background/95 backdrop-blur-3xl"
                        >
                        {results.map((result, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(result)}
                                className="w-full flex items-start gap-4 p-4 hover:bg-foreground/5 rounded-2xl transition-all text-left group/item"
                            >
                                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0 group-hover/item:bg-primary/20 transition-colors">
                                    <MapPin className="w-5 h-5 text-foreground/40 group-hover/item:text-primary" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-black text-foreground uppercase tracking-tight italic group-hover/item:text-primary transition-colors">
                                        {result.name}
                                    </span>
                                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest line-clamp-1">
                                        {[result.street, result.city, result.state, result.country].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
