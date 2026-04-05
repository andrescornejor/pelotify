'use client';

import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronDown, Crown, Shield, Zap, Award, Star, Flame, Hexagon, Sparkles, TrendingUp, Medal, Target, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RANKS, getRankByElo } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { RankBadge } from '@/components/RankBadge';
import { supabase } from '@/lib/supabase';

const RANK_DESCRIPTIONS: Record<string, { desc: string; perk: string }> = {
  HIERRO: { desc: 'El punto de partida de todo guerrero del fútbol.', perk: 'Acceso básico a partidos' },
  BRONCE: { desc: 'Ya no sos horrible. Consistencia en la cancha.', perk: 'Invitar a partidos' },
  PLATA: { desc: 'Un jugador respetado que entiende la dinámica.', perk: 'Crear equipos' },
  ORO: { desc: 'Talento puro. Sos la referencia de tu equipo.', perk: 'Descuentos en sedes' },
  PLATINO: { desc: 'Dominio total. Pocos pueden seguirte el ritmo.', perk: 'Prioridad de reserva' },
  DIAMANTE: { desc: 'La joya de la cancha. Tu nombre ya suena.', perk: 'Insignia verificada' },
  ELITE: { desc: 'El 1% de la comunidad Pelotify.', perk: 'Acceso a torneos VIP' },
  LEYENDA: { desc: 'Inmortal. Tu estatus trasciende los partidos.', perk: 'Creación de ligas' },
};

const RANK_GRADIENT_MAP: Record<string, string> = {
  HIERRO: 'from-slate-600/20 via-slate-500/5 to-transparent',
  BRONCE: 'from-amber-800/20 via-amber-700/5 to-transparent',
  PLATA: 'from-slate-400/20 via-slate-300/5 to-transparent',
  ORO: 'from-yellow-500/20 via-yellow-400/5 to-transparent',
  PLATINO: 'from-cyan-500/20 via-sky-400/5 to-transparent',
  DIAMANTE: 'from-sky-400/20 via-cyan-300/5 to-transparent',
  ELITE: 'from-emerald-500/20 via-green-400/5 to-transparent',
  LEYENDA: 'from-amber-400/20 via-orange-300/5 to-transparent',
};

/* ─── Rank Tier Card ─── */
const RankTierCard = memo(
  ({ rank, i, isExpanded, onToggle }: { rank: any; i: number; isExpanded: boolean; onToggle: () => void }) => {
    const info = RANK_DESCRIPTIONS[rank.name] || { desc: '', perk: '' };
    const gradient = RANK_GRADIENT_MAP[rank.name] || '';
    const isLegendary = rank.name === 'LEYENDA' || rank.name === 'ELITE' || rank.name === 'DIAMANTE';

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 25 }}
        onClick={onToggle}
        className={cn(
          "group relative overflow-hidden rounded-[2rem] border transition-all duration-500 cursor-pointer",
          isExpanded 
            ? "bg-foreground/[0.06] border-foreground/10 shadow-2xl" 
            : "bg-foreground/[0.02] border-foreground/[0.06] hover:border-foreground/10 hover:bg-foreground/[0.04]",
          isLegendary && !isExpanded && "hover:shadow-lg"
        )}
        style={{
          boxShadow: isExpanded ? `0 20px 60px ${rank.color}15, 0 0 0 1px ${rank.color}20` : undefined,
        }}
      >
        {/* Background gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none", gradient)} />
        
        {/* Shimmer for legendary tiers */}
        {isLegendary && (
          <motion.div
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            className="absolute inset-0 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none"
          />
        )}

        {/* Main Content */}
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-center gap-5">
            {/* Rank Badge */}
            <div className="relative shrink-0">
              <RankBadge rankName={rank.name} size="md" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3
                  className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter leading-none"
                  style={{ color: rank.color }}
                >
                  {rank.name}
                </h3>
                {isLegendary && (
                  <div className="px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest" style={{ color: rank.color, backgroundColor: `${rank.color}15`, border: `1px solid ${rank.color}30` }}>
                    PREMIUM
                  </div>
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">
                Mínimo <span className="text-foreground">{rank.minElo.toLocaleString()} XP</span>
              </p>
            </div>

            {/* Expand indicator */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center shrink-0"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-6 mt-6 border-t border-foreground/[0.06] space-y-5">
                  <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">
                    "{info.desc}"
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: rank.color }} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/70">{info.perk}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/70">
                        {i < RANKS.length - 1 
                          ? `Siguiente: ${RANKS[i + 1]?.minElo?.toLocaleString()} XP` 
                          : 'Rango Máximo'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Progress-like visual */}
                  <div className="w-full h-1.5 bg-foreground/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${rank.color}80, ${rank.color}20)`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }
);

