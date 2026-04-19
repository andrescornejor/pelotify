'use client';

import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronDown, Crown, Shield, Target, Sparkles, Activity, Info, Star, Flame, Zap, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RANKS, getRankByElo } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { RankBadge } from '@/components/RankBadge';
import { supabase } from '@/lib/supabase';

/* ─── Rank Global Config ─── */
const RANK_DETAILS: Record<string, { desc: string; tagline: string; color: string }> = {
  HIERRO: { desc: 'Donde nacen las promesas. El barro y la pasión se juntan aquí.', tagline: 'EL COMIENZO', color: '#64748b' },
  BRONCE: { desc: 'Has dejado de ser un principiante. La consistencia es tu mejor aliada.', tagline: 'JUGADOR REGULAR', color: '#92400e' },
  PLATA: { desc: 'Tu técnica es respetada. Ya no te miran como a uno más.', tagline: 'POTENCIAL PURO', color: '#94a3b8' },
  ORO: { desc: 'La élite de los barrios. El jugador que todos quieren en su equipo.', tagline: 'CRACKS DEL BARRIO', color: '#ca8a04' },
  PLATINO: { desc: 'Dominio absoluto. El balón baila a tu ritmo en cada partido.', tagline: 'MAESTRO DEL BALÓN', color: '#0ea5e9' },
  DIAMANTE: { desc: 'La joya de la corona. Un talento que solo se ve una vez por torneo.', tagline: 'TALENTO PURO', color: '#22d3ee' },
  ELITE: { desc: 'Solo el 1%. Tu nombre ya es leyenda antes de empezar el juego.', tagline: 'EL TOP ABSOLUTO', color: '#10b981' },
  LEYENDA: { desc: 'Inmortalidad. Has trascendido los límites de Pelotify.', tagline: 'DIOS DE LA CANCHA', color: '#f59e0b' },
};

/* ─── Mouse Interactive Glow ─── */
const MouseGlow = memo(({ isMobile }: { isMobile: boolean }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isMobile]);

  if (isMobile) return null;

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
});

MouseGlow.displayName = 'MouseGlow';

