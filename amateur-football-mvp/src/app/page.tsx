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
import { FifaCard } from '@/components/FifaCard';
import { RatingModal } from '@/components/RatingModal';
import { getUserMatches, Match } from '@/lib/matches';
import { getUserTeams, Team } from '@/lib/teams';
import { cn } from '@/lib/utils';
import { findVenueByLocation } from '@/lib/venues';
import { getRankByElo, RANKS } from '@/lib/ranks';
import { useSettings } from '@/contexts/SettingsContext';

export default function HomePage() {
  const { user } = useAuth();
  const { performanceMode: isPerfMode, setPerformanceMode } = useSettings();
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [greeting, setGreeting] = useState('Buen día');

  const togglePerfMode = () => {
    setPerformanceMode(!isPerfMode);
  };

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

        const upcomingMatches = matchesData.filter(m => {
          if (m.is_completed) return false;
          const matchStart = new Date(`${m.date}T${m.time}`);
          const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
          return new Date() < matchEnd;
        }).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

        setUserMatches(upcomingMatches);
        setNextMatch(upcomingMatches[0] || null);
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

  // Handle Countdown Update
  useEffect(() => {
    if (!nextMatch) {
      setCountdownText(null);
      return;
    }

    const updateCountdown = () => {
      const target = new Date(`${nextMatch.date}T${nextMatch.time}`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdownText('¡YA EMPIEZA! ⚽');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours >= 24) {
        setCountdownText(null);
        return;
      }

      if (hours > 0) {
        setCountdownText(`FALTAN ${hours}H ${minutes}M`);
      } else {
        setCountdownText(`EN SOLO ${minutes} MINUTOS`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextMatch]);

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

  const playerData = {
      name: userName,
      overall: elo,
      position: metadata?.position || 'MC',
      stats: {
          pac: metadata?.stats?.pac || 75,
          sho: metadata?.stats?.sho || 70,
          pas: metadata?.stats?.pas || 72,
          dri: metadata?.stats?.dri || 78,
          def: metadata?.stats?.def || 65,
          phy: metadata?.stats?.phy || 70
      },
      mvpTrophies: metadata?.mvp_count || 0
  };

  return (
    <div className={cn(
      "relative min-h-screen bg-background font-sans selection:bg-primary selection:text-background",
      isPerfMode && "perf-mode"
    )}>
      {/* ── AMBIENT — Simplified for Performance ── */}
      {!isPerfMode && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden hidden md:block">
          <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
        </div>
      )}

      {/* ── MOBILE PERF TOGGLE ── */}
      <button
        onClick={togglePerfMode}
        className={cn(
          "fixed bottom-24 right-6 z-[100] w-12 h-12 rounded-2xl md:hidden glass border-primary/20 flex flex-col items-center justify-center transition-all active:scale-90",
          isPerfMode ? "bg-primary text-background border-primary" : "text-primary shadow-lg shadow-primary/10"
        )}
      >
        <Zap className={cn("w-5 h-5", isPerfMode && "fill-current")} />
        <span className="text-[6px] font-black uppercase mt-0.5 tracking-tighter">{isPerfMode ? 'ALTO' : 'LITE'}</span>
      </button>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12">

        {/* ═══════════════════════════════════════
            HERO — full-width cinematic header
        ═══════════════════════════════════════ */}
        {/* ═══════════════════════════════════════
            HERO — full-width cinematic header
        ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl group/hero"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--foreground-rgb),0.03) 0%, rgba(var(--foreground-rgb),0.01) 100%)',
            border: '1px solid rgba(var(--foreground-rgb),0.08)',
          }}
        >
          {/* Backdrop image & Effects */}
          <div className="absolute inset-0 z-0 select-none">
            <motion.img
              initial={false}
              animate={isPerfMode ? { scale: 1, rotate: 0 } : {
                scale: [1.02, 1.08, 1.02],
                rotate: [0, 1, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=60&w=1200"
              alt=""
              className={cn(
                "w-full h-full object-cover grayscale opacity-[0.08] dark:opacity-[0.12] scale-110 transition-opacity",
                isPerfMode && "grayscale-0 opacity-20 scale-100"
              )}
            />
            {/* Overlay gradients for depth */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90",
              isPerfMode && "opacity-70"
            )} />
            {!isPerfMode && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
                <div className="absolute inset-0 backdrop-blur-[2px] opacity-40 mix-blend-overlay" />

                {/* Animated "Beam" light effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-[-25deg]"
                />
              </>
            )}
          </div>

          {/* Content Wrapper */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 p-8 sm:p-12 lg:p-16 xl:p-20">

            {/* Left: Text & Branding */}
            <div className="flex-1 space-y-8 max-w-2xl">
              <motion.div
                initial={isPerfMode ? { opacity: 1 } : { x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={cn("inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-premium border-primary/20", isPerfMode && "bg-surface")}
              >
                <div className="relative flex h-2 w-2">
                  <span className={cn("absolute inline-flex h-full w-full rounded-full bg-primary opacity-75", !isPerfMode && "animate-ping")} />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/90 font-outfit">
                  {greeting} • SERVER STATUS: OPTIMAL
                </span>
              </motion.div>

              {/* Title Section */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-black italic tracking-tight leading-[0.85] uppercase font-kanit"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}
                >
                  <span className="text-foreground/90 mix-blend-difference">DOMINA</span><br />
                  <span className={isPerfMode
                    ? "text-primary"
                    : "bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-primary to-primary-dark animate-gradient [text-shadow:0_0_40px_rgba(44,252,125,0.3)]"
                  }>
                    LA CANCHA.
                  </span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 py-2"
                >
                  <div className="h-[2px] w-12 bg-primary/30" />
                  <p className="text-foreground/60 text-lg font-medium font-outfit">
                    Bienvenido, <span className="text-foreground font-black uppercase">{userName}</span>
                  </p>
                </motion.div>
              </div>

              {/* Stats / Rank Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2"
              >
                {[
                  { label: 'Rango Actual', value: rank.name, color: rank.color, icon: Trophy },
                  { label: 'Puntaje ELO', value: elo, color: 'text-primary', icon: Target },
                  { label: 'Tasa de Éxito', value: `${metadata?.win_rate || 0}%`, color: 'text-accent', icon: TrendingUp },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.25em] flex items-center gap-1.5">
                      <item.icon className="w-2.5 h-2.5" /> {item.label}
                    </p>
                    <p className={cn("text-2xl font-black italic tracking-tighter uppercase font-kanit", item.color)}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link href="/create" className="flex-1 sm:flex-none">
                  <button className="w-full sm:w-auto px-8 h-14 rounded-full bg-primary text-background font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_15px_40px_rgba(44,252,125,0.3)] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                    <PlusCircle className="w-5 h-5" /> ARMAR PARTIDO
                  </button>
                </Link>
                <Link href="/search" className="flex-1 sm:flex-none">
                  <button className="w-full sm:w-auto px-8 h-14 rounded-full glass border-white/10 text-foreground/70 font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:text-foreground hover:bg-foreground/5 active:scale-95 transition-all">
                    <Search className="w-4 h-4" /> EXPLORAR MAPA
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right: Personal 3D Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.4, duration: 1, type: "spring", stiffness: 100 }}
              className="lg:shrink-0 w-full lg:w-auto flex justify-center lg:justify-end perspective-1000 mt-8 lg:mt-0"
            >
              <div className="relative group">
                 {/* Intense ambient glow behind card */}
                 <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-80 group-hover:bg-primary/30 transition-all duration-700 pointer-events-none" />
                 
                 {/* The Interactive Fifa Card */}
                 <div className="relative z-10 scale-[0.85] sm:scale-100 transform origin-center lg:origin-right">
                    <FifaCard player={playerData} />
                 </div>
                 
                 {/* Floating Badges next to card */}
                 <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-4 top-10 glass-premium p-3 rounded-2xl border-white/10 shadow-2xl z-20 hidden sm:flex items-center gap-2"
                 >
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-black text-[10px] uppercase">{rank.name}</span>
                 </motion.div>
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
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 snap-start scroll-mt-26"
            >
              {[
                { icon: Trophy, label: 'ELO Rating', value: elo, color: '#2cfc7d', glow: 'rgba(44,252,125,0.2)' },
                { icon: Activity, label: 'Partidos', value: totalMatches, color: '#6366f1', glow: 'rgba(99,102,241,0.2)' },
                { icon: Star, label: 'MVPs', value: metadata?.mvp_count || 0, color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
                { icon: Flame, label: 'Win Rate', value: `${metadata?.win_rate || 0}%`, color: '#f43f5e', glow: 'rgba(244,63,94,0.2)' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="glass-premium-hover relative overflow-hidden rounded-[2rem] p-6 cursor-default group border border-white/5"
                >
                  {/* Top highlight line */}
                  <div className="absolute top-0 inset-x-0 h-[3px] opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                  {/* Subtle background glow */}
                  {!isPerfMode && (
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-5 blur-2xl group-hover:opacity-20 transition-opacity"
                      style={{ backgroundImage: `linear-gradient(to bottom right, ${stat.color}, transparent)` }} />
                  )}

                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500"
                      style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black tracking-tighter italic leading-none text-foreground font-kanit">{stat.value}</p>
                      </div>
                      <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-2 font-outfit">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* ── COMMUNITY BANNER ───────────── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              whileHover={isPerfMode ? {} : { scale: 1.01 }}
              className={cn(
                "relative overflow-hidden rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 snap-start scroll-mt-26 glass-premium border-primary/10",
                isPerfMode && "bg-surface"
              )}
            >
              {!isPerfMode && (
                <div className="absolute right-0 top-0 w-full h-full opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(44,252,125,0.6) 0%, transparent 60%)' }} />
              )}
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 glass shadow-inner border-white/5">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none font-kanit">Comunidad Activa</h4>
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.25em] mt-1 font-outfit">
                    <span className="text-primary text-base font-black mr-1">{totalPlayers}</span> JUGADORES REGISTRADOS
                  </p>
                </div>
              </div>
              <div className="flex gap-3 relative z-10 shrink-0 w-full sm:w-auto">
                <Link href="/teams" className="flex-1 sm:flex-none">
                  <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-foreground/5 glass border-white/10 text-foreground/60 font-outfit">
                    CLUBES TOP
                  </button>
                </Link>
                <Link href="/search" className="flex-1 sm:flex-none">
                  <button className="w-full h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.03] text-background bg-gradient-to-br from-primary to-primary-dark shadow-xl shadow-primary/20 font-outfit">
                    MAPA VIVO
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* ── ELO SYSTEM ─────────────────── */}
            <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={2} className="space-y-6 snap-start scroll-mt-26">
              <div className="flex items-end justify-between px-1">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl lg:text-2xl font-black italic text-foreground uppercase tracking-tighter leading-none font-kanit">
                    Progreso & Ranking
                  </h2>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] font-outfit">¿CÓMO ESCALAR EN LA LIGA?</span>
                </div>
                <Sparkles className="w-5 h-5 text-primary/30 shrink-0 mb-1 animate-pulse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { icon: Zap, color: '#2cfc7d', glow: 'rgba(44,252,125,0.15)', label: 'Victoria Inicial', points: '+1000', desc: 'Bono masivo por ganar tu primer partido registrado.' },
                  { icon: Target, color: '#f59e0b', glow: 'rgba(245,158,11,0.15)', label: 'Goles Anotados', points: '+100', desc: 'Cada gol informado y validado suma a tu ELO personal.' },
                  { icon: Award, color: '#6366f1', glow: 'rgba(99,102,241,0.15)', label: 'MVP del Partido', points: '+200', desc: 'Ser el más votado por tus compañeros tiene recompensa.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col gap-6 cursor-default glass-premium bg-surface/20"
                  >
                    <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{ background: `radial-gradient(circle at 10% 10%, ${item.glow} 0%, transparent 80%)` }} />

                    <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-2xl"
                      style={{ background: item.glow, border: `1px solid ${item.color}40` }}>
                      <item.icon className="w-7 h-7" style={{ color: item.color }} />
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-lg font-black text-foreground italic uppercase tracking-tighter leading-none font-kanit">{item.label}</h3>
                        <span className="text-2xl font-black italic font-kanit" style={{ color: item.color }}>{item.points}</span>
                      </div>
                      <p className="text-[10px] text-foreground/50 font-black uppercase tracking-widest leading-relaxed font-outfit">{item.desc}</p>
                    </div>

                    <div className="relative z-10 h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 1.5, delay: i * 0.2, ease: 'circOut' }}
                        className="h-full rounded-full opacity-60"
                        style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Rank banner */}
              <motion.div
                whileHover={{ scale: 1.005 }}
                className="relative overflow-hidden rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 glass-premium border-primary/10"
              >
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center shrink-0 border-white/5 shadow-inner">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-foreground italic uppercase tracking-tighter leading-none font-kanit">Tu Carrera Arranca en Hierro</h4>
                    <p className="text-[10px] text-foreground/45 font-black uppercase tracking-[0.2em] mt-1 font-outfit">
                      Subí de nivel dominando el campo de juego.
                    </p>
                  </div>
                </div>
                <Link href="/ranks">
                  <button className="h-12 px-8 rounded-full flex items-center justify-center gap-3 transition-all hover:scale-[1.05] text-white shadow-2xl shadow-primary/20 bg-gradient-to-r from-primary to-primary-dark group">
                    <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:translate-x-[-2px] transition-transform">VER ESCALA</span>
                    <Trophy className="w-4 h-4 text-white fill-white" />
                  </button>
                </Link>
              </motion.div>
            </motion.section>


            {/* ── TEAMS ──────────────────────── */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">Tus Equipos</h2>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">PLANTEL PROFESIONAL</span>
              </div>
              <Link href="/teams"
                className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[9px] font-black text-foreground/55 hover:text-foreground transition-all tracking-[0.2em] uppercase glass border-white/10">
                VER TODOS <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Responsive Horizontal Scroll on Mobile, Grid on Desktop */}
            <div className="flex lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-5 overflow-x-auto pb-6 lg:pb-0 no-scrollbar snap-x snap-mandatory lg:overflow-x-visible -mx-4 px-4 lg:mx-0 lg:px-0">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[280px] lg:min-w-0 h-28 rounded-[2rem] animate-pulse glass border-white/5" />
                ))
              ) : userTeams.length > 0 ? (
                userTeams.map(team => (
                  <Link key={team.id} href={`/team?id=${team.id}`} className="min-w-[280px] lg:min-w-0 snap-center">
                    <motion.div
                      whileHover={{ scale: 1.025, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden rounded-[2rem] p-5 glass-premium-hover bg-surface/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/10 group-hover:border-primary/40 transition-all duration-500 shadow-xl">
                          {team.logo_url
                            ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700" />
                            : <Shield className="w-6 h-6 text-foreground/30 group-hover:text-primary transition-colors" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-foreground text-lg leading-none tracking-tight uppercase truncate font-kanit">
                            {team.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-foreground/40">
                              <Users className="w-3 h-3 text-primary/60" /> {team.members_count}
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-primary">
                              <Trophy className="w-3 h-3" /> {team.elo} XP
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-all duration-500 group-hover:rotate-12" />
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="w-full col-span-full py-14 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 border-2 border-dashed border-foreground/5 bg-foreground/[0.01]">
                  <div className="w-20 h-20 rounded-[2rem] glass flex items-center justify-center shadow-inner">
                    <Users className="w-8 h-8 text-foreground/20" />
                  </div>
                  <div className="space-y-2 max-w-xs">
                    <h3 className="text-xl font-black text-foreground italic uppercase font-kanit">¿Sin Gremio?</h3>
                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] leading-relaxed">
                      Unite a una legión o fundá tu propio club hoy mismo.
                    </p>
                  </div>
                  <Link href="/teams">
                    <button className="h-12 px-10 font-black text-[10px] uppercase tracking-[0.3em] rounded-full bg-primary text-background shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                      BUSCAR CLUB →
                    </button>
                  </Link>
                </div>
              )}
            </div>
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
                  <div key={i} className="h-24 rounded-2xl animate-pulse glass border-white/5" />
                ))
              ) : userMatches.length > 0 ? (
                userMatches.map((match, idx) => (
                  <Link key={match.id} href={`/match?id=${match.id}`}>
                    <motion.div
                      initial={isPerfMode ? { opacity: 1 } : { opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={isPerfMode ? {} : { scale: 1.01, x: -2 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl p-4 transition-all duration-300",
                        match.id === nextMatch?.id
                          ? "bg-primary/[0.03] border-primary/20 shadow-lg shadow-primary/5"
                          : "glass-premium bg-surface/30 border-white/5",
                        isPerfMode && "bg-surface shadow-none border-border"
                      )}
                    >
                      {/* Status indicator */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

                      <div className="flex items-center gap-4 relative z-10">
                        {/* Date/Time Block - Robust Parsing */}
                        <div className={cn(
                          "flex flex-col items-center justify-center min-w-[56px] h-14 rounded-xl glass border-white/10 shadow-sm overflow-hidden bg-foreground/[0.02]",
                          isPerfMode && "bg-background shadow-none border-border"
                        )}>
                          {(() => {
                            try {
                              // Robust parsing to avoid UTC shifting (YYYY-MM-DD)
                              const dateStr = match.date.includes(',') ? match.date.split(',')[1].trim() : match.date;
                              const [year, month, day] = dateStr.includes('-')
                                ? dateStr.split('-').map(Number)
                                : dateStr.split('/').reverse().map(Number); // fallback for DD/MM/YYYY

                              if (!year || !month || !day) throw new Error('Parsing error');

                              const d = new Date(year, month - 1, day);
                              const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
                              const monthName = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
                              const dayNumber = d.getDate();

                              return (
                                <>
                                  <div className="flex flex-col items-center leading-none mt-0.5">
                                    <span className="text-[7px] font-black text-primary/60 uppercase tracking-widest">{dayName}</span>
                                    <span className="text-[9px] font-black text-primary uppercase tracking-wider">{monthName}</span>
                                  </div>
                                  <span className="text-xl font-black text-foreground leading-none font-kanit mt-0.5">
                                    {dayNumber}
                                  </span>
                                </>
                              );
                            } catch (e) {
                              return (
                                <div className="flex flex-col items-center gap-1 opacity-20">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-[8px] font-black uppercase">??</span>
                                </div>
                              );
                            }
                          })()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 text-[7px] font-black rounded bg-primary/10 text-primary uppercase tracking-widest font-outfit border border-primary/10">
                                FÚTBOL {match.type.replace('F', '')}
                              </span>
                              {match.id === nextMatch?.id && (
                                <span className={cn("flex h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]", !isPerfMode && "animate-pulse")} />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground/40">
                              <Clock className="w-3 h-3" />
                              <span className="text-[10px] font-black italic font-kanit uppercase leading-none">
                                {match.id === nextMatch?.id && countdownText ? countdownText : match.time.split(':').slice(0, 2).join(':')}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-black text-foreground text-sm tracking-tight truncate uppercase italic font-kanit group-hover:text-primary transition-colors mb-0.5">
                            {(() => {
                              const venue = findVenueByLocation(match.location);
                              return venue?.displayName || venue?.name || match.location;
                            })()}
                          </h4>

                          <p className="text-foreground/30 text-[9px] font-black uppercase tracking-wider truncate flex items-center gap-1.5 font-outfit">
                            <MapPin className="w-2.5 h-2.5 text-primary/40" /> {match.location}
                          </p>
                        </div>

                        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:bg-primary/10">
                          <ChevronRight className={cn("w-4 h-4 text-foreground/20 group-hover:text-primary transition-all", !isPerfMode && "group-hover:translate-x-0.5")} />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-6 glass border-white/5 border-dashed bg-foreground/[0.01]">
                  <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center shadow-lg transform rotate-3">
                    <Calendar className="w-8 h-8 text-accent/20" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-foreground italic uppercase font-kanit">Agenda Vacía</h3>
                    <p className="text-[9px] text-foreground/40 font-black uppercase tracking-[0.2em] leading-relaxed">
                      No tenés partidos confirmados aún.
                    </p>
                  </div>
                  <Link href="/search" className="w-full">
                    <button className="w-full h-11 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl bg-accent text-white shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
                      BUSCAR PARTIDO
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* ── Quick Links Widget (desktop only) ── */}
            <div className="hidden lg:block glass-premium p-6 rounded-[2rem] space-y-5 border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 font-outfit">SISTEMA & ACCESOS</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Crear Equipo', href: '/teams', icon: PlusCircle },
                  { label: 'Mi Perfil', href: '/profile/me', icon: User2 },
                  { label: 'Ranking', href: '/ranks', icon: Trophy },
                  { label: isPerfMode ? 'MODO: ALTO' : 'MODO: LITE', onClick: togglePerfMode, icon: Zap, active: isPerfMode },
                ].map((link, i) => (
                  link.onClick ? (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={link.onClick}
                      className={cn(
                        "w-full h-14 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all glass border-white/10 flex flex-col items-center justify-center gap-1.5 font-outfit",
                        link.active
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "text-foreground/50 hover:text-foreground"
                      )}
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.label}
                    </motion.button>
                  ) : (
                    <Link key={i} href={link.href!}>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full h-14 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all glass border-white/10 text-foreground/50 hover:text-primary hover:border-primary/20 flex flex-col items-center justify-center gap-1.5 font-outfit"
                      >
                        <link.icon className="w-3.5 h-3.5" />
                        {link.label}
                      </motion.button>
                    </Link>
                  )
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
