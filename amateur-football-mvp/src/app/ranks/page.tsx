'use client';

import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronDown, Crown, Shield, TrendingUp, Users, Sparkles, Target, Zap, Activity, Star, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RANKS, getRankByElo } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { RankBadge } from '@/components/RankBadge';
import { supabase } from '@/lib/supabase';

/* ─── Rank Descriptions ─── */
const RANK_DETAILS: Record<string, { desc: string; tagline: string; perks: string[]; color: string }> = {
  HIERRO: {
    desc: 'Donde nacen las promesas. El barro y la pasión se juntan aquí.',
    tagline: 'EL COMIENZO',
    perks: ['Entrada al ecosistema', 'Perfil base', 'Historial básico'],
    color: '#64748b',
  },
  BRONCE: {
    desc: 'Has dejado de ser un principiante. La consistencia es tu mejor aliada.',
    tagline: 'JUGADOR REGULAR',
    perks: ['Estadísticas de gol', 'Unirse a equipos', 'Badge Bronce'],
    color: '#92400e',
  },
  PLATA: {
    desc: 'Tu técnica es respetada. Ya no te miran como a uno más.',
    tagline: 'POTENCIAL PURO',
    perks: ['Prioridad en búsqueda', 'MVP Tracker', 'Badge Plata'],
    color: '#94a3b8',
  },
  ORO: {
    desc: 'La élite de los barrios. El jugador que todos quieren en su equipo.',
    tagline: 'CRACKS DEL BARRIO',
    perks: ['Acceso a Torneos', 'Perfil Verificado', 'Badge Oro'],
    color: '#ca8a04',
  },
  PLATINO: {
    desc: 'Dominio absoluto. El balón baila a tu ritmo en cada partido.',
    tagline: 'MAESTRO DEL BALÓN',
    perks: ['Matchmaking VIP', 'Stats Avanzados', 'Badge Platino'],
    color: '#0ea5e9',
  },
  DIAMANTE: {
    desc: 'La joya de la corona. Un talento que solo se ve una vez por torneo.',
    tagline: 'TALENTO PURO',
    perks: ['Scouting directo', 'Highlights en 4K', 'Badge Diamante'],
    color: '#22d3ee',
  },
  ELITE: {
    desc: 'Solo el 1%. Tu nombre ya es leyenda antes de empezar el juego.',
    tagline: 'EL TOP ABSOLUTO',
    perks: ['Avatar Animado', 'Invitaciones VIP', 'Badge Elite'],
    color: '#10b981',
  },
  LEYENDA: {
    desc: 'Inmortalidad. Has trascendido los límites de Pelotify.',
    tagline: 'DIOS DE LA CANCHA',
    perks: ['Salón de la Fama', 'Corona de Leyenda', 'Badge Legendario'],
    color: '#f59e0b',
  },
};

/* ─── Interactive Mouse Glow ─── */
const MouseGlow = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: useTransform(
          [springX, springY],
          ([x, y]) => `radial-gradient(600px at ${x}px ${y}px, rgba(var(--primary-rgb), 0.04), transparent 80%)`
        ),
      }}
    />
  );
};

/* ─── Skill Radar Graphic ─── */
const RadarGraphic = ({ player, size = 120, color = '#2cfc7d' }: { player: any; size?: number; color?: string }) => {
  const stats = useMemo(() => {
    const seed = player.id ? player.id.charCodeAt(0) % 10 : 5;
    return [
      0.6 + (seed % 4) * 0.1, 
      0.7 + (seed % 3) * 0.1, 
      0.5 + (seed % 5) * 0.1, 
      0.8 + (seed % 2) * 0.1, 
      0.65 + (seed % 6) * 0.05,
    ];
  }, [player.id]);

  const points = stats.map((s, i) => {
    const angle = (i * 2 * Math.PI) / stats.length - Math.PI / 2;
    const r = (s * size) / 2.5;
    return `${size / 2 + r * Math.cos(angle)},${size / 2 + r * Math.sin(angle)}`;
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible opacity-40">
        <polygon
          points={stats.map((_, i) => {
            const angle = (i * 2 * Math.PI) / stats.length - Math.PI / 2;
            const r = size / 2.5;
            return `${size / 2 + r * Math.cos(angle)},${size / 2 + r * Math.sin(angle)}`;
          }).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-foreground/10"
        />
        <motion.polygon
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          points={points.join(' ')}
          fill={color}
          fillOpacity="0.2"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

/* ─── Floating Shapes ─── */
const FloatingShapes = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
            opacity: 0.05,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, 45, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        >
          {i % 2 === 0 ? <Shield className="w-24 h-24" /> : <Target className="w-32 h-32" />}
        </motion.div>
      ))}
    </div>
  );
});
FloatingShapes.displayName = 'FloatingShapes';

