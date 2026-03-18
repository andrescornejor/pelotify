'use client';

import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Filter, Loader2, CheckCircle2, LayoutGrid, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getMatches, getUserMatches, Match } from '@/lib/matches';
import { useAuth } from '@/contexts/AuthContext';
import { findVenueByLocation, normalizeVenueString } from '@/lib/venues';
import dynamic from 'next/dynamic';

const MapSearch = dynamic(() => import('@/components/MapSearch'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] bg-zinc-900 rounded-xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )
});

export default function SearchPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
    const [matches, setMatches] = useState<Match[]>([]);
    const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const [allMatches, userMatches] = await Promise.all([
                    getMatches(),
                    user ? getUserMatches(user.id) : Promise.resolve([]),
                ]);
                setMatches(allMatches);
                setJoinedIds(new Set((userMatches as any[]).filter(Boolean).map((m: any) => m?.id)));
            } catch (err) {
                console.error('Error fetching matches:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMatches();
    }, [user?.id]);

    const filteredMatches = matches.filter(match => {
        if (match.is_completed) return false;
        if (match.is_private) return false;
        
        // Hide past matches from radar
        const matchStart = new Date(`${match.date}T${match.time}`);
        const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
        if (new Date() > matchEnd) return false;

        const search = normalizeVenueString(searchQuery);
        if (!search) return true;

        const loc = normalizeVenueString(match.location || '');
        const type = normalizeVenueString(match.type);
        const level = normalizeVenueString(match.level);

        if (loc.includes(search) || type.includes(search) || level.includes(search)) return true;

        const venue = findVenueByLocation(match.location || '');
        if (venue) {
            const vName = normalizeVenueString(venue.name);
            if (vName.includes(search)) return true;
        }

        return false;
    });

    return (
        <div className="flex flex-col gap-8 p-4 lg:p-10 lg:pt-4 max-w-screen-2xl mx-auto h-full bg-background relative overflow-hidden min-h-screen snap-y snap-proximity overflow-y-auto">
            
            {/* ── RADAR AMBIENT ── */}
            <div className="absolute top-0 left-0 w-full h-[300px] pointer-events-none opacity-20">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)]" />
            </div>

            {/* ── HEADER & RADAR SCANNER ── */}
            <div className="sticky top-0 z-30 pt-4 pb-6 bg-background/80 backdrop-blur-xl -mx-4 px-4 lg:-mx-12 lg:px-12 border-b border-foreground/5 shadow-2xl shadow-black/5">
                <div className="flex flex-col gap-8 relative z-10 text-center lg:text-left max-w-screen-2xl mx-auto">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 justify-center lg:justify-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Sintonizando Frecuencias</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black italic text-foreground uppercase tracking-tighter leading-none">Scouting <span className="text-foreground/40">Radar</span></h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                        <div className="lg:col-span-8 space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-all duration-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscá canchas, zonas o tipo de partido..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-14 pl-14 pr-8 rounded-2xl bg-foreground/5 border border-foreground/10 focus:bg-foreground/10 focus:border-primary/20 outline-none transition-all text-base font-bold text-foreground placeholder:text-foreground/20 placeholder:italic shadow-inner"
                                />
                                <div className="absolute inset-y-0 right-6 flex items-center">
                                    <Filter className="w-5 h-5 text-foreground/20 cursor-pointer hover:text-foreground transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 self-center lg:self-end">
                            {/* Tab Switcher */}
                            <div className="flex p-1 bg-foreground/5 rounded-2xl border border-foreground/5 relative h-14 items-center">
                                <button
                                    onClick={() => setActiveTab('list')}
                                    className={cn(
                                        "flex-1 h-full text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 flex items-center justify-center gap-3 italic",
                                        activeTab === 'list' ? 'text-black' : 'text-foreground/40 hover:text-foreground/60'
                                    )}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" /> VISTA LISTA
                                </button>
                                <button
                                    onClick={() => setActiveTab('map')}
                                    className={cn(
                                        "flex-1 h-full text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 flex items-center justify-center gap-3 italic",
                                        activeTab === 'map' ? 'text-black' : 'text-foreground/40 hover:text-foreground/60'
                                    )}
                                >
                                    <MapPin className="w-3.5 h-3.5" /> MAPEO GPS
                                </button>
                                <motion.div 
                                    layoutId="radar-pill"
                                    className="absolute inset-y-1 bg-primary rounded-xl shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
                                    initial={false}
                                    animate={{
                                        left: activeTab === 'list' ? '4px' : 'calc(50% + 2px)',
                                        right: activeTab === 'list' ? 'calc(50% + 2px)' : '4px',
                                    }}
                                    transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-48 text-zinc-500 gap-8">
                        <div className="relative">
                            <div className="w-24 h-24 border-2 border-primary/10 rounded-full animate-ping" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Search className="w-8 h-8 text-primary/40 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-zinc-700 italic">Sincronizando Satélites...</p>
                    </div>
                ) : activeTab === 'list' ? (
                    <div className="flex flex-col gap-6">
                        {filteredMatches.length > 0 ? (
                            filteredMatches.map((match, i) => (
                                <motion.div
                                    key={match.id}
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.01 }}
                                    className="glass-premium rounded-[2.5rem] lg:rounded-[3rem] p-6 lg:p-8 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 lg:gap-12 relative overflow-hidden group border border-foreground/5 bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-all duration-500"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-colors pointer-events-none" />

                                    {/* Left Section: Context & Level (Mobile Header / Desktop Side) */}
                                    <div className="flex lg:flex-col items-center lg:items-start justify-between lg:justify-center gap-4 lg:min-w-[140px] relative z-10 border-b lg:border-b-0 lg:border-r border-foreground/5 pb-4 lg:pb-0 lg:pr-12">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{match.type}</span>
                                            </div>
                                            <div className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest italic w-fit">{match.level}</div>
                                        </div>
                                        <div className="hidden lg:flex flex-col gap-1 mt-4">
                                            <span className="text-[8px] font-black uppercase text-foreground/20 tracking-[0.2em]">Despliegue</span>
                                            <div className="flex items-center gap-2 text-foreground">
                                                <Calendar className="w-3 h-3 text-primary opacity-50" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">{match.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Section: Core Info (Venue & Address) */}
                                    <div className="flex-1 relative z-10 space-y-2 py-2 lg:py-0">
                                        {(() => {
                                            const venue = findVenueByLocation(match.location || '');
                                            const displayName = venue?.displayName || venue?.name || match.location;
                                            return (
                                                <div className="space-y-1">
                                                    <h3 className="font-black text-2xl lg:text-4xl text-foreground italic uppercase group-hover:text-primary transition-colors tracking-tighter leading-none">{displayName}</h3>
                                                    <p className="text-[10px] lg:text-xs text-foreground/40 font-bold flex items-center gap-2 uppercase tracking-widest">
                                                        <MapPin className="w-4 h-4 text-foreground/20" /> {match.location}
                                                    </p>
                                                </div>
                                            );
                                        })()}
                                        <div className="lg:hidden flex justify-between items-center pt-4 border-t border-foreground/5">
                                             <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black uppercase text-foreground/20 tracking-[0.2em]">Despliegue</span>
                                                <span className="text-[10px] text-foreground font-black uppercase italic tracking-widest">{match.date}</span>
                                            </div>
                                             <div className="flex flex-col items-end gap-1">
                                                <span className="text-[8px] font-black uppercase text-foreground/20 tracking-[0.2em]">Disponibilidad</span>
                                                <span className="text-[10px] text-primary font-black uppercase italic tracking-widest">
                                                    {(() => {
                                                        const maxPlayers = match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                                                        const countObj = match.participants?.[0];
                                                        const currentPlayers = typeof countObj === 'number' ? countObj : (countObj?.count || 0);
                                                        const missing = Math.max(0, maxPlayers - currentPlayers);
                                                        return missing > 0 ? `Faltan ${missing}` : 'Completo';
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Details: Availability & Price */}
                                    <div className="hidden lg:flex items-center gap-16 relative z-10 px-12 border-l border-foreground/5">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[9px] font-black uppercase text-foreground/20 tracking-[0.2em]">Disponibilidad</span>
                                            {(() => {
                                                const maxPlayers = match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
                                                const countObj = match.participants?.[0];
                                                const currentPlayers = typeof countObj === 'number' ? countObj : (countObj?.count || 0);
                                                const missing = Math.max(0, maxPlayers - currentPlayers);

                                                return (
                                                    <div className="flex items-center gap-3">
                                                        <Users className={cn("w-5 h-5", missing > 0 ? "text-primary animate-pulse" : "text-foreground/20")} />
                                                        <span className={cn("text-sm font-black uppercase tracking-widest italic", missing > 0 ? "text-foreground" : "text-foreground/20")}>
                                                            {missing > 0 ? `Faltan ${missing}` : 'Completo'}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-4xl font-black text-foreground leading-none tracking-tighter italic">${match.price.toLocaleString()}</span>
                                            <span className="text-[9px] font-black uppercase text-foreground/20 tracking-[0.2em] mt-2">POR CABEZA</span>
                                        </div>
                                    </div>

                                    {/* Action Section */}
                                    <div className="lg:w-[280px] relative z-10 lg:border-l lg:border-foreground/5 lg:pl-12">
                                        <div className="lg:hidden flex items-center justify-between mb-4">
                                             <span className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.2em]">Costo del Partido</span>
                                             <span className="text-xl font-black text-foreground italic tracking-tighter">${match.price.toLocaleString()}</span>
                                        </div>
                                        <Link 
                                            href={`/match?id=${match.id}`} 
                                            className={cn(
                                                "w-full h-16 lg:h-20 rounded-[1.5rem] lg:rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all text-center flex items-center justify-center gap-4 active:scale-95 shadow-xl group/btn",
                                                joinedIds.has(match.id) 
                                                    ? "bg-foreground/5 border border-foreground/5 text-foreground/40 hover:text-foreground hover:border-primary/20" 
                                                    : "bg-primary text-black shadow-primary/20 hover:bg-white hover:scale-[1.02]"
                                            )}
                                        >
                                            {joinedIds.has(match.id) ? (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5" /> RECLUTADO
                                                </>
                                            ) : (
                                                <>
                                                    SOLICITAR INGRESO
                                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
                                    <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">Zona Desierta</h3>
                                    <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.3em] leading-relaxed">No hay partidos por acá. Probá buscando otra cosa o armá uno nuevo.</p>
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
                    <div className="w-full h-full min-h-[600px] relative overflow-hidden rounded-[4rem] border border-foreground/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-surface">
                        <MapSearch matches={filteredMatches} />
                        <div className="absolute top-8 right-8 z-20">
                            <div className="px-5 py-2.5 bg-background/60 backdrop-blur-xl border border-foreground/10 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                <span className="text-[9px] font-black text-foreground uppercase tracking-widest">GPS ACTIVO</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
