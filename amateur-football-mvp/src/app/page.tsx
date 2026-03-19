'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Trophy,
  Star,
  Shield,
  MapPin,
  Calendar,
  Clock,
  Search,
  PlusCircle,
  ChevronRight,
  User2,
  Zap,
  Target,
  Award,
  TrendingUp,
  Flame,
  Activity,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RatingModal } from '@/components/RatingModal';
import { getUserMatches, Match } from '@/lib/matches';
import { getUserTeams, Team } from '@/lib/teams';
import { cn } from '@/lib/utils';
import { findVenueByLocation } from '@/lib/venues';
import { getRankByElo, RANKS } from '@/lib/ranks';

export default function HomePage() {
  const { user } = useAuth();
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [greeting, setGreeting] = useState('Buen día');

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const { getTotalPlayersCount } = await import('@/lib/teams');
        const [matchesData, teamsData, playersCount] = await Promise.all([
          getUserMatches(user.id),
          getUserTeams(user.id),
          getTotalPlayersCount()
        ]);
        setUserMatches(matchesData.filter(m => {
          if (m.is_completed) return false;
          const matchStart = new Date(`${m.date}T${m.time}`);
          const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
          return new Date() < matchEnd;
        }));
        setUserTeams(teamsData);
        setTotalPlayers(playersCount);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buen día');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    fetchData();
  }, [user?.id]);

  const metadata = user?.user_metadata || {};
  const elo = metadata?.elo || 0;
  const totalMatches = userMatches.length > 0 ? userMatches.length : (metadata?.matches || 0);
  const userName = user?.name || 'Jugador';

  const rankInfo = getRankByElo(elo);
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rankInfo.name) + 1] || rankInfo;
  const progressToNextRank = nextRank.minElo > 0 
    ? Math.min(100, (elo / nextRank.minElo) * 100) 
    : 100;

  const rank = {
    name: rankInfo.name,
    color: 'text-primary', // Default fallback
    glow: `rgba(44,252,125,0.3)`, 
    hex: rankInfo.color
  };
  
  // Apply specific colors from our theme
  if (rank.name === 'HIERRO') { rank.color = 'text-foreground/50'; rank.glow = 'rgba(255,255,255,0.1)'; }
  else if (rank.name === 'BRONCE') { rank.color = 'text-orange-600'; rank.glow = 'rgba(146,64,14,0.3)'; }
  else if (rank.name === 'PLATA') { rank.color = 'text-slate-400'; rank.glow = 'rgba(148,163,184,0.3)'; }
  else if (rank.name === 'ORO') { rank.color = 'text-yellow-500'; rank.glow = 'rgba(202,138,4,0.35)'; }
  else { rank.color = 'text-primary'; rank.glow = 'rgba(44,252,125,0.4)'; }


  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { type: 'spring' as const, stiffness: 280, damping: 24, delay: i * 0.07 }
    })
  };

  return (
    <div className="relative min-h-screen bg-background snap-y snap-proximity overflow-y-auto">

      {/* ── AMBIENT ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[55%] opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-5%] left-[-10%] w-[50%] h-[50%] opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(120px)' }} />
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12">

        {/* ═══════════════════════════════════════
            HERO — full-width cinematic header
        ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] snap-start scroll-mt-24"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--foreground-rgb),0.05) 0%, rgba(var(--foreground-rgb),0.01) 100%)',
            border: '1px solid rgba(var(--foreground-rgb),0.07)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.12), inset 0 1px 0 rgba(var(--foreground-rgb),0.07)',
          }}
        >
          {/* Backdrop image */}
          <div className="absolute inset-0 z-0">
            <motion.img
              animate={{ scale: [1, 1.04, 1], opacity: [0.07, 0.13, 0.07] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2400"
              alt=""
              className="w-full h-full object-cover grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent dark:from-[#04040a] dark:via-[#04040a]/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-transparent to-transparent dark:from-[#04040a]/75" />
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 p-7 sm:p-10 lg:p-14 xl:p-16">

            {/* Left: text */}
            <div className="flex-1 space-y-6 lg:space-y-8">
              {/* Live badge */}
              <motion.div
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 26 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl"
                style={{ background: 'rgba(44,252,125,0.08)', border: '1px solid rgba(44,252,125,0.2)', backdropFilter: 'blur(10px)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/80">{greeting} — Red activa</span>
              </motion.div>

              {/* Headline */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="font-black tracking-[-0.06em] leading-[0.82] uppercase italic"
                  style={{ fontSize: 'clamp(3.2rem, 7vw, 8rem)' }}
                >
                  <span className="text-foreground">Dominá</span><br />
                  <span
                    className="animate-gradient bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 40%, #1db95a 70%, #5dfd9d 100%)',
                      backgroundSize: '200% 200%',
                      filter: 'drop-shadow(0 0 35px rgba(44,252,125,0.4))',
                    }}
                  >
                    la Cancha.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-foreground/50 text-base lg:text-lg font-medium max-w-lg leading-relaxed mt-4"
                >
                  Hola,{' '}
                  <span className="text-foreground font-black uppercase tracking-tighter">{userName}</span>.
                  {' '}Estás rankeado{' '}
                  <span className={cn('font-black', rank.color)} style={{ textShadow: `0 0 24px ${rank.glow}` }}>
                    {rank.name}
                  </span>
                  {' '}con <span className="font-black text-foreground">{elo}</span> ELO.
                </motion.p>
              </div>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="max-w-sm space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/55">{rank.name}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground/55">{elo} / {nextRank.minElo || 'MAX'}</span>
                </div>
                <div className="h-[3px] w-full bg-foreground/[0.12] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNextRank}%` }}
                    transition={{ duration: 1.8, ease: 'easeOut', delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${rank.hex}, #5dfd9d)`, boxShadow: `0 0 12px ${rank.glow}` }}
                  />
                </div>
                <p className="text-[8px] font-black text-foreground/45 uppercase tracking-[0.25em]">
                  {Math.round(progressToNextRank)}% al siguiente rango
                </p>
              </motion.div>
            </div>

            {/* Right: stat pills + CTAs */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 240, damping: 22 }}
              className="flex flex-col gap-5 lg:shrink-0 lg:w-64 xl:w-72"
            >
              {/* Mini stat strip */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'ELO',      value: elo,                            color: '#2cfc7d' },
                  { label: 'MVPs',     value: metadata?.mvp_count || 0,       color: '#f59e0b' },
                  { label: 'Win%',     value: `${metadata?.win_rate || 0}%`,  color: '#f43f5e' },
                ].map((s, i) => (
                  <div key={i} className="rounded-[1rem] p-3 text-center"
                    style={{ background: 'rgba(var(--foreground-rgb),0.04)', border: '1px solid rgba(var(--foreground-rgb),0.07)' }}>
                    <div className="text-xl font-black italic tracking-tighter leading-none" style={{ color: s.color }}>
                      {s.value}
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-foreground/55 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <Link href="/create">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full h-13 px-6 font-black uppercase text-[11px] tracking-[0.25em] rounded-[1.1rem] flex items-center justify-center gap-3 text-background relative overflow-hidden group"
                    style={{
                      height: '52px',
                      background: 'linear-gradient(135deg, #5dfd9d 0%, #2cfc7d 55%, #1db95a 100%)',
                      boxShadow: '0 10px 30px rgba(44,252,125,0.35), 0 4px 10px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', transform: 'skewX(-20deg)' }} />
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500 relative z-10" />
                    <span className="relative z-10">ARMAR PARTIDO</span>
                  </motion.button>
                </Link>
                <Link href="/search">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full font-black uppercase text-[11px] tracking-[0.25em] rounded-[1.1rem] flex items-center justify-center gap-3 transition-all group"
                    style={{
                      height: '46px',
                      background: 'rgba(var(--foreground-rgb),0.05)',
                      border: '1px solid rgba(var(--foreground-rgb),0.1)',
                      color: 'rgba(var(--foreground-rgb),0.65)',
                    }}
                  >
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>EXPLORAR RED</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════
            DASHBOARD GRID
            - Mobile:   1 col
            - lg:       left(8) | right(4)
            - xl:       left(7) | center(3) | right(2) — keeps agenda fixed right
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">

            {/* ── STAT CARDS ─────────────────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 snap-start scroll-mt-26"
            >
              {[
                { icon: Trophy,   label: 'ELO Rating',  value: elo,                           unit: 'puntos',    color: '#2cfc7d', glow: 'rgba(44,252,125,0.18)' },
                { icon: Activity, label: 'Partidos',    value: totalMatches,                   unit: 'jugados',   color: '#6366f1', glow: 'rgba(99,102,241,0.18)' },
                { icon: Star,     label: 'MVPs',        value: metadata?.mvp_count || 0,       unit: 'figuras',   color: '#f59e0b', glow: 'rgba(245,158,11,0.18)' },
                { icon: Flame,    label: 'Win Rate',    value: `${metadata?.win_rate || 0}%`,  unit: 'victorias', color: '#f43f5e', glow: 'rgba(244,63,94,0.18)' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-[1.5rem] p-5 cursor-default"
                  style={{
                    background: 'linear-gradient(145deg, rgba(var(--foreground-rgb),0.04) 0%, rgba(var(--foreground-rgb),0.01) 100%)',
                    border: '1px solid rgba(var(--foreground-rgb),0.07)',
                  }}
                >
                  {/* Color top accent */}
                  <div className="absolute top-0 inset-x-0 h-[2px] transition-opacity opacity-50 group-hover:opacity-100"
                    style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                  {/* Glow hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-[1.5rem]"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${stat.glow} 0%, transparent 65%)` }} />

                  <div className="relative z-10">
                    <stat.icon className="w-4 h-4 mb-3 transition-transform group-hover:scale-110" style={{ color: stat.color }} />
                    <p className="text-[1.7rem] font-black tracking-tighter italic leading-none text-foreground">{stat.value}</p>
                    <p className="text-[8px] font-black text-foreground/55 uppercase tracking-widest mt-1.5">{stat.unit}</p>
                    <p className="text-[9px] font-black text-foreground/70 uppercase tracking-wide mt-0.5">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* ── COMMUNITY BANNER ───────────── */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              whileHover={{ scale: 1.005 }}
              className="relative overflow-hidden rounded-[1.75rem] p-5 flex flex-col sm:flex-row items-center justify-between gap-5 snap-start scroll-mt-26"
              style={{ background: 'linear-gradient(135deg, rgba(44,252,125,0.06), rgba(44,252,125,0.02))', border: '1px solid rgba(44,252,125,0.12)' }}
            >
              <div className="absolute right-0 top-0 w-48 h-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(44,252,125,0.4) 0%, transparent 70%)' }} />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(44,252,125,0.1)', border: '1px solid rgba(44,252,125,0.2)' }}>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-black text-foreground italic uppercase tracking-tighter leading-none">Comunidad Activa</h4>
                    <p className="text-[9px] font-black text-foreground/55 uppercase tracking-[0.2em] mt-0.5">
                    <span className="text-primary text-sm font-black">{totalPlayers}</span> jugadores registrados
                  </p>
                </div>
              </div>
              <div className="flex gap-2 relative z-10 shrink-0">
                <Link href="/teams">
                  <button className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-[1.03]"
                    style={{ background: 'rgba(var(--foreground-rgb),0.05)', border: '1px solid rgba(var(--foreground-rgb),0.08)', color: 'rgba(var(--foreground-rgb),0.55)' }}>
                    Clubes Top
                  </button>
                </Link>
                <Link href="/search">
                  <button className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-[1.03] text-background"
                    style={{ background: 'linear-gradient(135deg, #2cfc7d, #1db95a)', boxShadow: '0 4px 14px rgba(44,252,125,0.28)' }}>
                    Mapa en Vivo
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* ── ELO SYSTEM ─────────────────── */}
            <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={2} className="space-y-4 snap-start scroll-mt-26">
              <div className="flex items-end justify-between px-1">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl lg:text-2xl font-black italic text-foreground uppercase tracking-tighter leading-none">
                    Sistema de Puntos & ELO
                  </h2>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">¿CÓMO ESCALAR EN EL RANKING?</span>
                </div>
                <Sparkles className="w-4 h-4 text-primary/40 shrink-0 mb-0.5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Zap,    color: '#2cfc7d', glow: 'rgba(44,252,125,0.13)', label: 'Victoria Inicial', points: '+1000', desc: 'Bono masivo por ganar tu primer partido registrado.' },
                  { icon: Target, color: '#f59e0b', glow: 'rgba(245,158,11,0.13)', label: 'Goles Anotados',   points: '+100',  desc: 'Cada gol informado y validado suma a tu ELO personal.' },
                  { icon: Award,  color: '#6366f1', glow: 'rgba(99,102,241,0.13)', label: 'MVP del Partido',  points: '+200',  desc: 'Ser el más votado por tus compañeros tiene recompensa.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -7, scale: 1.015 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    className="group relative overflow-hidden rounded-[1.75rem] p-6 flex flex-col gap-5 cursor-default"
                    style={{
                      background: 'linear-gradient(145deg, rgba(var(--foreground-rgb),0.04) 0%, rgba(var(--foreground-rgb),0.01) 100%)',
                      border: '1px solid rgba(var(--foreground-rgb),0.07)',
                    }}
                  >
                    <div className="absolute inset-0 rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(ellipse at 30% 30%, ${item.glow} 0%, transparent 70%)` }} />

                    <div className="relative z-10 w-12 h-12 rounded-[1rem] flex items-center justify-center group-hover:rotate-6 transition-transform duration-500"
                      style={{ background: item.glow, border: `1px solid ${item.color}26` }}>
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>

                    <div className="space-y-2 relative z-10">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-base font-black text-foreground italic uppercase tracking-tighter leading-none">{item.label}</h3>
                        <span className="text-xl font-black italic" style={{ color: item.color }}>{item.points}</span>
                      </div>
                      <p className="text-[9px] text-foreground/55 font-black uppercase tracking-widest leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="relative z-10 h-[2px] bg-foreground/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 1.4, delay: i * 0.18, ease: 'easeOut' }}
                        className="h-full rounded-full opacity-40"
                        style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Rank banner */}
              <motion.div
                whileHover={{ scale: 1.005 }}
                className="relative overflow-hidden rounded-[1.5rem] p-5 flex flex-col sm:flex-row items-center justify-between gap-5"
                style={{ background: 'linear-gradient(135deg, rgba(44,252,125,0.05), rgba(44,252,125,0.02))', border: '1px solid rgba(44,252,125,0.1)' }}
              >
                <div className="absolute right-0 top-0 h-full w-2/5 overflow-hidden pointer-events-none">
                  <div style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(44,252,125,0.07) 0%, transparent 70%)', height: '100%', width: '100%' }} />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-[0.875rem] flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(var(--foreground-rgb),0.05)', border: '1px solid rgba(var(--foreground-rgb),0.08)' }}>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-foreground italic uppercase tracking-tighter leading-none">Tu Carrera Arranca en Hierro</h4>
                    <p className="text-[9px] text-foreground/55 font-black uppercase tracking-[0.2em] mt-0.5">
                      Todos arrancan en <span className="text-foreground/80">HIERRO</span>. Subí de nivel jugando.
                    </p>
                  </div>
                </div>
                  <Link href="/ranks">
                    <button className="h-10 px-5 rounded-[0.875rem] flex items-center justify-center gap-3 transition-all hover:scale-[1.03] text-white shadow-xl group"
                      style={{ background: 'linear-gradient(135deg, #2cfc7d, #1db95a)', boxShadow: `0 8px 24px ${rank.glow}` }}>
                      <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:translate-x-[-2px] transition-transform">VER ESCALA</span>
                      <Trophy className="w-4 h-4 text-white fill-white" />
                    </button>
                  </Link>
              </motion.div>
            </motion.section>

            {/* ── TEAMS ──────────────────────── */}
            <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={3} className="space-y-4 snap-start scroll-mt-26">
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter">Tus Equipos</h2>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">ADMINISTRACIÓN DE PLANTEL</span>
                </div>
                <Link href="/teams"
                  className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[9px] font-black text-foreground/55 hover:text-foreground transition-all tracking-[0.2em] uppercase"
                  style={{ background: 'rgba(var(--foreground-rgb),0.04)', border: '1px solid rgba(var(--foreground-rgb),0.07)' }}>
                  Ver Todos <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-24 rounded-[1.5rem] animate-pulse"
                      style={{ background: 'rgba(var(--foreground-rgb),0.04)', border: '1px solid rgba(var(--foreground-rgb),0.06)' }} />
                  ))
                ) : userTeams.length > 0 ? (
                  userTeams.map(team => (
                    <Link key={team.id} href={`/team?id=${team.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.025, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                        className="group relative overflow-hidden rounded-[1.5rem] p-4 cursor-pointer"
                        style={{ background: 'rgba(var(--foreground-rgb),0.03)', border: '1px solid rgba(var(--foreground-rgb),0.07)' }}
                      >
                        <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(44,252,125,0.08) 0%, transparent 70%)' }} />
                        <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(44,252,125,0.4), transparent)' }} />

                        <div className="flex items-center gap-3.5 relative z-10">
                          <div className="w-12 h-12 rounded-[0.875rem] flex items-center justify-center shrink-0 overflow-hidden border-2 transition-all duration-500 group-hover:border-primary/40"
                            style={{ background: 'rgba(var(--foreground-rgb),0.07)', borderColor: 'rgba(var(--foreground-rgb),0.1)' }}>
                            {team.logo_url
                              ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              : <Shield className="w-5 h-5 text-foreground/50 group-hover:text-primary transition-colors" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-black text-foreground text-base leading-none tracking-tighter uppercase group-hover:text-primary transition-colors truncate">
                                {team.name}
                              </h3>
                              <ArrowUpRight className="w-4 h-4 text-foreground/50 group-hover:text-primary transition-colors shrink-0 -mr-0.5 -mt-0.5 opacity-0 group-hover:opacity-100" />
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-1.5"
                              style={{ borderTop: '1px solid rgba(var(--foreground-rgb),0.06)' }}>
                              <span className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(var(--foreground-rgb),0.05)', border: '1px solid rgba(var(--foreground-rgb),0.06)', color: 'rgba(var(--foreground-rgb),0.6)' }}>
                                <Users className="w-2.5 h-2.5" /> {team.members_count}
                              </span>
                              <span className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(44,252,125,0.07)', border: '1px solid rgba(44,252,125,0.14)', color: '#2cfc7d' }}>
                                <Trophy className="w-2.5 h-2.5" /> {team.elo} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full py-12 rounded-[1.75rem] flex flex-col items-center justify-center text-center gap-5 border-2 border-dashed"
                    style={{ borderColor: 'rgba(var(--foreground-rgb),0.06)', background: 'rgba(var(--foreground-rgb),0.02)' }}>
                    <div className="relative">
                      <div className="w-18 h-18 rounded-[1.25rem] flex items-center justify-center animate-float"
                        style={{ width: '72px', height: '72px', background: 'rgba(var(--foreground-rgb),0.05)', border: '1px solid rgba(var(--foreground-rgb),0.08)' }}>
                        <Users className="w-8 h-8 text-foreground/55" />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full animate-pulse"
                        style={{ background: 'rgba(44,252,125,0.15)', border: '1px solid rgba(44,252,125,0.2)' }} />
                    </div>
                    <div className="max-w-xs space-y-1.5">
                      <h3 className="text-base font-black text-foreground italic tracking-tighter uppercase">¿Sin Club?</h3>
                      <p className="text-[9px] text-foreground/65 font-black uppercase tracking-[0.22em] leading-relaxed">
                        Las leyendas no juegan solas. Unite a un equipo o armá el tuyo.
                      </p>
                    </div>
                    <Link href="/teams">
                      <button className="h-11 px-9 font-black text-[10px] uppercase tracking-[0.22em] rounded-2xl text-white hover:scale-[1.03] transition-transform"
                        style={{ background: 'linear-gradient(135deg, #2cfc7d, #1db95a)', boxShadow: '0 8px 24px rgba(44,252,125,0.25)' }}>
                        VER EQUIPOS →
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* ═══════════ RIGHT: AGENDA ═══════════ */}
          <aside className="lg:col-span-4 xl:col-span-4 space-y-4 lg:sticky lg:top-8">
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl lg:text-2xl font-black italic text-foreground uppercase tracking-tighter leading-none">Tu Agenda</h2>
                <span className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">PRÓXIMOS PARTIDOS</span>
              </div>
              <Link href="/search"
                className="text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.14)', color: '#f59e0b' }}>
                + AGENDAR
              </Link>
            </div>

            <div className="flex flex-col gap-3 snap-start scroll-mt-26">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-36 rounded-[1.5rem] animate-pulse"
                    style={{ background: 'rgba(var(--foreground-rgb),0.04)', border: '1px solid rgba(var(--foreground-rgb),0.06)' }} />
                ))
              ) : userMatches.length > 0 ? (
                userMatches.map(match => (
                  <Link key={match.id} href={`/match?id=${match.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: -4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="group relative overflow-hidden rounded-[1.5rem] p-5 cursor-pointer transition-all"
                      style={{ background: 'rgba(var(--foreground-rgb),0.03)', border: '1px solid rgba(var(--foreground-rgb),0.07)' }}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(44,252,125,0.1) 0%, transparent 70%)', transform: 'translate(25%,-25%)' }} />

                      <div className="flex justify-between items-start mb-3.5 relative z-10">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-[0.18em]"
                              style={{ background: 'rgba(44,252,125,0.08)', border: '1px solid rgba(44,252,125,0.15)', color: '#2cfc7d' }}>
                              FÚTBOL {match.type.replace('F', '')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary/50" />
                            <span className="text-2xl font-black italic tracking-tighter leading-none text-foreground">{match.time.split(':').slice(0, 2).join(':')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-foreground/70 uppercase tracking-[0.22em]">{match.date.split(',')[0]}</p>
                          <p className="text-sm font-black text-foreground/55 capitalize mt-0.5">{match.date.split(',')[1]}</p>
                        </div>
                      </div>

                      <div className="space-y-1 relative z-10">
                        <h4 className="font-black text-foreground text-base tracking-tighter leading-none group-hover:text-primary transition-colors truncate uppercase italic">
                          {(() => {
                            const venue = findVenueByLocation(match.location);
                            return venue?.displayName || venue?.name || match.location;
                          })()}
                        </h4>
                        <p className="text-foreground/65 text-[8.5px] font-black uppercase tracking-[0.14em] flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {match.location}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 flex items-center justify-between relative z-10"
                        style={{ borderTop: '1px solid rgba(var(--foreground-rgb),0.06)' }}>
                        <div className="flex -space-x-1.5">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-lg border-2 border-background flex items-center justify-center group-hover:scale-105 transition-transform"
                              style={{ background: 'rgba(var(--foreground-rgb),0.08)', transitionDelay: `${i * 35}ms` }}>
                              <User2 className="w-3 h-3 text-foreground/55" />
                            </div>
                          ))}
                          <div className="w-6 h-6 rounded-lg border-2 border-background flex items-center justify-center"
                            style={{ background: 'rgba(16,185,129,0.1)' }}>
                            <span className="text-[8px] font-black text-primary">+</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300">
                          <span className="text-[8px] font-black uppercase tracking-[0.18em] text-foreground/60 group-hover:text-foreground/90 transition-colors">VER</span>
                          <ChevronRight className="w-3.5 h-3.5 text-foreground/55 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center gap-5 border-2 border-dashed"
                  style={{ borderColor: 'rgba(var(--foreground-rgb),0.06)', background: 'rgba(var(--foreground-rgb),0.02)' }}>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[1.1rem] flex items-center justify-center"
                      style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                      <Calendar className="w-8 h-8 text-accent/40" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-9 h-9 rounded-[0.75rem] flex items-center justify-center rotate-12"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 6px 16px rgba(245,158,11,0.3)' }}>
                      <PlusCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-foreground italic tracking-tighter uppercase">Sin Partidos</h3>
                    <p className="text-[9px] text-foreground/65 font-black uppercase tracking-[0.22em] leading-relaxed">
                      Tu agenda está vacía. ¡Buscá una cancha!
                    </p>
                  </div>
                  <Link href="/search" className="w-full">
                    <button className="w-full h-10 font-black text-[10px] uppercase tracking-[0.22em] rounded-2xl text-white hover:scale-[1.02] transition-transform"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 6px 20px rgba(245,158,11,0.18)' }}>
                      BUSCAR PARTIDO
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* ── Quick Links Widget (desktop only) ── */}
            <div className="hidden lg:block rounded-[1.5rem] p-5 space-y-3"
              style={{ background: 'rgba(var(--foreground-rgb),0.03)', border: '1px solid rgba(var(--foreground-rgb),0.07)' }}>
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-foreground/55">Accesos Rápidos</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Crear Equipo',   href: '/teams',         color: '#2cfc7d' },
                  { label: 'Buscar Partido', href: '/search',        color: '#6366f1' },
                  { label: 'Mi Perfil',      href: '/profile/me',    color: '#f59e0b' },
                  { label: 'Amigos',         href: '/friends',       color: '#f43f5e' },
                ].map(link => (
                  <Link key={link.href} href={link.href}>
                    <motion.button
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full h-10 rounded-[0.75rem] text-[9px] font-black uppercase tracking-widest transition-all group"
                      style={{
                        background: 'rgba(var(--foreground-rgb),0.04)',
                        border: '1px solid rgba(var(--foreground-rgb),0.08)',
                        color: 'rgba(var(--foreground-rgb),0.45)',
                      }}
                    >
                      {link.label}
                    </motion.button>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <RatingModal isOpen={isRatingOpen} onClose={() => setIsRatingOpen(false)} />
    </div>
  );
}
