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
  Play,
  CreditCard,
  BarChart3,
  Calendar,
  MessageSquare,
  Sparkles,
  DollarSign
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

const FifaCardMockup = () => (
   <motion.div 
     initial={{ rotateY: 30, rotateX: 10 }}
     whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05 }}
     className="relative w-64 h-96 rounded-[2rem] bg-gradient-to-b from-primary via-primary-dark to-black p-0.5 shadow-[0_30px_60px_rgba(44,252,125,0.3)] group perspective-1000"
   >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      <div className="w-full h-full bg-surface-bright rounded-[1.95rem] overflow-hidden flex flex-col relative">
         {/* Rank Badge */}
         <div className="absolute top-6 left-6 z-20 flex flex-col items-center">
            <span className="text-4xl font-black italic font-kanit text-primary leading-none">99</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-primary">PELOTIFY</span>
         </div>
         
         {/* Avatar Mask */}
         <div className="flex-1 flex items-center justify-center p-6 mt-4">
            <div className="w-full h-full rounded-[2rem] bg-surface-elevated overflow-hidden border border-white/5 shadow-2xl relative">
               <img src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="Player" />
               <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <span className="text-2xl font-black italic font-kanit text-white uppercase tracking-tighter">EL MAESTRO</span>
               </div>
            </div>
         </div>

         {/* Stats */}
         <div className="p-6 bg-surface grid grid-cols-3 gap-2 border-t border-white/5">
            {[
               { label: 'VEL', val: 95 },
               { label: 'TIR', val: 99 },
               { label: 'PAS', val: 88 }
            ].map(s => (
               <div key={s.label} className="text-center">
                  <p className="text-[8px] font-black text-foreground/30">{s.label}</p>
                  <p className="text-xl font-black italic font-kanit text-primary leading-none">{s.val}</p>
               </div>
            ))}
         </div>
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

      {/* 🔴 FEATURES GRID (THE EXPERIENCE) */}
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

         {/* 🔴 FIFA CARDS SECTION: PLAYER IDENTITY */}
         <div className="flex flex-col-reverse lg:flex-row items-center gap-20">
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="flex-1 flex justify-center"
            >
               <FifaCardMockup />
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="flex-1 space-y-10"
            >
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-primary">
                     <div className="w-12 h-[1px] bg-primary" />
                     <span className="text-[10px] font-black uppercase tracking-[0.5em]">IDENTIDAD DIGITAL</span>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-none">
                     TU PERFIL, <br /> <span className="text-primary italic">TU LEYENDA.</span>
                  </h2>
                  <p className="text-sm md:text-lg font-black uppercase tracking-[0.3em] text-foreground/40 leading-relaxed italic max-w-xl">
                     Convertí tu historial de juego en una **FIFA Card** dinámica. Posición, pierna hábil, edad y altura: todo importa para el ranking oficial de Pelotify.
                  </p>
               </div>
               
               <div className="space-y-6">
                  {[
                     { icon: Activity, title: 'Estadísticas en Tiempo Real', desc: 'Tu ELO sube o baja con cada resultado.' },
                     { icon: Medal, title: 'Vitrina de Logros', desc: 'Coleccioná MVPs y medallas de torneo.' }
                  ].map((item, i) => (
                     <div key={i} className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-xl bg-surface border border-white/5 flex items-center justify-center shrink-0">
                           <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{item.title}</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{item.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
         </div>

         {/* 🔴 VENUE MANAGEMENT: BUSINESS SIDE */}
         <div className="rounded-[4rem] glass-premium p-12 lg:p-24 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(44,252,125,0.05),transparent)] pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
               <div className="space-y-10">
                  <div className="space-y-6">
                     <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(44,252,125,0.1)]">
                        <MapPin className="w-10 h-10 text-primary shadow-glow" />
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black font-kanit italic uppercase tracking-tighter leading-none">
                        EL ALIADO DE <br /> <span className="text-primary">TU COMPLEJO.</span>
                     </h2>
                     <p className="text-sm md:text-xl font-black uppercase tracking-[0.3em] text-foreground/40 leading-relaxed italic">
                        Pelotify no solo trae jugadores, te da el control total de tu negocio desde la palma de tu mano.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {[
                        { icon: DollarSign, title: 'Pagos Directos', desc: 'Recibí señas y totales directo a tu Mercado Pago.' },
                        { icon: Calendar, title: 'Agenda Digital', desc: 'Olvidate del cuaderno. Turnos síncronizados 24/7.' },
                        { icon: BarChart3, title: 'Análisis Financiero', desc: 'Reportes diarios de ingresos y ocupación.' },
                        { icon: MessageSquare, title: 'Opiniones Reales', desc: 'Gestioná reseñas y mejorá tu reputación.' }
                     ].map((box, i) => (
                        <div key={i} className="space-y-3 p-6 rounded-3xl bg-surface/50 border border-white/5 hover:border-primary/20 transition-all">
                           <box.icon className="w-6 h-6 text-primary" />
                           <h5 className="text-[11px] font-black uppercase tracking-widest text-foreground">{box.title}</h5>
                           <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 leading-relaxed">{box.desc}</p>
                        </div>
                     ))}
                  </div>

                  <Link href="/canchas" className="inline-block mt-4">
                     <button className="px-12 h-16 bg-foreground text-background font-black uppercase text-[12px] tracking-[0.4em] rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group">
                        <span>REGISTRAR MI SEDE</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                     </button>
                  </Link>
               </div>

               <div className="flex items-center justify-center">
                  <div className="relative w-full aspect-square max-w-sm">
                     {/* Dashboard Mockup Elements */}
                     <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="p-6 glass-premium rounded-3xl border-primary/40 absolute -top-4 -right-4 z-20 shadow-2xl space-y-3 w-48"
                     >
                        <BarChart3 className="w-6 h-6 text-primary" />
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">INGRESOS NETOS</p>
                        <p className="text-2xl font-black italic font-kanit text-white">$145.200</p>
                     </motion.div>
                     
                     <div className="w-full h-full rounded-[4rem] bg-surface-elevated overflow-hidden border border-white/10 shadow-inner relative group">
                        <img 
                          src="https://images.unsplash.com/photo-1529900948638-19f94ff446a1?auto=format&fit=crop&q=80&w=800" 
                          className="w-full h-full object-cover grayscale opacity-20" 
                          alt="Sede" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-12">
                           <div className="w-full space-y-4">
                              {[1, 2, 3].map(row => (
                                 <div key={row} className="h-4 bg-white/5 rounded-full w-full overflow-hidden">
                                    <motion.div 
                                       initial={{ width: 0 }}
                                       whileInView={{ width: `${Math.random() * 80 + 20}%` }}
                                       className="h-full bg-primary/30" 
                                    />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 🔴 RANKS CAROUSEL (THE GLORY) */}
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
            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               className="flex items-center justify-center gap-3 mb-8"
            >
               <Sparkles className="w-5 h-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Beta Cerrada Finalizada</span>
               <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <h2 className="text-6xl md:text-[10rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] mix-blend-difference">
               TU DESTINO <br /> ES EL <span className="text-primary italic [text-shadow:0_0_60px_rgba(44,252,125,0.4)]">GREEN.</span>
            </h2>
            <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.5em] text-foreground/40 italic italic">La temporada ya empezó. ¿Dónde estás vos?</p>
         </div>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link href="/register">
               <button className="px-20 h-24 bg-primary text-background font-black uppercase text-[16px] tracking-[0.5em] rounded-[2rem] shadow-[0_25px_80px_rgba(44,252,125,0.4)] hover:scale-105 active:scale-95 transition-all">
                  UNIRSE AHORA
               </button>
            </Link>
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

const Medal = ({ className, style }: any) => (
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
   </svg>
);
