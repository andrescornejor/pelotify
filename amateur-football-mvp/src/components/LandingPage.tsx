'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  ChevronDown, 
  ArrowRight,
  Globe,
  MapPin,
  Shield,
  Search,
  Activity,
  Award,
  Crown,
  CreditCard,
  BarChart3,
  Calendar,
  MessageSquare,
  Sparkles,
  DollarSign,
  ChevronRight,
  User,
  Plus,
  Compass,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- COMPONENTS ---

const PlayerCard = ({ name = 'JUGADOR', rating = 0, position = 'M C' }) => (
  <motion.div 
    whileHover={{ y: -20, rotateY: 5, rotateX: -5 }}
    className="relative w-full max-w-[340px] aspect-[1/1.4] rounded-[3rem] p-0.5 bg-gradient-to-b from-primary/40 via-transparent to-primary/10 border border-primary/20 shadow-[0_0_80px_rgba(44,252,125,0.15)] group overflow-hidden perspective-1000"
  >
    <div className="absolute inset-0 bg-[#070707] rounded-[2.9rem] flex flex-col p-8 z-10">
      {/* Top Left: Rating & Meta */}
      <div className="space-y-1">
        <h3 className="text-7xl font-black italic font-kanit text-white leading-none tracking-tighter">{rating}</h3>
        <p className="text-primary font-black uppercase tracking-[0.2em] text-sm ml-1">{position}</p>
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center mt-2 opacity-30">
           <Shield className="w-4 h-4" />
        </div>
        <p className="text-white/20 font-black text-xl ml-1 mt-1">{rating}</p>
      </div>

      {/* Center: Character Illustration (Using a placeholder that matches the vibe) */}
      <div className="flex-1 flex items-center justify-center relative -mt-10">
        <div className="w-full h-full relative">
           <img 
             src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-m7fU0qfPjTzKzH9fL7yR8f4rS7Z7vB.png" 
             alt="Player Illustration"
             className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700 select-none pointer-events-none"
             style={{ 
               maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
             }}
           />
        </div>
      </div>

      {/* Name Ribbon */}
      <div className="absolute left-0 right-0 top-[65%] py-4 bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-white/5 backdrop-blur-sm">
         <h4 className="text-center text-3xl font-black italic font-kanit text-white uppercase tracking-tighter">
            {name}
         </h4>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-auto pt-10">
         {[
           { label: 'PAC', val: 0 },
           { label: 'DRI', val: 0 },
           { label: 'SHO', val: 0 },
           { label: 'DEF', val: 0 },
           { label: 'PAS', val: 0 },
           { label: 'PHY', val: 0 },
         ].map((s, i) => (
           <div key={i} className="flex items-center justify-between group/stat">
             <span className="text-2xl font-black italic font-kanit text-white leading-none">{s.val}</span>
             <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-40 group-hover/stat:opacity-100 transition-opacity">{s.label}</span>
           </div>
         ))}
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity -z-10" />
    </div>

    {/* Decorative Border Glow */}
    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </motion.div>
);