/* ─── Main Component ─── */
export default function RanksPage() {
  const router = useRouter();
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ranks' | 'leaderboard'>('ranks');
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, elo, matches, position')
        .order('elo', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setTopPlayers(data || []);
    } catch (err) {
      console.error('Error leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const tabs = [
    { id: 'ranks' as const, label: 'Divisiones', icon: Shield },
    { id: 'leaderboard' as const, label: 'Ranking Global', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/30">
      <MouseGlow />
      
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-12 xl:px-20">
        <FloatingShapes />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-lg shadow-primary/5"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary">
                  Sistema de Prestigio V2.0
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 80, delay: 0.1 }}
                className="text-5.5xl sm:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-gradient"
              >
                Dominá la <br />
                <span className="text-gradient-primary text-glow-primary">Cancha</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-foreground/50 text-base sm:text-lg font-medium leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Tu ELO es tu reputación. Sube de nivel ganando partidos, marcando goles y siendo el mejor compañero.
                Convertite en <span className="text-foreground font-black italic">Leyenda</span>.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 60, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border border-dashed border-primary/20 rounded-full" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute inset-[15%] border border-dotted border-foreground/5 rounded-full" />
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-[10%] top-[10%] drop-shadow-2xl">
                  <RankBadge rankName="LEYENDA" size="lg" />
                </motion.div>
                <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-[10%] bottom-[15%] drop-shadow-2xl">
                  <RankBadge rankName="ELITE" size="lg" />
                </motion.div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
                  <RankBadge rankName="DIAMANTE" size="xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mb-20 relative z-30">
        <div className="flex justify-center">
          <div className="p-1.5 rounded-[2rem] bg-foreground/[0.04] backdrop-blur-xl border border-foreground/5 inline-flex gap-2 relative shadow-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-3 px-8 py-3.5 rounded-[1.6rem] font-black italic uppercase text-xs tracking-wider transition-all duration-500 z-10',
                  activeTab === tab.id ? 'text-background' : 'text-foreground/40 hover:text-foreground/70'
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary rounded-[1.6rem] shadow-[0_8px_25px_rgba(var(--primary-rgb),0.3)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <tab.icon className={cn('w-4 h-4 relative z-10', activeTab === tab.id ? 'stroke-[3]' : 'stroke-2')} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'ranks' && (
            <motion.div key="ranks-view" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="space-y-24">
              <div className="max-w-4xl mx-auto relative px-4 sm:px-0">
                <div className="absolute top-0 bottom-0 left-[2rem] sm:left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-primary/40 via-foreground/5 to-transparent z-0 hidden xs:block" />
                
                <div className="space-y-12 relative z-10">
                  {RANKS.map((rank, i) => {
                    const detail = RANK_DETAILS[rank.name];
                    const isExpanded = expandedRank === i;
                    return (
                      <div key={rank.name} className={cn("relative flex items-center", i % 2 === 0 ? "justify-start" : "justify-end sm:justify-end")}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, x: i % 2 === 0 ? -30 : 30 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0 }}
                          viewport={{ once: true, margin: '-50px' }}
                          whileHover={{ y: -5 }}
                          className={cn("w-full sm:w-[45%] rounded-[2.5rem] p-0.5 bg-gradient-to-br transition-all duration-500 cursor-pointer overflow-hidden")}
                          onClick={() => setExpandedRank(isExpanded ? null : i)}
                          style={{ background: isExpanded ? `${rank.color}40` : 'rgba(var(--foreground-rgb), 0.05)' }}
                        >
                          <div className="rounded-[2.4rem] bg-background/90 backdrop-blur-md p-6 sm:p-8 space-y-4">
                            <div className="flex items-center gap-5">
                              <RankBadge rankName={rank.name} size="lg" />
                              <div className="flex-1">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: rank.color }}>{rank.name}</h3>
                                <span className="text-[9px] font-black uppercase text-foreground/30">Min: {rank.minElo.toLocaleString()} XP</span>
                              </div>
                              <ChevronDown className={cn("w-5 h-5 text-foreground/20 transition-transform", isExpanded && "rotate-180")} />
                            </div>
                            <p className="text-xs text-foreground/50 italic">"{detail.desc}"</p>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="pt-4 border-t border-foreground/5 space-y-3">
                                {detail.perks.map((p, pi) => (
                                  <div key={pi} className="flex items-center gap-2 text-[11px] font-bold text-foreground/60"><Sparkles className="w-3 h-3 text-primary" /> {p}</div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                        <div className="absolute left-[1.5rem] sm:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-background border-2 border-foreground/5 items-center justify-center hidden sm:flex z-20">
                          <span className="text-xs font-black italic text-foreground/20">{i + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard-view" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="space-y-20">
              
              {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Sincronizando Radar...</span>
                </div>
              ) : topPlayers.length === 0 ? (
                <div className="p-20 text-center space-y-4 glass-premium rounded-[3rem]">
                  <Target className="w-12 h-12 text-foreground/10 mx-auto" />
                  <p className="text-sm font-black italic text-foreground/30 uppercase tracking-widest">No hay jugadores registrados todavía</p>
                </div>
              ) : (
                <>
                  {/* Podium: Only if 3 or more players */}
                  {topPlayers.length >= 3 && (
                    <div className="flex flex-col items-center">
                      <div className="flex items-end justify-center gap-3 sm:gap-10 pt-16 pb-0 overflow-x-auto w-full no-scrollbar">
                        <PodiumSpot player={topPlayers[1]} position={2} rank={getRankByElo(topPlayers[1].elo)} color="#C0C0C0" />
                        <PodiumSpot player={topPlayers[0]} position={1} rank={getRankByElo(topPlayers[0].elo)} color="#FFD700" isMain />
                        <PodiumSpot player={topPlayers[2]} position={3} rank={getRankByElo(topPlayers[2].elo)} color="#CD7F32" />
                      </div>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent mt-[-1px]" />
                    </div>
                  )}

                  {/* List: Show ALL players if less than 3, or show from #4 if podium is visible */}
                  <div className="glass-premium rounded-[3rem] border border-foreground/5 overflow-hidden shadow-2xl relative">
                    <div className="grid grid-cols-[3rem_3.5rem_1fr_4rem_5rem] sm:grid-cols-[4rem_5rem_1fr_6rem_8rem] items-center px-4 sm:px-10 py-5 bg-foreground/[0.03] border-b border-foreground/5">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 text-center">Pos</span>
                      <span /> 
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 px-2 lg:px-4">Jugador</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 text-center">Rango</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 text-right">Puntos XP</span>
                    </div>
                    
                    <div className="divide-y divide-foreground/[0.03]">
                      {(topPlayers.length >= 3 ? topPlayers.slice(3) : topPlayers).map((player, idx) => (
                        <LeaderboardRow 
                          key={player.id} 
                          player={player} 
                          idx={topPlayers.length >= 3 ? idx + 3 : idx} 
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center pb-12 opacity-30 mt-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground">ESTATUS • HONOR • LEYENDA</p>
      </footer>
    </div>
  );
}

/* ─── Helpers ─── */
const PodiumSpot = ({ player, position, rank, color, isMain = false }: any) => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className={cn("flex flex-col items-center gap-4", isMain ? "order-2" : position === 2 ? "order-1" : "order-3")}>
    <Link href={`/profile?id=${player.id}`} className="relative group">
      <div className={cn("rounded-[2rem] overflow-hidden border-2 transition-all duration-500", isMain ? "w-24 h-24 sm:w-32 sm:h-32 shadow-2xl" : "w-16 h-16 sm:w-24 sm:h-24")} style={{ borderColor: `${color}40`, background: `${color}10` }}>
        <img src={player.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}`} className="w-full h-full object-cover" />
      </div>
      <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-background border border-foreground/10 rounded-lg shadow-lg">
        <span className="text-[10px] font-black italic" style={{ color }}>#{position}</span>
      </div>
    </Link>
    <div className="text-center">
      <h4 className="text-xs font-black italic uppercase text-foreground truncate max-w-[80px] sm:max-w-[120px]">{player.name}</h4>
      <span className="text-[8px] font-black text-foreground/40">{player.elo.toLocaleString()} XP</span>
    </div>
    <motion.div initial={{ height: 0 }} animate={{ height: isMain ? 160 : position === 2 ? 120 : 100 }} className="w-16 sm:w-24 rounded-t-3xl relative overflow-hidden flex flex-col items-center pt-4" style={{ background: `linear-gradient(180deg, ${color}15 0%, transparent 100%)`, border: `1px solid ${color}10` }}>
      <RadarGraphic player={player} size={isMain ? 70 : 50} color={color} />
    </motion.div>
  </motion.div>
);

const LeaderboardRow = memo(({ player, idx }: any) => {
  const rank = getRankByElo(player.elo);
  return (
    <motion.div className="grid grid-cols-[3rem_3.5rem_1fr_4rem_5rem] sm:grid-cols-[4rem_5rem_1fr_6rem_8rem] items-center px-4 sm:px-10 py-4 hover:bg-foreground/[0.02] transition-colors group cursor-pointer">
      <span className="text-xs font-black italic text-foreground/20 text-center">#{idx + 1}</span>
      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-foreground/5 border border-foreground/10 group-hover:border-primary/40 transition-all">
        <img src={player.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}`} className="w-full h-full object-cover" />
      </div>
      <div className="px-2 lg:px-4 min-w-0">
        <h4 className="text-xs sm:text-sm font-black italic uppercase text-foreground truncate group-hover:text-primary transition-colors">{player.name}</h4>
        <span className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">{player.position || 'Versátil'}</span>
      </div>
      <div className="flex justify-center group-hover:scale-110 transition-transform">
        <RankBadge rankName={rank.name} size="sm" />
      </div>
      <div className="text-right">
        <span className="text-sm sm:text-lg font-black italic text-foreground">{player.elo.toLocaleString()}</span>
      </div>
    </motion.div>
  );
});
LeaderboardRow.displayName = 'LeaderboardRow';
