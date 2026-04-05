'use client';

import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants, useScroll, useTransform } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronDown, Crown, Flame, Star, Hexagon, Zap, Shield, Award, Sparkles, Swords, TrendingUp, Users, Medal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RANKS, getRankByElo } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { RankBadge } from '@/components/RankBadge';
import { supabase } from '@/lib/supabase';

/* ─── Rank Descriptions ─── */
const RANK_DESCRIPTIONS: Record<string, { desc: string; tagline: string; perks: string[] }> = {
  HIERRO: {
    desc: 'El punto de partida de todo jugador.',
    tagline: 'FORJADO EN EL INICIO',
    perks: ['Acceso básico', 'Perfil de jugador', 'Unirse a partidos'],
  },
  BRONCE: {
    desc: 'Has demostrado consistencia en la cancha.',
    tagline: 'CONSISTENCIA COMPROBADA',
    perks: ['Badge de Bronce', 'Estadísticas básicas', 'Crear equipos'],
  },
  PLATA: {
    desc: 'Un jugador respetado que entiende la dinámica.',
    tagline: 'RESPETO GANADO',
    perks: ['Badge de Plata', 'Estadísticas avanzadas', 'Prioridad en partidos'],
  },
  ORO: {
    desc: 'Talento puro. Eres la referencia de tu equipo.',
    tagline: 'REFERENCIA DEL EQUIPO',
    perks: ['Badge de Oro', 'Acceso a torneos', 'Perfil destacado'],
  },
  PLATINO: {
    desc: 'Dominio total. Pocos pueden seguirte el ritmo.',
    tagline: 'DOMINIO ABSOLUTO',
    perks: ['Badge Platino', 'Estadísticas premium', 'Matchmaking prioritario'],
  },
  DIAMANTE: {
    desc: 'La joya de la cancha. Tu nombre suena en cada estadio.',
    tagline: 'BRILLO INCOMPARABLE',
    perks: ['Badge Diamante', 'Scouting activo', 'Highlights automáticos'],
  },
  ELITE: {
    desc: 'Solo para los privilegiados. El 1% de Pelotify.',
    tagline: 'EL UNO POR CIENTO',
    perks: ['Badge Elite', 'Acceso VIP', 'Emblema animado'],
  },
  LEYENDA: {
    desc: 'Inmortal. Tu estatus trasciende los partidos.',
    tagline: 'INMORTALIDAD ALCANZADA',
    perks: ['Badge Legendario', 'Corona dorada', 'Hall of Fame'],
  },
};

