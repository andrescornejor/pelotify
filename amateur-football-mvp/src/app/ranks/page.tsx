'use client';

import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronDown, Crown, Shield, TrendingUp, Users, Sparkles, Target, Zap, Activity, Star } from 'lucide-react';
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
  // Simulate some stats based on ELO
  const stats = useMemo(() => {
    const seed = player.id ? player.id.charCodeAt(0) % 10 : 5;
    return [
      0.6 + (seed % 4) * 0.1, // Ritual
      0.7 + (seed % 3) * 0.1, // Técnica
      0.5 + (seed % 5) * 0.1, // Físico
      0.8 + (seed % 2) * 0.1, // Mental
      0.65 + (seed % 6) * 0.05, // Equipo
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
        {/* Radar Background Hex */}
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
        {/* Radar Data */}
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

/* ─── Geometric Background Decorations ─── */
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);

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
    { id: 'ranks' as const, label: 'Dvisiones', icon: Shield },
    { id: 'leaderboard' as const, label: 'Ranking Global', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/30">
      <MouseGlow />
      
      {/* ── Custom Hero Section ── */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-12 xl:px-20">
        <FloatingShapes />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left side: Text */}
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
                className="text-5xl sm:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-gradient"
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
              >
                <div className="px-6 py-4 rounded-3xl bg-foreground/[0.03] border border-foreground/5 flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black italic text-foreground leading-none">8</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mt-1">Niveles de Rango</span>
                </div>
                <div className="px-6 py-4 rounded-3xl bg-foreground/[0.03] border border-foreground/5 flex flex-col items-center lg:items-start border-l-primary/20">
                  <span className="text-3xl font-black italic text-primary leading-none">40K</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 mt-1">XP para Leyenda</span>
                </div>
              </motion.div>
            </div>

            {/* Right side: Animated Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 60, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                {/* Orbital Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-[1px] border-dashed border-primary/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-[15%] border-[1px] border-dotted border-foreground/5 rounded-full"
                />
                {/* Floating Badges */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-[10%] top-[10%] drop-shadow-2xl"
                >
                  <RankBadge rankName="LEYENDA" size="lg" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute right-[10%] bottom-[15%] drop-shadow-2xl"
                >
                  <RankBadge rankName="ELITE" size="lg" />
                </motion.div>
                <motion.div
                  animate={{ x: [0, 15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
                >
                  <RankBadge rankName="DIAMANTE" size="xl" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MODERN TAB SWITCHER (FIXED OVERLAP) ── */}
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

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'ranks' && (
            <motion.div
              key="ranks-view"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: 'circOut' }}
              className="space-y-24"
            >
              {/* Vertical Progress Ladder */}
              <div className="max-w-4xl mx-auto relative">
                {/* Central Connecting Line */}
                <div className="absolute top-0 bottom-0 left-[2.5rem] sm:left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-primary/40 via-foreground/5 to-transparent z-0 hidden sm:block" />
                
                <div className="space-y-12 relative z-10">
                  {RANKS.map((rank, i) => {
                    const detail = RANK_DETAILS[rank.name];
                    const isEven = i % 2 === 0;
                    const isExpanded = expandedRank === i;

                    return (
                      <div key={rank.name} className={cn("relative flex items-center", i % 2 === 0 ? "justify-start" : "justify-end sm:justify-end")}>
                        {/* Mobile view and Desktop Alternating Cards */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, x: i % 2 === 0 ? -30 : 30 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0 }}
                          viewport={{ once: true, margin: '-50px' }}
                          whileHover={{ y: -5 }}
                          className={cn(
                            "w-full sm:w-[45%] rounded-[2.5rem] p-1 bg-gradient-to-br transition-all duration-500 cursor-pointer group",
                            isExpanded ? `from-${rank.name}/20 to-transparent` : "from-foreground/5 to-transparent"
                          )}
                          onClick={() => setExpandedRank(isExpanded ? null : i)}
                          style={{ borderColor: isExpanded ? `${rank.color}40` : 'rgba(var(--foreground-rgb), 0.05)' }}
                        >
                          <div className="rounded-[2.4rem] bg-background/80 backdrop-blur-md p-6 sm:p-8 space-y-4">
                            <div className="flex items-center gap-5">
                              <div className="relative group-hover:scale-110 transition-transform duration-500">
                                <RankBadge rankName={rank.name} size="lg" />
                                {isExpanded && (
                                  <motion.div
                                    layoutId="glow-ring"
                                    className="absolute -inset-2 border-2 border-dashed rounded-full pointer-events-none"
                                    style={{ borderColor: rank.color }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: rank.color }}>
                                  {rank.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Activity className="w-3 h-3 text-foreground/30" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">Min: {rank.minElo.toLocaleString()} XP</span>
                                </div>
                              </div>
                              <ChevronDown className={cn("w-5 h-5 text-foreground/20 transition-transform", isExpanded && "rotate-180")} />
                            </div>

                            <p className="text-xs text-foreground/50 leading-relaxed font-medium italic">
                              "{detail.desc}"
                            </p>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden pt-4"
                                >
                                  <div className="pt-4 border-t border-foreground/5 space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Beneficios desbloqueables:</span>
                                    <div className="grid grid-cols-1 gap-2">
                                      {detail.perks.map((perk, pi) => (
                                        <div key={pi} className="flex items-center gap-2 text-[11px] font-bold text-foreground/60">
                                          <Sparkles className="w-3 h-3 text-primary/70" />
                                          {perk}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>

                        {/* Mid-point Rank Indicator (for desktop ladder) */}
                        <div className="absolute left-[1.5rem] sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-4 border-foreground/5 items-center justify-center hidden sm:flex z-20">
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
            <motion.div
              key="leaderboard-view"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: 'circOut' }}
              className="space-y-20"
            >
              {/* Podium Visualization */}
              {topPlayers.length >= 3 && (
                <div className="flex flex-col items-center">
                  <div className="flex items-end justify-center gap-3 sm:gap-10 pt-16 pb-0 max-w-full overflow-hidden sm:overflow-visible">
                    {/* 2nd Place */}
                    <PodiumSpot player={topPlayers[1]} position={2} rank={getRankByElo(topPlayers[1].elo)} color="#C0C0C0" />
                    {/* 1st Place */}
                    <PodiumSpot player={topPlayers[0]} position={1} rank={getRankByElo(topPlayers[0].elo)} color="#FFD700" isMain />
                    {/* 3rd Place */}
                    <PodiumSpot player={topPlayers[2]} position={3} rank={getRankByElo(topPlayers[2].elo)} color="#CD7F32" />
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent mt-[-1px]" />
                </div>
              )}

              {/* Table List View */}
              <div className="glass-premium rounded-[3rem] border border-foreground/5 overflow-hidden shadow-2xl relative">
                <div className="grid grid-cols-[3rem_3.5rem_1fr_4rem_5rem] sm:grid-cols-[4rem_5rem_1fr_6rem_8rem] items-center px-4 sm:px-10 py-5 bg-foreground/[0.03] border-b border-foreground/5">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 text-center">Pos</span>
                  <span /> {/* Avatar */}
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 px-2 lg:px-4">Jugador</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 text-center">Division</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 text-right">Puntos XP</span>
                </div>
                
                <div className="divide-y divide-foreground/[0.03]">
                  {topPlayers.slice(3).map((player, idx) => (
                    <LeaderboardRow key={player.id} player={player} idx={idx + 3} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center pb-12 opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground">
          ESTATUS • HONOR • LEYENDA
        </p>
      </footer>
    </div>
  );
}

/* ─── Podium Spot Helper ─── */
const PodiumSpot = ({ player, position, rank, color, isMain = false }: { player: any; position: number; rank: any; color: string; isMain?: boolean }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.1, duration: 0.8, type: 'spring' }}
      className={cn("flex flex-col items-center gap-4", isMain ? "order-2" : position === 2 ? "order-1" : "order-3")}
    >
      <Link href={`/profile?id=${player.id}`} className="group relative">
        <motion.div 
          whileHover={{ y: -10, scale: 1.05 }}
          className="relative"
        >
          {isMain && (
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 z-20"
            >
              <Crown className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]" />
            </motion.div>
          )}
          
          <div className={cn(
             "rounded-[2rem] overflow-hidden border-2 transition-all duration-500",
             isMain ? "w-24 h-24 sm:w-32 sm:h-32 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]" : "w-16 h-16 sm:w-24 sm:h-24 shadow-xl"
          )} style={{ borderColor: `${color}40`, background: `${color}10` }}>
            <img 
               src={player.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=transparent`}
               className="w-full h-full object-cover"
               alt={player.name}
            />
          </div>

          <div className="absolute -bottom-3 -right-3 px-3 py-1 bg-background border border-foreground/10 rounded-xl shadow-lg">
             <span className="text-[10px] font-black italic tracking-tighter" style={{ color }}>#{position}</span>
          </div>
        </motion.div>
      </Link>

      <div className="text-center">
        <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-tighter text-foreground truncate max-w-[80px] sm:max-w-[120px]">{player.name}</h4>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <RankBadge rankName={rank.name} size="sm" />
          <span className="text-[9px] font-black tracking-widest text-foreground/40">{player.elo.toLocaleString()} XP</span>
        </div>
      </div>

      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: isMain ? 180 : position === 2 ? 140 : 110 }}
        className="w-20 sm:w-28 rounded-t-3xl relative overflow-hidden flex flex-col items-center pt-6"
        style={{ background: `linear-gradient(180deg, ${color}15 0%, transparent 100%)`, border: `1px solid ${color}10`, borderBottom: 'none' }}
      >
        <RadarGraphic player={player} size={isMain ? 80 : 60} color={color} />
        <span className="text-4xl sm:text-6xl font-black italic opacity-5 absolute bottom-4" style={{ color }}>{position}</span>
      </motion.div>
    </motion.div>
  );
};

/* ─── Leaderboard Row Helper ─── */
const LeaderboardRow = memo(({ player, idx }: { player: any; idx: number }) => {
  const rank = getRankByElo(player.elo);
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-[3rem_3.5rem_1fr_4rem_5rem] sm:grid-cols-[4rem_5rem_1fr_6rem_8rem] items-center px-4 sm:px-10 py-5 hover:bg-foreground/[0.02] transition-colors group cursor-pointer"
    >
      <span className="text-xs font-black italic text-foreground/20 text-center tracking-tighter">#{idx + 1}</span>
      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-foreground/5 border border-foreground/10 group-hover:border-primary/40 transition-all">
        <img src={player.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=transparent`} className="w-full h-full object-cover" />
      </div>
      <div className="px-2 lg:px-4 min-w-0">
        <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-tighter truncate text-foreground group-hover:text-primary transition-colors">{player.name}</h4>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/20">{player.position || 'Versátil'}</span>
      </div>
      <div className="flex justify-center group-hover:scale-110 transition-transform">
        <RankBadge rankName={rank.name} size="sm" />
      </div>
      <div className="text-right flex flex-col">
        <span className="text-sm sm:text-lg font-black italic tracking-tighter text-foreground tabular-nums">{player.elo.toLocaleString()}</span>
        <span className="text-[7px] font-black uppercase tracking-widest text-foreground/20 -mt-1">Puntos XP</span>
      </div>
    </motion.div>
  );
});
LeaderboardRow.displayName = 'LeaderboardRow';
