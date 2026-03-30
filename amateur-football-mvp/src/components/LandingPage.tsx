'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  ChevronDown, 
  ArrowRight,
  Globe,
  Star,
  MapPin,
  Shield,
  Search,
  Activity,
  Award,
  Crown,
  Play
} from 'lucide-react';
import Link from 'next/link';

const FeatureCard = ({ icon: Icon, title, description, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8 }}
    whileHover={{ y: -15, scale: 1.02 }}
    className="relative p-10 rounded-[3rem] glass-premium border-white/5 group overflow-hidden"
  >
    {/* Animated background glow */}
    <div 
      className="absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full"
      style={{ backgroundColor: color }}
    />
    
    <div 
      className="w-16 h-16 rounded-[2rem] flex items-center justify-center mb-8 glass border-white/10 shadow-inner group-hover:rotate-[360deg] transition-transform duration-1000"
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon className="w-8 h-8" style={{ color }} />
    </div>
    
    <h3 className="text-2xl font-black italic font-kanit uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40 leading-relaxed group-hover:text-foreground/60 transition-colors">
      {description}
    </p>
    
    <div className="mt-8 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
       <span className="text-[9px] font-black uppercase tracking-widest">DESCUBRIR</span>
       <ArrowRight className="w-4 h-4" />
    </div>
  </motion.div>
);