RankTierCard.displayName = 'RankTierCard';

/* ─── Leaderboard Podium Card ─── */
const PodiumCard = memo(({ player, position }: { player: any; position: number }) => {
  const rank = getRankByElo(player.elo);
  const configs = [
    { size: 'h-44 sm:h-52', order: 'order-2', crown: true, gradient: 'from-yellow-400/20 via-yellow-300/5', border: 'border-yellow-400/30', medal: '🥇', color: '#fbbf24' },
    { size: 'h-36 sm:h-44', order: 'order-1', crown: false, gradient: 'from-slate-300/20 via-slate-200/5', border: 'border-slate-300/30', medal: '🥈', color: '#94a3b8' },
    { size: 'h-32 sm:h-40', order: 'order-3', crown: false, gradient: 'from-amber-600/20 via-amber-500/5', border: 'border-amber-600/30', medal: '🥉', color: '#d97706' },
  ];
  const config = configs[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + position * 0.15, type: 'spring', stiffness: 200, damping: 25 }}
      className={cn("flex-1 min-w-[140px]", config.order)}
    >
      <div className={cn(
        "relative flex flex-col items-center justify-end rounded-[2rem] border overflow-hidden p-5 sm:p-6 group hover:scale-[1.03] transition-all duration-500",
        config.size, config.border,
        "bg-gradient-to-b", config.gradient, "to-foreground/[0.02]"
      )}
      style={{
        boxShadow: `0 20px 40px ${config.color}10`,
      }}
      >
        {/* Crown for #1 */}
        {config.crown && (
          <motion.div 
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-3 z-20"
          >
            <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
          </motion.div>
        )}

        {/* Avatar */}
        <div className="relative mb-3">
          <img
            src={player.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=transparent`}
            alt={player.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-foreground/5 border-2 group-hover:scale-110 transition-transform duration-500"
            style={{ borderColor: config.color }}
          />
          <div className="absolute -bottom-1 -right-1 text-lg leading-none">{config.medal}</div>
        </div>

        {/* Name */}
        <p className="text-sm sm:text-base font-black italic uppercase tracking-tighter text-center leading-tight truncate w-full">
          {player.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <RankBadge rankName={rank.name} size="sm" className="scale-75" />
          <span className="text-sm font-black italic tracking-tighter tabular-nums" style={{ color: config.color }}>
            {player.elo?.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

PodiumCard.displayName = 'PodiumCard';

/* ─── Leaderboard Row ─── */
const LeaderboardRow = memo(
  ({ player, idx, onClick }: { player: any; idx: number; onClick: (id: string) => void }) => {
    const rank = getRankByElo(player.elo);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.04 }}
        className="group flex items-center gap-4 px-5 sm:px-8 py-4 sm:py-5 hover:bg-foreground/[0.03] transition-all cursor-pointer border-b border-foreground/[0.03] last:border-0"
        onClick={() => onClick(player.id)}
      >
        {/* Position */}
        <span className="w-8 text-center text-sm font-black italic text-foreground/25">
          #{idx + 4}
        </span>

        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={player.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=transparent`}
            alt={player.name}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover bg-foreground/5 border border-foreground/10 group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="block font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors text-sm sm:text-base truncate leading-tight">
            {player.name}
          </span>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-foreground/30">
            {player.position || 'Sin posición'}
          </span>
        </div>

        {/* Rank */}
        <div className="hidden sm:flex justify-center group-hover:scale-110 transition-transform duration-500">
          <RankBadge rankName={rank.name} size="sm" />
        </div>

        {/* Matches */}
        <div className="hidden md:block text-center w-16">
          <span className="text-sm font-black italic text-foreground/30">{player.matches || 0}</span>
          <p className="text-[7px] font-black uppercase tracking-widest text-foreground/15">Partidos</p>
        </div>

        {/* XP */}
        <div className="text-right">
          <span className="text-base sm:text-lg font-black italic tracking-tighter text-foreground tabular-nums group-hover:scale-105 transition-transform origin-right inline-block">
            {player.elo?.toLocaleString()}
          </span>
          <div className="w-14 sm:w-20 h-1 bg-foreground/[0.04] rounded-full overflow-hidden mt-1">
            <div
              className="h-full rounded-full"
              style={{ 
                width: `${Math.min(100, (player.elo / 5000) * 100)}%`,
                backgroundColor: rank.color,
                opacity: 0.5 
              }}
            />
          </div>
        </div>
      </motion.div>
    );
  }
);

