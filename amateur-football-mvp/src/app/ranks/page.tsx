'use client';

import { motion, Variants } from 'framer-motion';
import { Trophy, ArrowLeft, Star, TrendingUp, Sparkles, Award, Zap } from 'lucide-react';
import Link from 'next/link';
import { RANKS } from '@/lib/ranks';
import { cn } from '@/lib/utils';

export default function RanksPage() {
    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: i * 0.1
            }
        })
    };

    const getRankIcon = (name: string) => {
        switch (name) {
            case 'HIERRO': return TrendingUp;
            case 'LEYENDA': return Star;
            case 'ELITE': return Award;
            case 'DIAMANTE': return Sparkles;
            case 'ORO': return Trophy;
            default: return Zap;
        }
    };

    const getRankDesc = (name: string) => {
        switch (name) {
            case 'HIERRO': return 'El punto de partida de todo jugador.';
            case 'BRONCE': return 'Ya no sos horrible. Has demostrado consistencia en la cancha.';
            case 'PLATA': return 'Un jugador respetado que entiende la dinámica del juego.';
            case 'ORO': return 'Talento puro. Eres la referencia de tu equipo.';
            case 'PLATINO': return 'Dominio total. Pocos pueden seguirte el ritmo cuando aceleras.';
            case 'DIAMANTE': return 'La joya de la cancha. Tu nombre ya suena en cada estadio.';
            case 'ELITE': return 'Solo para los privilegiados. El 1% de la comunidad de Pelotify.';
            case 'LEYENDA': return 'Inmortal. Tu estatus trasciende los partidos. Eres historia pura.';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-premium border-b border-foreground/5 py-6 px-4">
                <div className="max-w-screen-xl mx-auto flex items-center gap-4">
                    <Link href="/">
                        <button className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 transition-all">
                            <ArrowLeft className="w-5 h-5 text-foreground/70" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter text-foreground">Escala de Rangos</h1>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">El camino hacia la gloria</p>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-xl mx-auto px-4 py-12 space-y-16">
                {/* Intro Section */}
                <section className="text-center space-y-6 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sistema de Prestigio</span>
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
                        Escalá hasta lo <span className="text-primary italic">Más Alto</span>
                    </h2>
                    <p className="text-foreground/50 text-sm font-medium leading-relaxed">
                        En Pelotify, tu ELO no es solo un número, es tu estatus. Cada victoria, cada gol y cada voto de tus compañeros te acerca a convertirte en una Leyenda.
                    </p>
                </section>

                {/* Ranks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {RANKS.map((rank, i) => {
                        const Icon = getRankIcon(rank.name);
                        const isHighRank = i >= 4; // Platino and above

                        return (
                            <motion.div
                                key={rank.name}
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={fadeUp}
                                whileHover={{ y: -10 }}
                                className="group relative overflow-hidden rounded-[2.5rem] p-8 glass-premium border border-foreground/5 flex flex-col items-center text-center gap-6"
                            >
                                {/* Background Glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                                    style={{ background: `radial-gradient(circle at 50% 50%, ${rank.color} 0%, transparent 70%)` }}
                                />

                                {/* Icon Circle */}
                                <div
                                    className={cn(
                                        "w-20 h-20 rounded-[2rem] flex items-center justify-center relative",
                                        "transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                                    )}
                                    style={{
                                        background: `${rank.color}15`,
                                        border: `2px solid ${rank.color}30`,
                                        boxShadow: `0 0 30px ${rank.color}15`
                                    }}
                                >
                                    <Icon className="w-10 h-10" style={{ color: rank.color }} />
                                    {isHighRank && (
                                        <div className="absolute -top-1 -right-1">
                                            <Sparkles className="w-5 h-5 animate-pulse" style={{ color: rank.color }} />
                                        </div>
                                    )}
                                </div>

                                {/* Rank Name & ELO */}
                                <div className="space-y-2 relative z-10">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: rank.color }}>
                                        {rank.name}
                                    </h3>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Min. ELO</span>
                                        <span className="text-xs font-black text-foreground">{rank.minElo.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-[11px] font-black uppercase tracking-widest text-foreground/50 leading-relaxed italic relative z-10">
                                    "{getRankDesc(rank.name)}"
                                </p>

                                {/* Footer Progress Simulation */}
                                <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden mt-2 relative z-10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.5, delay: i * 0.15 }}
                                        className="h-full rounded-full opacity-60"
                                        style={{ background: `linear-gradient(90deg, transparent, ${rank.color}, transparent)` }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Tip */}
                <div className="text-center pt-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/25">
                        Jugá partidos • Subí tu ELO • Construí tu Legado
                    </p>
                </div>
            </main>
        </div>
    );
}