const BentoItem = ({ title, desc, icon: Icon, className, delay = 0 }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "relative rounded-[2.5rem] p-8 lg:p-12 overflow-hidden glass-premium border border-white/5 group",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 group-hover:bg-primary/10 transition-colors" />
      <div className="w-16 h-16 rounded-2xl bg-surface border border-white/5 flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform">
        <Icon className="w-8 h-8 text-primary shadow-glow" />
      </div>
      <h3 className="text-3xl font-black italic font-kanit uppercase tracking-tighter mb-4 text-white group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 leading-relaxed max-w-sm italic">
        {desc}
      </p>
    </motion.div>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-primary selection:text-black overflow-x-hidden">
      
      {/* 🟢 NAVBAR (MINIMAL & FLOATING) */}
      <nav className="fixed top-8 inset-x-6 lg:inset-x-20 z-[100] flex items-center justify-between">
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-3 glass-premium px-6 h-16 rounded-2xl border border-white/10"
         >
            <img src="/logo_pelotify.png" className="w-8 h-8 object-contain" alt="Logo" />
            <span className="text-xl font-black italic uppercase tracking-tighter font-kanit leading-none">PELOTI<span className="text-primary">FY</span></span>
         </motion.div>
         
         <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="hidden md:flex items-center gap-2 glass-premium px-4 h-16 rounded-2xl border border-white/10"
         >
            {['Jugadores', 'Sedes', 'Ranking'].map((link) => (
               <Link 
                 key={link} 
                 href={link === 'Sedes' ? '/canchas/login' : `/login`} 
                 className="px-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-colors h-full flex items-center"
               >
                  {link}
               </Link>
            ))}
            <Link href="/login">
               <button className="h-10 px-8 bg-primary rounded-xl text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white transition-all flex items-center gap-2">
                  ENTRAR <ChevronRight className="w-4 h-4" />
               </button>
            </Link>
         </motion.div>
      </nav>

      {/* 🔴 HERO SECTION (ABSOLUTE IMPACT) */}
      <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
         {/* Background Visuals */}
         <div className="absolute inset-0 -z-10">
            <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0">
               <img 
                 src="https://images.unsplash.com/photo-1556056504-517173f4aa0b?auto=format&fit=crop&q=80&w=2000" 
                 className="w-full h-full object-cover grayscale opacity-20 scale-105" 
                 alt="Soccer Pitch Detail"
               />
               <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#020205]/80 to-[#020205]" />
               {/* Animated Background Lines */}
               <div className="absolute inset-0 overflow-hidden opacity-5">
                  <div className="grid grid-cols-12 h-full gap-px">
                     {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-full border-x border-white/5" />
                     ))}
                  </div>
               </div>
            </motion.div>
            {/* Focal Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-primary/20 blur-[200px] rounded-full animate-glow-pulse" />
         </div>

         <motion.div 
           style={{ opacity: heroOpacity, scale: heroScale }}
           className="relative z-10 space-y-12"
         >
            <div className="space-y-4">
               <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md"
               >
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Operación Victoria : Temp 1</span>
               </motion.div>

               <h1 className="text-[12vw] lg:text-[14rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.75] mix-blend-difference">
                  LA CANCHA <br /> <span className="text-primary italic animate-pulse [text-shadow:0_0_80px_rgba(44,252,125,0.3)]">ES TUYA.</span>
               </h1>
               
               <p className="text-sm md:text-xl font-black uppercase tracking-[0.7em] text-white/30 max-w-3xl mx-auto italic pt-8">
                  FICHATE EN LA RED DE FÚTBOL AMATEUR MÁS GRANDE.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12">
               <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full h-24 px-16 bg-primary text-black font-black uppercase text-[16px] tracking-[0.4em] rounded-[2rem] shadow-[0_25px_80px_rgba(44,252,125,0.4)] hover:scale-105 hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-6 group">
                     <span>FICHARME</span>
                     <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                  </button>
               </Link>
               <Link href="/canchas/login" className="w-full sm:w-auto">
                  <button className="w-full h-24 px-16 glass-premium border border-white/20 text-white font-black uppercase text-[14px] tracking-[0.4em] rounded-[2rem] hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-4">
                     <Users className="w-6 h-6" />
                     <span>SOY DUEÑO</span>
                  </button>
               </Link>
            </div>
         </motion.div>

         {/* Scroll Indicator */}
         <motion.div 
           animate={{ y: [0, 10, 0] }}
           transition={{ repeat: Infinity, duration: 2.5 }}
           className="absolute bottom-12 flex flex-col items-center gap-4 opacity-30 group"
         >
            <span className="text-[9px] font-black uppercase tracking-[0.6em] group-hover:text-primary transition-colors">Bajar</span>
            <div className="w-[1.5px] h-20 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
         </motion.div>
      </section>

      {/* 🟡 THE IDENTITY SECTION (THE CORE) */}
      <section className="py-40 px-6 lg:px-20 max-w-[1400px] mx-auto overflow-visible">
         <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-40">
            {/* Visual Side: The FIFA Card */}
            <div className="flex-1 w-full flex justify-center perspective-1000 relative">
               <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full opacity-30 animate-glow-pulse" />
               <PlayerCard rating={99} name="EL MAESTRO" position="M C" />
               
               {/* Floating Badges */}
               <motion.div 
                 animate={{ y: [0, -20, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                 className="absolute -top-10 -right-10 lg:-right-20 p-6 glass-premium rounded-3xl border border-primary/40 shadow-2xl space-y-2 w-48 scale-75 md:scale-100"
               >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                     <Award className="w-4 h-4 text-black" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">MVP DE LA FECHA</p>
                  <p className="text-xl font-black italic font-kanit text-white leading-none tracking-tighter">PREMIUM RANKED</p>
               </motion.div>
            </div>

            {/* Info Side */}
            <div className="flex-1 space-y-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-primary">
                     <span className="w-12 h-[1px] bg-primary" />
                     <p className="text-[10px] font-black uppercase tracking-[0.5em]">IDENTIDAD PROFESIONAL</p>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-[0.8]">
                     CONVERTITE EN <br /> <span className="text-primary">LEYENDA.</span>
                  </h2>
                  <p className="text-sm md:text-xl font-black uppercase tracking-[0.3em] text-white/40 leading-loose italic max-w-xl">
                     Tu rendimiento en la cancha genera tu propia **FIFA Card** oficial de Pelotify. Goles, asistencias y victorias definen tu rating global.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
                  {[
                     { icon: Activity, title: 'Rating Dinámico', desc: 'Tu carta evoluciona tras cada partido jugado.' },
                     { icon: Trophy, title: 'Sube de División', desc: 'Desde liga de barro hasta el Top 100 nacional.' },
                     { icon: Compass, title: 'Mercado de Fichajes', desc: 'Equipos buscan gente con tus especificaciones.' },
                     { icon: LayoutGrid, title: 'Specs Personalizadas', desc: 'Posición, altura, edad y pierna hábil.' }
                  ].map((feat, i) => (
                     <div key={i} className="space-y-4 p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:border-primary/20 transition-all group">
                        <feat.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        <div>
                           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/80">{feat.title}</h4>
                           <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">{feat.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 🟡 FEATURES BENTO (THE ECOSYSTEM) */}
      <section className="py-20 px-6 lg:px-20 max-w-[1400px] mx-auto space-y-10">
         <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-none">
               TODO EL FÚTBOL. <br /> <span className="text-primary italic">UN SOLO LUGAR.</span>
            </h2>
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic leading-relaxed">Simplificando la experiencia deportiva amateur.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-8">
            <BentoItem 
               className="col-span-1 md:col-span-6 lg:col-span-8 bg-[url('https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center"
               icon={MapPin}
               title="Sedes Certificadas"
               desc="Buscá los mejores complejos con precisión absoluta mediante geolocalización."
               delay={0.1}
            />
            <BentoItem 
               className="col-span-1 md:col-span-3 lg:col-span-4"
               icon={Zap}
               title="Pagos Flash"
               desc="Señá tu partido en segundos con Mercado Pago integrado."
               delay={0.2}
            />
            <BentoItem 
               className="col-span-1 md:col-span-3 lg:col-span-4"
               icon={MessageSquare}
               title="Reviews Reales"
               desc="Opiniones de jugadores para garantizar calidad en cada turno."
               delay={0.3}
            />
            <BentoItem 
               className="col-span-1 md:col-span-6 lg:col-span-8 overflow-hidden"
               icon={Users}
               title="Social Hub"
               desc="Creá equipos, armá chats y mantené a tu gente lista para el domingo."
               delay={0.4}
            />
         </div>
      </section>

      {/* 🟡 BUSINESS SECTION: POWER FOR VENUES */}
      <section className="py-40 px-6 lg:px-20">
         <div className="relative rounded-[4rem] overflow-hidden bg-gradient-to-br from-[#0a0a0f] to-background border border-primary/10 p-12 lg:p-32 group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 blur-[200px] rounded-full group-hover:bg-primary/20 transition-colors" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-12 text-center lg:text-left">
                  <div className="space-y-6">
                     <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 shadow-glow mx-auto lg:mx-0">
                        <Globe className="w-10 h-10 text-primary" />
                     </div>
                     <h2 className="text-5xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white">
                        DIGITALIZÁ <br /> <span className="text-primary italic">TU SEDE.</span>
                     </h2>
                     <p className="text-sm md:text-xl font-black uppercase tracking-[0.4em] text-white/40 italic leading-relaxed">
                        Control total sobre tus canchas, cobros directos y exposición masiva. Pelotify es el sistema operativo de tu complejo.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                     {[
                        { icon: DollarSign, title: 'Cobro por Seña', desc: 'Ingreso asegurado al momento de la reserva.' },
                        { icon: Calendar, title: 'Gestión 24/7', desc: 'Panel administrativo para controlar tus turnos.' },
                        { icon: BarChart3, title: 'Métricas de Oro', desc: 'Sabé cuánta plata entra cada día con reportes.' },
                        { icon: Plus, title: 'Configuración Total', desc: 'Precios dinámicos para F5, F7 y F11.' }
                     ].map((item, i) => (
                        <div key={i} className="space-y-3">
                           <item.icon className="w-6 h-6 text-primary/80" />
                           <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{item.title}</h5>
                           <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{item.desc}</p>
                        </div>
                     ))}
                  </div>

                  <Link href="/canchas/login" className="inline-block">
                     <button className="px-16 h-20 bg-white text-black font-black uppercase text-[12px] tracking-[0.5em] rounded-2xl hover:bg-primary hover:scale-105 transition-all flex items-center gap-4">
                        ALTA DE ESTABLECIMIENTO <ArrowRight className="w-5 h-5" />
                     </button>
                  </Link>
               </div>

               <div className="hidden lg:flex items-center justify-center relative scale-110">
                  <div className="w-full max-w-md aspect-square bg-surface border border-white/5 rounded-[4rem] flex items-center justify-center p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent select-none pointer-events-none" />
                     <div className="z-10 w-full space-y-6">
                        {/* Mockup Dashboard Rows */}
                        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                           <div className="space-y-2">
                              <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Facturación Hoy</p>
                              <p className="text-3xl font-black italic font-kanit text-white">$45.800</p>
                           </div>
                           <BarChart3 className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-4">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="h-12 w-full glass-premium rounded-xl border-white/5 flex items-center px-6 justify-between">
                                 <div className="flex gap-4 items-center">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <div className="w-20 h-2 bg-white/10 rounded-full" />
                                 </div>
                                 <div className="w-12 h-2 bg-white/20 rounded-full" />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 🔴 FINAL CTA (THE ENTRANCE) */}
      <section className="py-60 px-6 text-center space-y-20 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/10 blur-[200px] rounded-full -z-10" />
         
         <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-[10rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] mix-blend-difference">
               EL PARTIDO <br /> EMPIEZA <span className="text-primary italic animate-pulse">ACÁ.</span>
            </h2>
            <p className="text-sm md:text-xl font-black uppercase tracking-[0.6em] text-white/30 italic">¿ESTÁS LISTO PARA EL SIGUIENTE NIVEL?</p>
         </div>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link href="/register" className="w-full sm:w-auto">
               <button className="w-full px-20 h-28 bg-primary text-black font-black uppercase text-xl tracking-[0.5em] rounded-[2.5rem] shadow-[0_30px_100px_rgba(44,252,125,0.4)] hover:scale-110 active:scale-95 transition-all">
                  UNIRSE AHORA
               </button>
            </Link>
         </div>
      </section>

      {/* 🟢 FOOTER */}
      <footer className="py-20 px-6 lg:px-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 bg-black">
         <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <img src="/logo_pelotify.png" className="w-12 h-12" alt="Logo" />
               <h3 className="text-3xl font-black italic uppercase tracking-tighter font-kanit">PELOTIFY</h3>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 leading-relaxed text-center md:text-left">
               Escalando el fútbol amateur a estándares profesionales. Geolocalización, ranking y gestión total.
            </p>
         </div>
         
         <div className="flex flex-col md:flex-row gap-12 md:gap-20 text-center md:text-left">
            <div className="space-y-6">
               <span className="block text-[10px] font-black uppercase tracking-widest text-primary">RECURSOS</span>
               <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <Link href="/help">AYUDA</Link>
                  <Link href="/terms">TÉRMINOS</Link>
                  <Link href="/privacy">PRIVACIDAD</Link>
               </div>
            </div>
            <div className="space-y-6">
               <span className="block text-[10px] font-black uppercase tracking-widest text-primary">BUSINESS</span>
               <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <Link href="/canchas/login">Canchas</Link>
                  <Link href="/login">Precios</Link>
               </div>
            </div>
         </div>
         
         <div className="text-center md:text-right space-y-4">
            <div className="flex items-center gap-4 justify-center md:justify-end opacity-20">
               <Globe className="w-6 h-6 hover:text-primary transition-colors cursor-pointer" />
               <Search className="w-6 h-6 hover:text-primary transition-colors cursor-pointer" />
               <Users className="w-6 h-6 hover:text-primary transition-colors cursor-pointer" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">© 2026 PELOTIFY GLOBAL SYSTEMS. INC.</p>
         </div>
      </footer>
    </div>
  );
}