LeaderboardRow.displayName = 'LeaderboardRow';

/* ─── Main Page ─── */
export default function RanksPage() {
  const router = useRouter();
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRank, setExpandedRank] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ranks' | 'leaderboard'>('ranks');

  const handlePlayerClick = useCallback(
    (id: string) => {
      router.push(`/profile?id=${id}`);
    },
    [router]
  );

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: i * 0.1,
      },
    }),
  };

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

  const podiumPlayers = topPlayers.slice(0, 3);
  const remainingPlayers = topPlayers.slice(3);

  return (
    <div className="min-h-screen bg-background pb-32 font-kanit">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-foreground/[0.05] py-5 px-3 sm:px-5 lg:px-10 xl:px-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-full mx-auto flex items-center gap-4">
          <Link href="/">
            <button className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.08] hover:border-foreground/10 transition-all">
              <ArrowLeft className="w-5 h-5 text-foreground/70" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-foreground leading-none">
              Ranking & Divisiones
            </h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              El camino hacia la gloria
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
            {[
              { id: 'ranks' as const, label: 'Rangos', icon: Shield },
              { id: 'leaderboard' as const, label: 'Top 10', icon: Trophy },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-primary text-black shadow-[0_4px_15px_rgba(44,252,125,0.2)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-3 sm:px-5 lg:px-10 xl:px-16 py-10 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Sistema de Prestigio
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-[0.9]">
              Escalá hasta lo <span className="text-primary">Más Alto</span>
            </h2>
            <p className="text-foreground/50 text-sm font-medium leading-relaxed max-w-lg mx-auto">
              En Pelotify, tu ELO no es solo un número — es tu estatus. Cada victoria, cada gol y cada
              voto de tus compañeros te acerca a convertirte en una Leyenda.
            </p>
          </motion.div>
        </section>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'ranks' ? (
            <motion.section
              key="ranks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Section Header */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                    Divisiones de la Liga
                  </h2>
                </div>
                <div className="h-px flex-1 bg-foreground/[0.04]" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  {RANKS.length} Niveles
                </span>
              </div>

              {/* Ranked Tier List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {RANKS.map((rank, i) => (
                  <RankTierCard
                    key={rank.name}
                    rank={rank}
                    i={i}
                    isExpanded={expandedRank === rank.name}
                    onToggle={() => setExpandedRank(expandedRank === rank.name ? null : rank.name)}
                  />
                ))}
              </div>

              {/* How it works */}
              <div className="glass-premium rounded-[2.5rem] p-8 sm:p-10 border-foreground/[0.06] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/[0.04] blur-[60px] rounded-full pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black italic uppercase tracking-tighter">¿Cómo Subir de Rango?</h3>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tu plan de ascenso</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Zap, title: 'Jugá Partidos', desc: 'Cada partido suma XP base a tu perfil.', color: 'text-primary' },
                      { icon: Trophy, title: 'Ganá y Dominá', desc: 'Las victorias otorgan bonuses de XP enormes.', color: 'text-accent' },
                      { icon: Star, title: 'Sé Votado', desc: 'Los votos MVP de tus compañeros multiplican tu XP.', color: 'text-sky-400' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.04]">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-foreground/[0.04] shrink-0", step.color)}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground leading-tight">{step.title}</p>
                          <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              id="leaderboard"
              className="space-y-10 scroll-mt-32"
            >
              {/* Section Header */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-accent to-accent/30 rounded-full" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Radar Global</h2>
                </div>
                <div className="h-px flex-1 bg-foreground/[0.04]" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                  Top 10 Jugadores
                </span>
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
                  {/* Podium */}
                  {podiumPlayers.length >= 3 && (
                    <div className="flex gap-4 items-end justify-center max-w-2xl mx-auto px-2">
                      {podiumPlayers.map((player, i) => (
                        <PodiumCard key={player.id} player={player} position={i} />
                      ))}
                    </div>
                  )}

                  {/* Remaining Players */}
                  {remainingPlayers.length > 0 && (
                    <div className="rounded-[2rem] border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
                      {remainingPlayers.map((player, idx) => (
                        <LeaderboardRow
                          key={player.id}
                          player={player}
                          idx={idx}
                          onClick={handlePlayerClick}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer Tip */}
        <div className="text-center pt-8 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-foreground/[0.06]" />
            <Sparkles className="w-3.5 h-3.5 text-primary/30" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-foreground/[0.06]" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground/20">
            Jugá partidos • Subí tu ELO • Construí tu Legado
          </p>
        </div>
      </main>
    </div>
  );
}
