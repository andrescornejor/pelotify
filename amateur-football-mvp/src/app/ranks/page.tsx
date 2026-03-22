'use client';

import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RANKS, getRankByElo } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { RankBadge } from '@/components/RankBadge';
import { supabase } from '@/lib/supabase';

const RankCard = memo(
  ({ rank, i, fadeUp, desc }: { rank: any; i: number; fadeUp: any; desc: string }) => (
    <motion.div
      key={rank.name}
      custom={i}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      whileHover={{ y: -10 }}
      className="group relative overflow-hidden rounded-[3rem] p-10 glass-premium border border-foreground/5 flex flex-col items-center text-center gap-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
    >
      {/* Background Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${rank.color} 0%, transparent 70%)`,
        }}
      />

      {/* Badge */}
      <div className="relative z-10">
        <RankBadge rankName={rank.name} size="lg" />
      </div>

      {/* Rank Name & ELO */}
      <div className="space-y-3 relative z-10 w-full">
        <h3
          className="text-3xl font-black italic uppercase tracking-tighter"
          style={{ color: rank.color }}
        >
          {rank.name}
        </h3>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/5 shadow-inner">
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
            MÍNIMO
          </span>
          <span className="text-sm font-black text-foreground">
            {rank.minElo.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-foreground/50 leading-relaxed italic">
          "{desc}"
        </p>
      </div>

      {/* Footer Progress Simulation */}
      <div className="w-full space-y-3 relative z-10 pt-4">
        <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: i * 0.15 }}
            className="h-full rounded-full opacity-40"
            style={{
              background: `linear-gradient(90deg, transparent, ${rank.color}, transparent)`,
            }}
          />
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground/20">
          ESTATUS REGISTRADO
        </p>
      </div>
    </motion.div>
  )
);

RankCard.displayName = 'RankCard';

const LeaderboardRow = memo(
  ({ player, idx, onClick }: { player: any; idx: number; onClick: (id: string) => void }) => {
    const rank = getRankByElo(player.elo);
    const isTop3 = idx < 3;
    const colors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

    return (
      <motion.tr
        key={player.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={cn(
          'group hover:bg-foreground/[0.03] transition-colors cursor-pointer border-b border-foreground/[0.02] last:border-0',
          isTop3 && 'bg-foreground/[0.01]'
        )}
        onClick={() => onClick(player.id)}
      >
        <td className="px-8 py-6">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-lg',
              isTop3
                ? `${colors[idx]} bg-foreground/5 border border-current shadow-[0_0_15px_rgba(0,0,0,0.2)]`
                : 'text-foreground/20'
            )}
          >
            #{idx + 1}
          </div>
        </td>
        <td className="px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  player.avatar_url ||
                  `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=transparent`
                }
                alt={player.name}
                className="w-12 h-12 rounded-2xl object-cover bg-foreground/5 border border-foreground/10 group-hover:scale-110 transition-transform duration-500"
              />
              {isTop3 && (
                <div
                  className={cn(
                    'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background',
                    idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-300' : 'bg-amber-600'
                  )}
                />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors text-lg">
                {player.name}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                {player.position}
              </span>
            </div>
          </div>
        </td>
        <td className="px-8 py-6">
          <div className="flex justify-center group-hover:scale-110 transition-transform duration-500">
            <RankBadge rankName={rank.name} size="sm" />
          </div>
        </td>
        <td className="px-8 py-6 text-center">
          <span className="font-black italic text-foreground/40">{player.matches}</span>
        </td>
        <td className="px-8 py-6 text-right">
          <div className="flex flex-col items-end gap-1">
            <span className="text-xl font-black italic tracking-tighter text-foreground tabular-nums group-hover:scale-110 transition-transform origin-right">
              {player.elo.toLocaleString()}
            </span>
            <div className="w-16 h-1 bg-foreground/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/40 rounded-full"
                style={{ width: `${Math.min(100, (player.elo / 5000) * 100)}%` }}
              />
            </div>
          </div>
        </td>
      </motion.tr>
    );
  }
);

LeaderboardRow.displayName = 'LeaderboardRow';

export default function RanksPage() {
  const router = useRouter();
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getRankDesc = (name: string) => {
    switch (name) {
      case 'HIERRO':
        return 'El punto de partida de todo jugador.';
      case 'BRONCE':
        return 'Ya no sos horrible. Has demostrado consistencia en la cancha.';
      case 'PLATA':
        return 'Un jugador respetado que entiende la dinámica del juego.';
      case 'ORO':
        return 'Talento puro. Eres la referencia de tu equipo.';
      case 'PLATINO':
        return 'Dominio total. Pocos pueden seguirte el ritmo cuando aceleras.';
      case 'DIAMANTE':
        return 'La joya de la cancha. Tu nombre ya suena en cada estadio.';
      case 'ELITE':
        return 'Solo para los privilegiados. El 1% de la comunidad de Pelotify.';
      case 'LEYENDA':
        return 'Inmortal. Tu estatus trasciende los partidos. Eres historia pura.';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-premium border-b border-foreground/5 py-6 px-4">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <Link href="/">
            <button className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 transition-all">
              <ArrowLeft className="w-5 h-5 text-foreground/70" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
              Escala de Rangos
            </h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              El camino hacia la gloria
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-12 space-y-24">
        {/* Intro Section */}
        <section className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              Sistema de Prestigio
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Escalá hasta lo <span className="text-primary italic">Más Alto</span>
          </h2>
          <p className="text-foreground/50 text-sm font-medium leading-relaxed">
            En Pelotify, tu ELO no es solo un número, es tu estatus. Cada victoria, cada gol y cada
            voto de tus compañeros te acerca a convertirte en una Leyenda.
          </p>

          {/* Scroll Indicator / Call to Action moved here */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <motion.button
              type="button"
              onClick={() => {
                const el = document.getElementById('leaderboard');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              whileHover={{ y: 5 }}
              className="group flex flex-col items-center gap-2 outline-none"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 group-hover:text-primary transition-colors text-center">
                Explorar Ranking Global
              </span>
              <div className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                <ChevronDown className="w-5 h-5 text-foreground/40 group-hover:text-primary animate-bounce font-black" />
              </div>
            </motion.button>
          </div>
        </section>

        {/* Ranks Grid */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
              Divisiones de la Liga
            </h2>
            <div className="h-px flex-1 bg-foreground/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {RANKS.map((rank, i) => (
              <RankCard
                key={rank.name}
                rank={rank}
                i={i}
                fadeUp={fadeUp}
                desc={getRankDesc(rank.name)}
              />
            ))}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="space-y-12 scroll-mt-32">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Radar Global</h2>
            <div className="h-px flex-1 bg-foreground/5" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              Top 10 Jugadores
            </span>
          </div>

          <div className="glass-premium rounded-[2.5rem] border border-foreground/5 overflow-hidden relative">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                  Sincronizando Radar...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
                        Pos
                      </th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
                        Jugador
                      </th>
                      <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
                        Rango
                      </th>
                      <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
                        Partidos
                      </th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
                        Puntos XP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPlayers.map((player, idx) => (
                      <LeaderboardRow
                        key={player.id}
                        player={player}
                        idx={idx}
                        onClick={handlePlayerClick}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

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