const RankCard = ({ name, icon: Icon, color, minElo }: any) => (
   <motion.div 
     whileHover={{ scale: 1.05, y: -5 }}
     className="flex flex-col items-center gap-4 p-8 glass-premium rounded-[2.5rem] border-white/5 relative group shrink-0 w-44 shadow-2xl"
   >
      <div 
        className="absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: color }}
      />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-surface border border-white/5 relative z-10">
         <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <div className="text-center relative z-10 space-y-1">
         <span className="block text-sm font-black italic font-kanit uppercase tracking-tighter text-foreground">{name}</span>
         <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-foreground/30">{minElo} ELO</span>
      </div>
   </motion.div>
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-background overflow-x-hidden">
      
      {/* 🟢 NAVIGATION BAR (STAYING TRANSPARENT) */}
      <nav className="fixed top-0 inset-x-0 h-24 z-[100] px-6 lg:px-20 flex items-center justify-between backdrop-blur-sm border-b border-white/5">
         <div className="flex items-center gap-3">
            <img src="/logo_pelotify.png" className="w-10 h-10 object-contain" alt="Pelotify" />
            <span className="text-xl font-black italic uppercase tracking-tighter font-kanit leading-none">PELOTI<span className="text-primary">FY</span></span>
         </div>
         <div className="hidden md:flex items-center gap-10">
            {['Inicia Sesion', 'Registrate', 'Sedes'].map((link) => (
               <Link key={link} href={link === 'Sedes' ? '/canchas' : `/login`} className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-primary transition-colors">
                  {link}
               </Link>
            ))}
         </div>
      </nav>

      {/* 🔴 HERO SECTION (CINEMATIC) */}
      <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center">
         {/* Background Visuals */}
         <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <motion.div style={{ y: yRange }} className="absolute inset-0">
               <img 
                 src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000" 
                 className="w-full h-full object-cover grayscale-[0.8] opacity-20 scale-110" 
                 alt="Stadium"
               />
               <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
            </motion.div>

            {/* Ambient Glows */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[180px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />
         </div>

         {/* Hero Content */}
         <motion.div 
            style={{ opacity, scale }}
            className="relative z-10 space-y-12 max-w-5xl"
         >
            <div className="space-y-6">
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-premium border-primary/20"
               >
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Temporada 1 : Operación Victoria</span>
               </motion.div>

               <h1 className="text-[12vw] lg:text-[10rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  ARMÁ EL <br /> <span className="text-primary italic [text-shadow:0_0_60px_rgba(44,252,125,0.4)]">PARTIDO.</span>
               </h1>

               <p className="text-sm md:text-xl font-black uppercase tracking-[0.5em] text-foreground/40 max-w-2xl mx-auto leading-loose italic">
                  La plataforma definitiva para el fútbol amateur competitivo.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
               <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full px-12 h-20 bg-primary text-background font-black uppercase text-[14px] tracking-[0.4em] rounded-[1.5rem] shadow-[0_20px_60px_rgba(44,252,125,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group">
                     <span>FICHATE AHORA</span>
                     <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                  </button>
               </Link>
               <Link href="/search" className="w-full sm:w-auto">
                  <button className="w-full px-12 h-20 glass-premium border-white/10 text-white font-black uppercase text-[12px] tracking-[0.4em] rounded-[1.5rem] hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-4">
                     <Search className="w-5 h-5" />
                     <span>EXPLORAR SEDES</span>
                  </button>
               </Link>
            </div>
         </motion.div>

         {/* 🖱️ SCROLL INDICATOR */}
         <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
         >
            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.5em]">Deslizar</span>
            <div className="w-8 h-12 rounded-full border-2 border-white/10 flex items-start justify-center p-2">
               <motion.div 
                 animate={{ y: [0, 10, 0] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="w-1.5 h-1.5 rounded-full bg-primary" 
               />
            </div>
            <ChevronDown className="w-5 h-5 text-primary opacity-50" />
         </motion.div>
      </section>

      {/* 🟡 FEATURES GRID (THE EXPERIENCE) */}
      <section className="py-40 px-6 lg:px-20 max-w-[1400px] mx-auto space-y-40">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
               icon={MapPin}
               title="Sedes Oficiales"
               description="Reserva canchas profesionales en segundos. Pago por seña simplificado con Mercado Pago."
               color="#2cfc7d"
               delay={0.1}
            />
            <FeatureCard 
               icon={Trophy}
               title="Ligas de Élite"
               description="Sistema competitivo basado en ELO. Subí de nivel y ganá el respeto de la comunidad."
               color="#fbbf24"
               delay={0.2}
            />
            <FeatureCard 
               icon={Users}
               title="Crea tu Club"
               description="Gestioná tu equipo, fichá amigos y lleva un registro detallado de todas tus victorias."
               color="#3b82f6"
               delay={0.3}
            />
         </div>

         {/* HIGHLIGHT: SEARCH EXPERIENCE */}
         <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="flex-1 space-y-10"
            >
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-primary">
                     <div className="w-12 h-[1px] bg-primary" />
                     <span className="text-[10px] font-black uppercase tracking-[0.5em]">TECNOLOGÍA DE VANGUARDIA</span>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-none">
                     NO PIERDAS <br /> <span className="text-primary italic">EL TURNO.</span>
                  </h2>
                  <p className="text-sm md:text-lg font-black uppercase tracking-[0.3em] text-foreground/40 leading-relaxed italic max-w-xl">
                     Nuestra integración con Google Places te permite encontrar los mejores complejos con precisión absoluta.
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-8 pt-4">
                  {[
                     { label: 'DISPONIBILIDAD', value: 'REAL-TIME', icon: Activity },
                     { label: 'COMPLEJOS', value: 'A NIVEL PAÍS', icon: Globe }
                  ].map((stat) => (
                     <div key={stat.label} className="space-y-4">
                        <stat.icon className="w-6 h-6 text-primary" />
                        <div>
                           <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{stat.label}</p>
                           <p className="text-3xl font-black italic font-kanit text-foreground tracking-tighter">{stat.value}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="flex-1 w-full aspect-square rounded-[4rem] overflow-hidden relative group shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-2 border-white/5"
            >
               <img 
                 src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200" 
                 className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                 alt="App Preview"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
               <div className="absolute inset-x-0 bottom-0 p-12 text-center pointer-events-none">
                  <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Interfaz Optimizada</p>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 🔵 RANKS CAROUSEL (THE GLORY) */}
      <section className="py-40 bg-foreground/[0.02] border-y border-white/5 space-y-20 overflow-hidden">
         <div className="px-6 lg:px-20 space-y-4 text-center">
            <h2 className="text-4xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-none">
               SUBÍ DE <span className="text-primary italic">RANGO.</span>
            </h2>
            <p className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.5em] italic">Del barro a la gloria eterna.</p>
         </div>

         <div className="flex gap-10 px-6 lg:px-20 animate-marquee pause-on-hover whitespace-nowrap">
            {[
               { name: 'HIERRO', icon: Shield, color: '#94a3b8', elo: 0 },
               { name: 'BRONCE', icon: Activity, color: '#d97706', elo: 500 },
               { name: 'PLATA', icon: Target, color: '#CBD5E1', elo: 1000 },
               { name: 'ORO', icon: Trophy, color: '#fbbf24', elo: 1500 },
               { name: 'PLATINO', icon: Award, color: '#2dd4bf', elo: 2000 },
               { name: 'DIAMANTE', icon: Star, color: '#3b82f6', elo: 2500 },
               { name: 'ELITE', icon: Zap, color: '#8b5cf6', elo: 3000 },
               { name: 'MAESTRO', icon: Crown, color: '#f43f5e', elo: 3500 },
               { name: 'PELOTIFY', icon: Zap, color: '#2cfc7d', elo: 4000 },
            ].map((rank) => <RankCard key={rank.name} {...rank} minElo={rank.elo} />)}
            
            {/* Duplicate for infinite loop */}
            {[
               { name: 'HIERRO', icon: Shield, color: '#94a3b8', elo: 0 },
               { name: 'BRONCE', icon: Activity, color: '#d97706', elo: 500 },
               { name: 'PLATA', icon: Target, color: '#CBD5E1', elo: 1000 },
               { name: 'ORO', icon: Trophy, color: '#fbbf24', elo: 1500 },
               { name: 'PLATINO', icon: Award, color: '#2dd4bf', elo: 2000 },
            ].map((rank) => <RankCard key={`${rank.name}-d`} {...rank} minElo={rank.elo} />)}
         </div>
      </section>

      {/* 🔴 FINAL CTA (LAST IMPACT) */}
      <section className="py-60 px-6 text-center space-y-16 relative overflow-hidden">
         {/* Background effect */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-primary/10 blur-[200px] rounded-full -z-10" />
         
         <div className="space-y-6">
            <h2 className="text-6xl md:text-[10rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] mix-blend-difference">
               TU DESTINO <br /> ES EL <span className="text-primary italic [text-shadow:0_0_60px_rgba(44,252,125,0.4)]">GREEN.</span>
            </h2>
            <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.5em] text-foreground/40 italic">La temporada ya empezó. ¿Dónde estás vos?</p>
         </div>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link href="/register">
               <button className="px-20 h-24 bg-primary text-background font-black uppercase text-[16px] tracking-[0.5em] rounded-[2rem] shadow-[0_25px_80px_rgba(44,252,125,0.4)] hover:scale-105 active:scale-95 transition-all">
                  UNIRSE AHORA
               </button>
            </Link>
         </div>

         <div className="pt-20 opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4">
               <Shield className="w-4 h-4" /> REGLAMENTO OFICIAL <Globe className="w-4 h-4" /> FAIR PLAY LIGA
            </p>
         </div>
      </section>

      {/* 🟢 FOOTER (FINAL TOUCH) */}
      <footer className="py-20 px-6 lg:px-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
         <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <img src="/logo_pelotify.png" className="w-12 h-12" alt="Logo" />
               <span className="text-2xl font-black italic uppercase tracking-tighter font-kanit">PELOTIFY</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 leading-relaxed">
               Liderando la revolución del fútbol amateur en todo el país. Domina el ranking, domina la cancha.
            </p>
         </div>
         
         <div className="flex gap-20">
            <div className="space-y-4">
               <span className="block text-[9px] font-black uppercase tracking-widest text-primary">SOPORTE</span>
               <div className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                  <Link href="/help">AYUDA</Link>
                  <Link href="/terms">TÉRMINOS</Link>
                  <Link href="/privacy">PRIVACIDAD</Link>
               </div>
            </div>
            <div className="space-y-4">
               <span className="block text-[9px] font-black uppercase tracking-widest text-primary">REDES</span>
               <div className="flex items-center gap-6 text-foreground/30">
                  <Star className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
                  <Globe className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
                  <Users className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
               </div>
            </div>
         </div>
         
         <div className="text-center md:text-right space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest">© 2026 PELOTIFY INC.</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/20 italic">Designed with Premium Intent.</p>
         </div>
      </footer>
    </div>
  );
}