/* ─── Animated Particles Background ─── */
const ParticleField = memo(() => {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
        opacity: Math.random() * 0.3 + 0.1,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(var(--primary-rgb), ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 4}px rgba(var(--primary-rgb), ${p.opacity * 0.5})`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});
ParticleField.displayName = 'ParticleField';

/* ─── Rank Tower Card ─── */
const RankTowerCard = memo(
  ({
    rank,
    index,
    isExpanded,
    onToggle,
    totalRanks,
  }: {
    rank: any;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    totalRanks: number;
  }) => {
    const info = RANK_DESCRIPTIONS[rank.name];
    const isTop = index >= totalRanks - 3;
    const progress = ((index + 1) / totalRanks) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.08 }}
        className="relative"
      >
        {/* Connector Line */}
        {index < totalRanks - 1 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-8 sm:h-12 z-0">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 + 0.3, duration: 0.5 }}
              className="w-full h-full origin-top"
              style={{
                background: `linear-gradient(180deg, ${rank.color}40, ${RANKS[index + 1]?.color || rank.color}40)`,
              }}
            />
          </div>
        )}

        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'relative w-full rounded-[2rem] overflow-hidden transition-all duration-500 text-left',
            'border group cursor-pointer',
            isExpanded
              ? 'border-foreground/15 shadow-2xl'
              : 'border-foreground/[0.06] hover:border-foreground/10 hover:shadow-xl'
          )}
          style={{
            background: isExpanded
              ? `linear-gradient(135deg, ${rank.color}10 0%, transparent 60%)`
              : undefined,
          }}
        >
          {/* Ambient glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 30% 50%, ${rank.color}08, transparent 70%)`,
            }}
          />

          {/* Border glow for top ranks */}
          {isTop && (
            <motion.div
              className="absolute inset-0 rounded-[2rem] pointer-events-none"
              animate={{
                boxShadow: [
                  `inset 0 0 30px ${rank.color}05, 0 0 20px ${rank.color}08`,
                  `inset 0 0 50px ${rank.color}10, 0 0 40px ${rank.color}15`,
                  `inset 0 0 30px ${rank.color}05, 0 0 20px ${rank.color}08`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <div className="relative z-10 p-5 sm:p-8 flex items-center gap-4 sm:gap-6">
            {/* Rank Number */}
            <div
              className="shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black italic text-xl sm:text-2xl"
              style={{
                color: rank.color,
                background: `${rank.color}10`,
                border: `1px solid ${rank.color}20`,
              }}
            >
              {index + 1}
            </div>

            {/* Badge */}
            <div className="shrink-0">
              <RankBadge rankName={rank.name} size="lg" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3
                  className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter"
                  style={{ color: rank.color }}
                >
                  {rank.name}
                </h3>
                <span
                  className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full"
                  style={{
                    color: rank.color,
                    background: `${rank.color}15`,
                    border: `1px solid ${rank.color}20`,
                  }}
                >
                  {info.tagline}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/40 mt-1 font-medium italic">
                {info.desc}
              </p>
              {/* XP Progress Bar */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/25">
                  {rank.minElo.toLocaleString()} XP
                </span>
                <div className="flex-1 h-1 bg-foreground/5 rounded-full overflow-hidden max-w-[200px]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: index * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${rank.color}60, ${rank.color})`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Expand arrow */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-foreground/20" />
            </motion.div>
          </div>

          {/* Expanded perks */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="overflow-hidden"
              >
                <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {info.perks.map((perk, i) => (
                      <motion.div
                        key={perk}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl"
                        style={{
                          background: `${rank.color}08`,
                          border: `1px solid ${rank.color}15`,
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: rank.color }} />
                        <span className="text-xs font-bold text-foreground/60">{perk}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    );
  }
);
RankTowerCard.displayName = 'RankTowerCard';

/* ─── Podium Card for Top 3 ─── */
const PodiumCard = memo(
  ({ player, position, onClick }: { player: any; position: number; onClick: (id: string) => void }) => {
    const rank = getRankByElo(player.elo);
    const podiumConfig = [
      { label: '🥇', height: 'h-40 sm:h-52', order: 'order-2', scale: 1.05, color: '#FFD700', glow: 'rgba(255,215,0,0.3)' },
      { label: '🥈', height: 'h-32 sm:h-40', order: 'order-1', scale: 0.95, color: '#C0C0C0', glow: 'rgba(192,192,192,0.25)' },
      { label: '🥉', height: 'h-28 sm:h-36', order: 'order-3', scale: 0.95, color: '#CD7F32', glow: 'rgba(205,127,50,0.25)' },
    ];
    const config = podiumConfig[position];

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: position === 0 ? 0.3 : position === 1 ? 0.1 : 0.5 }}
        className={cn('flex flex-col items-center gap-3', config.order)}
        style={{ transform: `scale(${config.scale})` }}
      >
        {/* Player Card */}
        <motion.button
          onClick={() => onClick(player.id)}
          whileHover={{ y: -8, scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative group cursor-pointer flex flex-col items-center"
        >
          {/* Glow ring for #1 */}
          {position === 0 && (
            <motion.div
              className="absolute -inset-3 rounded-full opacity-40 pointer-events-none"
              animate={{
                boxShadow: [
                  `0 0 20px ${config.glow}, 0 0 60px ${config.glow}`,
                  `0 0 40px ${config.glow}, 0 0 80px ${config.glow}`,
                  `0 0 20px ${config.glow}, 0 0 60px ${config.glow}`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Avatar */}
          <div className="relative">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] overflow-hidden border-2 group-hover:border-primary/50 transition-all duration-500"
              style={{ borderColor: `${config.color}50` }}
            >
              <img
                src={
                  player.avatar_url ||
                  `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=transparent`
                }
                alt={player.name}
                className="w-full h-full object-cover bg-foreground/5"
              />
            </div>
            {/* Crown for #1 */}
            {position === 0 && (
              <motion.div
                animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 left-1/2 -translate-x-1/2"
              >
                <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
              </motion.div>
            )}
            {/* Medal badge */}
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border-2 border-background"
              style={{ background: config.color }}
            >
              {position + 1}
            </div>
          </div>

          {/* Name & XP */}
          <div className="mt-4 text-center">
            <p className="font-black italic uppercase tracking-tighter text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">
              {player.name}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <RankBadge rankName={rank.name} size="sm" />
              <span className="text-xs font-black text-foreground/40 tabular-nums">
                {player.elo.toLocaleString()} XP
              </span>
            </div>
          </div>
        </motion.button>

        {/* Podium base */}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: 'auto' }}
          viewport={{ once: true }}
          transition={{ delay: position === 0 ? 0.6 : position === 1 ? 0.4 : 0.8, duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'w-24 sm:w-32 rounded-t-2xl overflow-hidden relative',
            config.height
          )}
          style={{
            background: `linear-gradient(180deg, ${config.color}20 0%, ${config.color}08 100%)`,
            border: `1px solid ${config.color}15`,
            borderBottom: 'none',
          }}
        >
          {/* Shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: position * 0.5 }}
            className="absolute inset-0 skew-x-[-20deg]"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.color}10, transparent)`,
            }}
          />
          {/* Position Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-5xl sm:text-6xl font-black italic opacity-10"
              style={{ color: config.color }}
            >
              {position + 1}
            </span>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);
PodiumCard.displayName = 'PodiumCard';

/* ─── Leaderboard Row ─── */
const LeaderboardRow = memo(
  ({ player, idx, onClick }: { player: any; idx: number; onClick: (id: string) => void }) => {
    const rank = getRankByElo(player.elo);
    const isTop3 = idx < 3;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ delay: idx * 0.04 }}
        onClick={() => onClick(player.id)}
        className={cn(
          'group flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl cursor-pointer transition-all duration-300',
          'hover:bg-foreground/[0.04] hover:shadow-lg',
          isTop3 && 'bg-foreground/[0.02]'
        )}
      >
        {/* Position */}
        <div
          className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black italic text-sm shrink-0',
            isTop3
              ? 'border shadow-lg'
              : 'text-foreground/20'
          )}
          style={
            isTop3
              ? {
                  color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32',
                  borderColor: idx === 0 ? '#FFD70030' : idx === 1 ? '#C0C0C030' : '#CD7F3230',
                  background: idx === 0 ? '#FFD70010' : idx === 1 ? '#C0C0C010' : '#CD7F3210',
                }
              : undefined
          }
        >
          #{idx + 1}
        </div>

        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={
              player.avatar_url ||
              `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=transparent`
            }
            alt={player.name}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover bg-foreground/5 border border-foreground/10 group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Name & Position */}
        <div className="flex-1 min-w-0">
          <p className="font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors text-sm sm:text-base truncate">
            {player.name}
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 truncate">
            {player.position || 'Sin posición'}
          </p>
        </div>

        {/* Rank Badge */}
        <div className="shrink-0 hidden xs:block group-hover:scale-110 transition-transform duration-500">
          <RankBadge rankName={rank.name} size="sm" />
        </div>

        {/* Matches */}
        <div className="shrink-0 hidden md:flex flex-col items-center">
          <span className="text-xs font-black italic text-foreground/30 tabular-nums">{player.matches || 0}</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-foreground/15">PJ</span>
        </div>

        {/* XP */}
        <div className="shrink-0 flex flex-col items-end">
          <span className="text-base sm:text-lg font-black italic tracking-tighter text-foreground tabular-nums group-hover:scale-105 transition-transform origin-right">
            {player.elo.toLocaleString()}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-foreground/20">XP</span>
        </div>
      </motion.div>
    );
  }
);
LeaderboardRow.displayName = 'LeaderboardRow';

/* ─── Stats Card ─── */
const StatCard = memo(
  ({ icon: Icon, label, value, delay }: { icon: any; label: string; value: string; delay: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5"
    >
      <Icon className="w-5 h-5 text-primary" />
      <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-foreground">{value}</span>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">{label}</span>
    </motion.div>
  )
);
StatCard.displayName = 'StatCard';

/* ════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════ */
export default function RanksPage() {
  const router = useRouter();
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ranks' | 'leaderboard'>('ranks');
  const [expandedRank, setExpandedRank] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const handlePlayerClick = useCallback(
    (id: string) => {
      router.push(`/profile?id=${id}`);
    },
    [router]
  );

  useEffect(() => {
    const fetchLeaderboard = async () => {
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
        console.error('Error loading leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const sortedRanks = useMemo(() => [...RANKS], []);

  const tabs = [
    { id: 'ranks' as const, label: 'Divisiones', icon: Shield },
    { id: 'leaderboard' as const, label: 'Ranking Global', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background pb-32 relative">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 glass-premium border-b border-foreground/5 py-4 sm:py-6 px-3 sm:px-5 lg:px-10 xl:px-16">
        <div className="max-w-full mx-auto flex items-center gap-4">
          <Link href="/">
            <button className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 transition-all active:scale-95">
              <ArrowLeft className="w-5 h-5 text-foreground/70" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
              Escala de Rangos
            </h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              El camino hacia la gloria
            </p>
          </div>
        </div>
      </header>

      {/* ── Cinematic Hero Section ── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative py-16 sm:py-24 px-3 sm:px-5 lg:px-10 xl:px-16 overflow-hidden"
      >
        <ParticleField />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Trophy className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              Sistema de Prestigio
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
          >
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
              <span className="text-foreground">Escalá</span>
              <br />
              <span className="text-foreground">hasta lo</span>
              <br />
              <span className="text-gradient-primary text-glow-primary">Más Alto</span>
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-foreground/40 text-sm sm:text-base font-medium leading-relaxed max-w-lg mx-auto"
          >
            Tu ELO no es solo un número — es tu estatus. Cada victoria, cada gol y cada voto de tus
            compañeros te acerca a convertirte en una <strong className="text-foreground/60">Leyenda</strong>.
          </motion.p>

          {/* Mini Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto pt-4"
          >
            <StatCard icon={Shield} label="Rangos" value="8" delay={0.5} />
            <StatCard icon={Users} label="Jugadores" value={isLoading ? '...' : `${topPlayers.length}+`} delay={0.6} />
            <StatCard icon={TrendingUp} label="XP Máximo" value="40K" delay={0.7} />
          </motion.div>
        </div>
      </motion.section>

      {/* ── Tab Navigation ── */}
      <div className="sticky top-[73px] sm:top-[81px] z-40 px-3 sm:px-5 lg:px-10 xl:px-16 py-3 glass-premium border-b border-foreground/5">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl font-black italic uppercase text-xs tracking-wider transition-all duration-300',
                activeTab === tab.id
                  ? 'bg-primary text-background shadow-lg shadow-primary/20'
                  : 'text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-full mx-auto px-3 sm:px-5 lg:px-10 xl:px-16 py-10 sm:py-16">
        <AnimatePresence mode="wait">
          {activeTab === 'ranks' && (
            <motion.div
              key="ranks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="space-y-16"
            >
              {/* Section Header */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">
                    Torre de Prestigio
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mt-1">
                    8 niveles · Del Hierro a la Leyenda
                  </p>
                </div>
                <div className="h-px flex-1 bg-foreground/5" />
              </div>

              {/* Rank Tower */}
              <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
                {sortedRanks.map((rank, i) => (
                  <RankTowerCard
                    key={rank.name}
                    rank={rank}
                    index={i}
                    totalRanks={sortedRanks.length}
                    isExpanded={expandedRank === i}
                    onToggle={() => setExpandedRank(expandedRank === i ? null : i)}
                  />
                ))}
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center pt-8"
              >
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group"
                >
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-sm font-black italic uppercase tracking-wider text-primary">
                    Ver Ranking Global
                  </span>
                  <ChevronDown className="w-4 h-4 text-primary -rotate-90 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="space-y-16"
            >
              {/* Section Header */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">
                    Radar Global
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mt-1">
                    Top 10 Jugadores · Actualizado en tiempo real
                  </p>
                </div>
                <div className="h-px flex-1 bg-foreground/5" />
              </div>

              {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                    Sincronizando Radar...
                  </span>
                </div>
              ) : (
                <>
                  {/* ── Podium ── */}
                  {topPlayers.length >= 3 && (
                    <div className="relative">
                      {/* Background glow */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-yellow-500/5 blur-[80px]" />
                      </div>

                      <div className="relative z-10 flex items-end justify-center gap-4 sm:gap-8 pt-12 pb-0">
                        {[topPlayers[0], topPlayers[1], topPlayers[2]].map((player, i) => (
                          <PodiumCard
                            key={player.id}
                            player={player}
                            position={i}
                            onClick={handlePlayerClick}
                          />
                        ))}
                      </div>

                      {/* Podium base line */}
                      <div className="h-px w-full max-w-lg mx-auto bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                    </div>
                  )}

                  {/* ── Full Leaderboard ── */}
                  <div className="glass-premium rounded-[2.5rem] border border-foreground/5 overflow-hidden relative">
                    {/* Table Header */}
                    <div className="flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 border-b border-foreground/5 bg-foreground/[0.02]">
                      <span className="w-8 sm:w-10 text-[9px] font-black uppercase tracking-widest text-foreground/25 text-center">
                        #
                      </span>
                      <span className="w-12 sm:w-14" /> {/* Avatar spacer */}
                      <span className="flex-1 text-[9px] font-black uppercase tracking-widest text-foreground/25">
                        Jugador
                      </span>
                      <span className="hidden xs:block w-8 text-[9px] font-black uppercase tracking-widest text-foreground/25 text-center">
                        Rango
                      </span>
                      <span className="hidden md:block w-12 text-[9px] font-black uppercase tracking-widest text-foreground/25 text-center">
                        PJ
                      </span>
                      <span className="w-16 sm:w-20 text-[9px] font-black uppercase tracking-widest text-foreground/25 text-right">
                        Puntos XP
                      </span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-foreground/[0.03]">
                      {topPlayers.map((player, idx) => (
                        <LeaderboardRow
                          key={player.id}
                          player={player}
                          idx={idx}
                          onClick={handlePlayerClick}
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

      {/* ── Footer ── */}
      <div className="text-center pb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">
          Jugá partidos • Subí tu ELO • Construí tu Legado
        </p>
      </div>
    </div>
  );
}