/* ─── RANK CARD COMPONENT ─── */
const RankCard = memo(({ rank, detail, index, isMobile, isExpanded, onToggle }: any) => {
  const isLeft = index % 2 !== 0;
  
  return (
    <div className={cn("flex w-full mb-24 sm:mb-32", isLeft ? "justify-start pl-2 sm:pl-4 lg:pl-20" : "justify-end pr-2 sm:pr-4 lg:pr-20")}>
      <motion.div
        initial={isMobile ? { opacity: 0, y: 30 } : { opacity: 0, x: isLeft ? -100 : 100 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: isMobile ? "-50px" : "-100px" }}
        whileHover={isMobile ? {} : { scale: 1.05 }}
        onClick={onToggle}
        className={cn(
          "relative group cursor-pointer w-full max-w-[280px] sm:max-w-[320px] p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] backdrop-blur-xl border border-foreground/5 shadow-2xl transition-all duration-500",
          isExpanded ? "bg-foreground/[0.04]" : "bg-foreground/[0.01]"
        )}
      >
        <div className="absolute -top-10 -left-6 sm:-top-12 sm:-left-12 group-hover:rotate-12 transition-transform duration-500">
          <div className="relative">
            <RankBadge rankName={rank.name} size={isMobile ? "lg" : "xl"} />
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity" />
          </div>
        </div>

        <div className="pt-6 sm:pt-8 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter" style={{ color: rank.color }}>{rank.name}</h3>
            <ChevronDown className={cn("w-5 h-5 text-foreground/20 transition-transform", isExpanded && "rotate-180")} />
          </div>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">{detail.tagline}</span>
          <p className="text-[11px] sm:text-xs text-foreground/50 leading-relaxed font-medium mb-4 italic">"{detail.desc}"</p>
          <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full" style={{ background: rank.color }} />
          </div>
          <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-black uppercase text-foreground/20 tracking-widest">
            <span>Requerido</span>
            <span>{rank.minElo.toLocaleString()} XP</span>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-4 border-t border-foreground/5 mt-4">
              <p className="text-[10px] sm:text-[11px] font-bold text-foreground/40 italic flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Alcanzá este rango para subir en el ranking mundial.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

RankCard.displayName = 'RankCard';

/* ─── PLAYER CARD COMPONENT ─── */
const PlayerCard = memo(({ player, index }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 hover:border-primary/20 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 text-3xl sm:text-4xl font-black italic opacity-[0.03] group-hover:opacity-10 transition-opacity">#{index + 1}</div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-foreground/10 group-hover:border-primary/50 transition-all">
          <img src={player.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}`} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter truncate">{player.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <RankBadge rankName={getRankByElo(player.elo).name} size="sm" />
            <span className="text-[10px] font-black text-foreground/40">{player.elo.toLocaleString()} XP</span>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 pt-4 border-t border-foreground/5 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-foreground/20">Posición</span>
          <span className="text-xs font-black italic text-foreground/60">{player.position || 'Versátil'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase text-foreground/20">Partidos</span>
          <span className="text-xs font-black italic text-foreground/60">{player.matches || 0}</span>
        </div>
      </div>
    </motion.div>
  );
});

PlayerCard.displayName = 'PlayerCard';

/* ─── MAIN PAGE ─── */
export default function RanksPage() {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ranks' | 'leaderboard'>('ranks');
  const [expandedRank, setExpandedRank] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, elo, matches, position')
          .order('elo', { ascending: false })
          .limit(15);
        if (!error) setTopPlayers(data || []);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/30" ref={containerRef}>
      <div ref={topRef} className="absolute top-0 left-0 w-full h-px pointer-events-none" />
      <MouseGlow isMobile={isMobile} />
      
      {/* ── BACKGROUND ORNAMENTS ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             
        {/* Floating Tactic Icons (Scattered) */}
        {[...Array(isMobile ? 4 : 12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.01, 0.03, 0.01],
              y: isMobile ? [0, -40, 0] : [0, -100, 0],
              x: isMobile ? [0, 0, 0] : [0, i % 2 === 0 ? 50 : -50, 0]
            }}
            transition={{ 
              duration: isMobile ? 10 + i * 5 : 15 + i * 2, 
              repeat: Infinity, 
              ease: 'linear', 
              delay: i * 1 
            }}
            className="absolute text-foreground font-black italic text-4xl select-none"
            style={{ 
              left: `${(i * 27) % 100}%`, 
              top: `${(i * 37) % 100}%`,
              filter: `blur(${i % 3 === 0 ? '4px' : '0px'})`
            }}
          >
            {i % 3 === 0 ? 'X' : i % 3 === 1 ? 'O' : '→'}
          </motion.div>
        ))}

        {/* Cinematic Light Beams */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full rotate-45" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full -rotate-45" />
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-12 pb-16 px-4 text-center space-y-8 z-10 overflow-hidden">
        {/* Background Side Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex justify-between px-10 items-center">
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="hidden xl:block">
              <Shield className="w-64 h-64 -translate-x-1/2" />
           </motion.div>
           <motion.div animate={{ rotate: -360 }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }} className="hidden xl:block">
              <Activity className="w-64 h-64 translate-x-1/2" />
           </motion.div>
        </div>
        
        {/* Abstract Tactics / Patterns on sides */}
        <div className="absolute top-20 left-0 w-40 h-80 opacity-5 hidden lg:block">
           <svg viewBox="0 0 100 200" width="100%" height="100%" className="text-foreground">
             <path d="M 10 10 L 90 90 M 10 90 L 90 10" stroke="currentColor" strokeWidth="2" />
             <circle cx="50" cy="150" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
             <path d="M 50 130 L 50 170" stroke="currentColor" strokeWidth="2" />
           </svg>
        </div>
        <div className="absolute top-20 right-0 w-40 h-80 opacity-5 hidden lg:block">
           <svg viewBox="0 0 100 200" width="100%" height="100%" className="text-foreground">
             <path d="M 50 50 L 50 150 M 10 100 L 90 100" stroke="currentColor" strokeWidth="2" />
             <rect x="20" y="20" width="60" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
           </svg>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
          <Flame className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary">Camino a la Gloria</span>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-6xl sm:text-8xl font-black italic uppercase tracking-tighter leading-tight text-gradient">
          Escalá tu <br /><span className="text-gradient-primary text-glow-primary">Legado</span>
        </motion.h1>
      </section>

      {/* ── Tabs ── */}
      <div className="sticky top-[80px] z-[50] flex justify-center mb-16 px-4">
        <div className="p-1.5 rounded-full bg-foreground/[0.04] backdrop-blur-xl border border-foreground/10 flex gap-2 shadow-2xl">
          {['ranks', 'leaderboard'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={cn(
                'relative px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500',
                activeTab === t ? 'text-background' : 'text-foreground/40 hover:text-foreground/60'
              )}
            >
              {activeTab === t && (
                <motion.div layoutId="tab-pill" className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/20" />
              )}
              <span className="relative z-10">{t === 'ranks' ? 'El Camino' : 'Top Mundual'}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-32 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'ranks' && (
            <motion.div key="ranks-path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-[150vh]">
              
              {/* ── THE ZIG-ZAG PATH ── */}
              <div className="relative">
                {/* SVG Path Background */}
                <div className="absolute inset-0 flex justify-center pointer-events-none overflow-visible">
                  <svg width="400" height="auto" className="h-full w-full max-w-[80vw] opacity-10" viewBox="0 0 100 800" preserveAspectRatio="none">
                    <path
                      d="M 50 0 C 100 100, 0 100, 50 200 C 100 300, 0 300, 50 400 C 100 500, 0 500, 50 600 C 100 700, 0 700, 50 800"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  
                    {/* Glowing Animated Path */}
                    <svg width="400" height="auto" className="h-full w-full max-w-[80vw] absolute inset-0" viewBox="0 0 100 800" preserveAspectRatio="none">
                      <motion.path
                        d="M 50 0 C 100 100, 0 100, 50 200 C 100 300, 0 300, 50 400 C 100 500, 0 500, 50 600 C 100 700, 0 700, 50 800"
                        fill="none"
                        stroke="url(#gradient-path)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{ pathLength: isMobile ? scrollYProgress : pathLength }}
                      />
                      <defs>
                        <linearGradient id="gradient-path" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--primary)" />
                          <stop offset="100%" stopColor="var(--primary-dark)" />
                        </linearGradient>
                      </defs>
                    </svg>
                </div>

                {/* ── CINEMATIC INTRO: THE STARTING LINE ── */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="pt-20 pb-40 text-center relative"
                >
                  {/* Atmospheric Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col items-center gap-10">
                     <motion.div 
                        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="p-8 rounded-[3rem] bg-foreground/[0.03] border border-foreground/10 backdrop-blur-xl relative group"
                     >
                        <Shield className="w-32 h-32 text-primary/80 drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]" />
                        <div className="absolute -inset-4 border-2 border-dashed border-primary/20 rounded-[3.5rem] animate-spin-slow pointer-events-none" />
                     </motion.div>

                     <div className="space-y-6 max-w-3xl mx-auto px-4">
                        <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-glow-primary">
                          Comienza tu <br /> <span className="text-primary-light">Ascenso</span>
                        </h2>
                        
                        {/* Interactive Guide Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                           {[
                             { icon: Target, title: 'Ganar', desc: 'Cada victoria suma puntos directos a tu ELO.' },
                             { icon: Zap, title: 'Golear', desc: 'Tu desempeño individual acelera el progreso.' },
                             { icon: Star, title: 'Votos MVP', desc: 'El respeto de tus rivales es el mayor impulso.' }
                           ].map((item, i) => (
                             <motion.div 
                                key={i}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="p-6 rounded-[2rem] bg-foreground/[0.03] border border-foreground/5 text-left space-y-3"
                             >
                                <item.icon className="w-6 h-6 text-primary" />
                                <h4 className="text-sm font-black italic uppercase text-foreground">{item.title}</h4>
                                <p className="text-[10px] font-medium text-foreground/40 leading-relaxed">{item.desc}</p>
                             </motion.div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Connecting Line Down */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-primary/50 to-transparent" />
                </motion.div>

                {/* Rank Items along the Zig-Zag */}
                <div className="relative z-10 space-y-[-20px] sm:space-y-[-40px]">
                  {RANKS.map((rank, i) => (
                    <RankCard
                      key={rank.name}
                      rank={rank}
                      detail={RANK_DETAILS[rank.name]}
                      index={i}
                      isMobile={isMobile}
                      isExpanded={expandedRank === i}
                      onToggle={() => setExpandedRank(expandedRank === i ? null : i)}
                    />
                  ))}
                </div>

                {/* ── FINAL GRAND FINALE: THE PORTAL TO IMMORTALITY ── */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, margin: "-100px" }}
                  className="mt-60 pb-40 text-center relative"
                >
                  {/* Intense Radial Glows */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/10 blur-[80px] rounded-full pointer-events-none animate-pulse" />

                  {/* The Trophy Portal */}
                  <div className="relative z-10 flex flex-col items-center gap-12">
                     <motion.div 
                        animate={{ 
                          y: [0, -20, 0],
                          rotateY: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 8, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="relative"
                     >
                        <Trophy className="w-40 h-40 sm:w-64 sm:h-64 text-primary drop-shadow-[0_0_60px_rgba(var(--primary-rgb),0.5)]" />
                        {/* Orbiting particles */}
                        <div className="absolute inset-0">
                           {[...Array(8)].map((_, i) => (
                             <motion.div 
                                key={i}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-20%] flex items-center justify-start pointer-events-none"
                             >
                                <div className="w-2 h-2 bg-accent rounded-full blur-[2px] shadow-[0_0_10px_#f59e0b]" />
                             </motion.div>
                           ))}
                        </div>
                     </motion.div>

                     <div className="space-y-4 max-w-2xl mx-auto px-4">
                        <h2 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter text-glow-primary">
                          Inmortalidad <br /> <span className="text-primary-light">Confirmada</span>
                        </h2>
                        <p className="text-foreground/40 text-sm sm:text-base font-semibold leading-relaxed">
                          Has llegado al final de la escala, pero el viaje de una Leyenda recién comienza. 
                          Solo los inmortales dominan el ranking mundial de Pelotify.
                        </p>
                     </div>

                     <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(var(--primary-rgb), 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary text-background px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] italic shadow-xl shadow-primary/20 transition-all group overflow-hidden relative"
                     >
                        <span className="relative z-10 flex items-center gap-3">
                           Construí tu Legado <ArrowLeft className="rotate-180 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                     </motion.button>

                     <div className="pt-20 pb-10">
                        <motion.button 
                          onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}
                          whileHover={{ y: -8, scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                           <div className="w-16 h-16 rounded-full border-2 border-foreground/10 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all duration-500">
                              <ChevronUp className="w-8 h-8 group-hover:text-primary transition-colors" />
                           </div>
                           <span className="text-xs font-black uppercase tracking-[0.3em] text-foreground/40 group-hover:text-primary transition-colors">Regresar a la Cima</span>
                        </motion.button>
                     </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div key="top-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12 pt-12">
               {isLoading ? (
                 <div className="p-20 flex flex-col items-center justify-center gap-4">
                   <Target className="w-12 h-12 text-primary animate-spin" />
                   <span className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20">Sincronizando Ranking...</span>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topPlayers.map((p, idx) => (
                      <PlayerCard key={p.id} player={p} index={idx} />
                    ))}
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-40">
         <p className="text-[8px] font-black uppercase tracking-[0.8em] text-foreground">Escalá hasta la Leyenda</p>
      </div>
    </div>
  );
}

const RadarChart = ({ player, size = 60, color = "#2cfc7d" }: any) => {
  const stats = [0.7, 0.8, 0.6, 0.9, 0.75];
  const points = stats.map((s, i) => {
    const angle = (i * 2 * Math.PI) / stats.length - Math.PI / 2;
    const r = (s * size) / 2;
    return `${size / 2 + r * Math.cos(angle)},${size / 2 + r * Math.sin(angle)}`;
  });
  return (
    <svg width={size} height={size} className="opacity-40">
      <polygon points={points.join(' ')} fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
    </svg>
  );
};
