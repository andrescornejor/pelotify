'use client';

import { calculateMatchPoints } from '@/lib/elo';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface PlayerToRate {
    id: number;
    name: string;
    avatar: string;
}

const PLAYERS_TO_RATE: PlayerToRate[] = [
    { id: 1, name: 'Martín Pérez', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Martin' },
    { id: 2, name: 'Lucas Gómez', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Lucas' },
];

export function RatingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [ratings, setRatings] = useState<Record<number, number>>({});
    const [hoveredStar, setHoveredStar] = useState<{ id: number; star: number } | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [eloResult, setEloResult] = useState<{ newElo: number, change: number } | null>(null);

    const handleRate = (playerId: number, rating: number) => {
        setRatings(prev => ({ ...prev, [playerId]: rating }));
    };

    const handleSubmit = () => {
        const { gainedPoints, newElo } = calculateMatchPoints(0, true, 2, false, true);
        setEloResult({ newElo, change: gainedPoints });
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setEloResult(null);
            onClose();
        }, 4000);
    };

    const allRated = PLAYERS_TO_RATE.every(p => ratings[p.id]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-6 sm:p-6 pointer-events-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                        className="relative w-full max-w-sm overflow-hidden flex flex-col"
                        style={{
                            maxHeight: '88vh',
                            background: 'linear-gradient(145deg, rgba(var(--surface-elevated-rgb, 15,15,26),1), rgba(var(--surface-rgb, 8,8,15),1))',
                            backgroundColor: 'var(--surface-elevated)',
                            border: '1px solid rgba(var(--foreground-rgb),0.1)',
                            borderRadius: '2rem',
                            boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
                        }}
                    >
                        {/* Top shimmer */}
                        <div className="absolute top-0 left-8 right-8 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--foreground-rgb),0.15), transparent)' }} />

                        {/* Green glow top-right */}
                        <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />

                        {/* Close btn */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'rgba(var(--foreground-rgb),0.06)', border: '1px solid rgba(var(--foreground-rgb),0.08)' }}
                        >
                            <X className="w-4 h-4 text-foreground/50" />
                        </button>

                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                    className="flex flex-col items-center justify-center py-14 px-8 gap-5 text-center"
                                >
                                    {/* Success icon */}
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', delay: 0.1, stiffness: 300, damping: 18 }}
                                        className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                                            border: '1px solid rgba(16,185,129,0.25)',
                                            boxShadow: '0 0 40px rgba(16,185,129,0.2)',
                                        }}
                                    >
                                        <CheckCircle className="w-10 h-10 text-primary" />
                                    </motion.div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                                            ¡Valoraciones Enviadas!
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                            ELO actualizado
                                        </p>
                                    </div>

                                    {eloResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="w-full space-y-3"
                                        >
                                            <div className="rounded-[1.25rem] p-5 text-center"
                                                style={{ background: 'rgba(var(--foreground-rgb),0.04)', border: '1px solid rgba(var(--foreground-rgb),0.08)' }}>
                                                <div className="flex items-center justify-center gap-3 mb-2">
                                                    <TrendingUp className="w-5 h-5 text-primary" />
                                                    <span className="text-4xl font-black italic tracking-tighter text-foreground">
                                                        {eloResult.newElo}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/35">Nuevo ELO</p>
                                            </div>
                                            <div className={`rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 ${eloResult.change > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                                <span className={`text-sm font-black ${eloResult.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {eloResult.change > 0 ? '+' : ''}{eloResult.change} puntos
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-wider text-foreground/40">
                                                    Resultado + Rendimiento
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="rating"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col min-h-0"
                                >
                                    {/* Header */}
                                    <div className="px-6 pt-6 pb-4 pr-14 shrink-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                <Sparkles className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">
                                                    Fin del Partido ⚽
                                                </h2>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/35 mt-0.5">
                                                    Valorá a tus compañeros
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-foreground/45 leading-relaxed">
                                            Las valoraciones ajustan el ELO de tus compañeros. ¡Sé honesto!
                                        </p>
                                    </div>

                                    {/* Players list */}
                                    <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-4 flex flex-col gap-3 min-h-0">
                                        {PLAYERS_TO_RATE.map((player) => {
                                            const currentRating = ratings[player.id] || 0;
                                            return (
                                                <motion.div
                                                    key={player.id}
                                                    layout
                                                    className="rounded-[1.25rem] p-4 space-y-3"
                                                    style={{
                                                        background: currentRating > 0
                                                            ? 'rgba(16,185,129,0.04)'
                                                            : 'rgba(var(--foreground-rgb),0.03)',
                                                        border: currentRating > 0
                                                            ? '1px solid rgba(16,185,129,0.12)'
                                                            : '1px solid rgba(var(--foreground-rgb),0.07)',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                                                            style={{ border: '1px solid rgba(var(--foreground-rgb),0.1)' }}>
                                                            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-foreground text-sm tracking-tight truncate">{player.name}</p>
                                                            {currentRating > 0 && (
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary">
                                                                    {'★'.repeat(currentRating)} {currentRating === 5 ? '¡Crack!' : currentRating >= 4 ? 'Muy bueno' : currentRating >= 3 ? 'Regular' : 'Bajo nivel'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {currentRating > 0 && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="text-xl font-black italic text-primary"
                                                            >
                                                                {currentRating}
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {/* Stars */}
                                                    <div className="flex justify-between items-center px-1">
                                                        {[1, 2, 3, 4, 5].map((star) => {
                                                            const isHovered = hoveredStar?.id === player.id && hoveredStar.star >= star;
                                                            const isActive = currentRating >= star;
                                                            return (
                                                                <motion.button
                                                                    key={star}
                                                                    whileTap={{ scale: 0.8 }}
                                                                    animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                                                                    onClick={() => handleRate(player.id, star)}
                                                                    onMouseEnter={() => setHoveredStar({ id: player.id, star })}
                                                                    onMouseLeave={() => setHoveredStar(null)}
                                                                    className="p-1 transition-transform"
                                                                >
                                                                    <Star
                                                                        className="w-7 h-7 transition-all duration-200"
                                                                        style={{
                                                                            color: (isActive || isHovered) ? '#f59e0b' : 'rgba(var(--foreground-rgb),0.12)',
                                                                            fill: (isActive || isHovered) ? '#f59e0b' : 'transparent',
                                                                            filter: isActive ? 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' : 'none',
                                                                            transform: isHovered && !isActive ? 'scale(1.1)' : 'scale(1)',
                                                                        }}
                                                                    />
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 pb-6 pt-3 shrink-0"
                                        style={{ borderTop: '1px solid rgba(var(--foreground-rgb),0.06)' }}>
                                        <motion.button
                                            onClick={handleSubmit}
                                            disabled={!allRated}
                                            whileHover={allRated ? { scale: 1.02, y: -1 } : {}}
                                            whileTap={allRated ? { scale: 0.97 } : {}}
                                            className="w-full py-3.5 font-black rounded-2xl text-[11px] uppercase tracking-[0.25em] transition-all"
                                            style={allRated ? {
                                                background: 'linear-gradient(135deg, #34d399, #10b981, #059669)',
                                                color: 'white',
                                                boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                                            } : {
                                                background: 'rgba(var(--foreground-rgb),0.04)',
                                                border: '1px solid rgba(var(--foreground-rgb),0.08)',
                                                color: 'rgba(var(--foreground-rgb),0.2)',
                                                cursor: 'not-allowed',
                                            }}
                                        >
                                            {allRated ? '✓ Enviar Valoraciones' : `Faltan valoraciones (${PLAYERS_TO_RATE.length - Object.keys(ratings).length})`}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
