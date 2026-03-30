'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  Sparkles,
  ChevronRight,
  User,
  Plus,
  Compass,
  LayoutGrid,
  CreditCard,
  Target as TargetIcon,
  DollarSign,
  BarChart3,
  Calendar,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- COMPONENTS ---

const PlayerCard = ({ name = 'JUGADOR', rating = 88, position = 'M C' }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative w-full max-w-[320px] aspect-[1/1.45] rounded-[2.5rem] bg-[#0A0A0F] border border-primary/40 shadow-[0_0_80px_rgba(44,252,125,0.15)] flex flex-col p-8 group perspective-1000"
  >
    {/* FIFA Pattern Mesh */}
    <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
       <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(44,252,125,0.1)_0%,transparent_60%)]" />
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
    </div>
    
    {/* Header Info */}
    <div className="relative z-10 space-y-0.5">
       <span className="text-8xl font-black italic font-kanit text-white leading-none tracking-tighter block drop-shadow-2xl">{rating}</span>
       <span className="text-primary font-black uppercase tracking-[0.4em] text-sm block ml-1">{position}</span>
       <div className="mt-4 flex items-center gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
          <Shield className="w-4 h-4 text-white" />
          <Award className="w-4 h-4 text-primary" />
       </div>
    </div>

    {/* Center Character (Optimized and Reliable) */}
    <div className="flex-1 relative flex items-center justify-center -mt-10 overflow-visible">
       <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0F] to-transparent z-10" />
          <div className="relative z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700">
             <User className="w-48 h-48 text-white/5 stroke-[0.3]" />
             <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full scale-50 group-hover:scale-100 transition-transform duration-1000" />
          </div>
       </div>
    </div>

    {/* Name Ribbon (The Classic Look) */}
    <div className="absolute left-0 right-0 top-[60%] py-4 bg-gradient-to-r from-transparent via-primary/10 to-transparent border-y border-primary/20 backdrop-blur-md z-20 overflow-hidden shadow-2xl">
       <div className="absolute inset-0 bg-primary/5 animate-pulse" />
       <h4 className="text-center text-4xl font-black italic font-kanit text-white uppercase tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] relative z-10">
          {name}
       </h4>
    </div>

    {/* 6 Grid Stats (FIFA Standard) */}
    <div className="grid grid-cols-2 gap-x-10 gap-y-4 pt-14 px-1 relative z-10 mt-auto">
       {[
         { label: 'VEL', val: 92 }, { label: 'REG', val: 85 },
         { label: 'REM', val: 89 }, { label: 'DEF', val: 45 },
         { label: 'PAS', val: 91 }, { label: 'FIS', val: 78 }
       ].map((s, i) => (
         <div key={i} className="flex items-center justify-between border-b border-white/5 pb-1 group/stat hover:border-primary/40 transition-colors">
           <span className="text-2xl font-black italic font-kanit text-white leading-none tracking-tighter drop-shadow-sm">{s.val}</span>
           <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest group-hover/stat:text-primary transition-colors">{s.label}</span>
         </div>
       ))}
    </div>

    {/* Hover Accent */}
    <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-white/10 group-hover:ring-primary/40 transition-all pointer-events-none" />
  </motion.div>
);

const FeatureBox = ({ title, desc, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className="p-8 rounded-[2.5rem] bg-[#0A0A0F] border border-white/5 hover:border-primary/20 transition-all relative overflow-hidden group shadow-2xl"
  >
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-[50px] group-hover:bg-primary/20 transition-colors" />
    <div className="w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-2xl font-black italic font-kanit uppercase tracking-tighter mb-3 text-white">{title}</h3>
    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 leading-relaxed italic">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-primary selection:text-black overflow-x-hidden font-sans scroll-smooth">
      
      {/* 🟢 TOP NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-24 z-[100] px-6 lg:px-20 flex items-center justify-between backdrop-blur-lg border-b border-white/5 bg-[#020205]/40">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(44,252,125,0.2)]">
               <img src="/logo_pelotify.png" className="w-6 h-6 object-contain" alt="" />
            </div>
            <span className="text-3xl font-black italic uppercase tracking-tighter font-kanit leading-none">PELOTI<span className="text-primary">FY</span></span>
         </div>

         <div className="hidden md:flex items-center gap-10">
            {['Torneos', 'Sedes', 'Ranking'].map((link) => (
               <Link key={link} href={link === 'Sedes' ? '/canchas/login' : `/login`} className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 hover:text-primary transition-colors">
                  {link}
               </Link>
            ))}
            <Link href="/login">
               <button className="h-14 px-10 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                  ENTRAR
               </button>
            </Link>
         </div>
      </nav>

      {/* 🔴 HERO SECTION (ABSOLUTE IMPACT: TYPOGRAPHY + CSS GRADIENTS) */}
      <section className="relative min-h-[105vh] flex flex-col items-center justify-center px-6 pt-20 text-center">
         {/* Optimized Background (CSS Mesh instead of massive images) */}
         <div className="absolute inset-0 -z-10 bg-[#020205]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-h-[800px] max-w-[1200px] bg-primary/10 blur-[200px] rounded-full animate-pulse opacity-40 shrink-0" />
            <div className="absolute inset-0 overflow-hidden opacity-5">
               <div className="grid grid-cols-12 h-full gap-px">
                  {Array.from({ length: 12 }).map((_, i) => (
                     <div key={i} className="h-full border-x border-white/5" />
                  ))}
               </div>
            </div>
            {/* Focal Point Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(44,252,125,0.05)_0%,transparent_70%)]" />
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 max-w-7xl relative z-10"
         >
            <div className="space-y-6">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md"
               >
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">OPERACIÓN VICTORIA : TEMP 1</span>
               </motion.div>

               <h1 className="text-[14vw] lg:text-[15rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.7] drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] mix-blend-difference">
                  LA CANCHA <br /> <span className="text-primary italic animate-pulse [text-shadow:0_0_80px_rgba(44,252,125,0.4)]">ES TUYA.</span>
               </h1>
               
               <p className="text-sm md:text-2xl font-black uppercase tracking-[1em] text-white/20 max-w-4xl mx-auto italic pt-12 animate-slide-up-fade">
                  EL FÚTBOL AMATEUR EN OTRO NIVEL.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12 overflow-visible">
               <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full h-24 px-16 bg-primary text-black font-black uppercase text-[18px] tracking-[0.5em] rounded-[2.5rem] shadow-[0_20px_80px_rgba(44,252,125,0.5)] hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group">
                     <span>FICHARME</span>
                     <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform duration-500" />
                  </button>
               </Link>
               <Link href="/canchas/login" className="w-full sm:w-auto">
                  <button className="w-full h-24 px-16 border border-white/10 text-white font-black uppercase text-[15px] tracking-[0.4em] rounded-[2.5rem] hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl">
                     <Users className="w-6 h-6" />
                     <span>SOY DUEÑO</span>
                  </button>
               </Link>
            </div>
         </motion.div>

         {/* Scroll Indicator (Refined) */}
         <div className="absolute bottom-16 flex flex-col items-center gap-6 opacity-30 select-none">
            <span className="text-[10px] font-black uppercase tracking-[1em]">SCROLL</span>
            <div className="w-[1.5px] h-24 bg-gradient-to-b from-primary via-primary/50 to-transparent animate-shimmer" />
         </div>
      </section>

      {/* 🟡 SECTION: THE LEGEND (PLAYER CARD PERFORMANCE) */}
      <section className="py-52 px-6 lg:px-20 max-w-[1500px] mx-auto overflow-visible relative">
         <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10 rounded-full" />
         
         <div className="flex flex-col lg:flex-row items-center gap-24 lg:gap-48">
            {/* CARD CONTAINER: Optimized Perspective */}
            <div className="flex-1 w-full flex justify-center perspective-1000">
               <PlayerCard name="MAESTRO" rating={99} position="M C" />
            </div>

            {/* INFO WRAPPER */}
            <div className="flex-1 space-y-14">
               <div className="space-y-8">
                  <div className="flex items-center gap-6 text-primary">
                     <span className="w-16 h-px bg-primary opacity-40" />
                     <p className="text-[11px] font-black uppercase tracking-[0.6em]">REPUTACIÓN & STATUS</p>
                  </div>
                  <h2 className="text-6xl md:text-9xl font-black font-kanit italic uppercase tracking-tighter leading-[0.8] drop-shadow-lg">
                     TU PROPIA <br /> <span className="text-primary">PELOTIFY CARD.</span>
                  </h2>
                  <p className="text-sm md:text-xl font-black uppercase tracking-[0.4em] text-white/30 leading-relaxed italic max-w-xl">
                     Tu desempeño define tu ficha. Goles, victorias y el respeto de la liga se reflejan en tu rating global.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {[
                     { icon: Activity, title: 'Rating Vivo', desc: 'Sube y baja tras cada partido oficial.' },
                     { icon: TargetIcon, title: 'Atributos Pro', desc: 'Fuerza, regate, velocidad y pase real.' },
                     { icon: Trophy, title: 'Liga Elite', desc: 'Competí para entrar al Top Ranking.' },
                     { icon: Award, title: 'MVPs Reales', desc: 'Sumá medallas por cada actuación destacada.' }
                  ].map((feat, i) => (
                     <div key={i} className="p-8 rounded-[2.5rem] bg-[#0A0A0F] border border-white/5 space-y-4 hover:border-primary/20 transition-all shadow-xl">
                        <feat.icon className="w-7 h-7 text-primary" />
                        <div>
                           <h4 className="text-sm font-black uppercase tracking-widest text-white">{feat.title}</h4>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-1">{feat.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 🟡 SECTION: FEATURES (THE BENTO GRID ECOSYSTEM) */}
      <section className="py-40 px-6 lg:px-20 max-w-[1500px] mx-auto space-y-16">
         <div className="text-center mb-28 space-y-6">
            <h2 className="text-5xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-none">
               DOMINÁ EL <span className="text-primary italic">RANKING.</span>
            </h2>
            <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.8em] italic leading-loose">TODO LO QUE EL JUGADOR AMATEUR NECESITA.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            <FeatureBox 
               title="Buscador PRO"
               desc="Sedes verificadas con geolocalización. Filtrá por tipo de césped, amenities y disponibilidad real."
               icon={Search}
               delay={0.1}
            />
            <FeatureBox 
               title="Payments Seguros"
               desc="Señá tu turno al instante con Mercado Pago. Olvidate de las señas por transferencia."
               icon={Zap}
               delay={0.2}
            />
            <FeatureBox 
               title="Hub Social"
               desc="Creá equipos, armá planteles y desafiá a otros clubes de tu ciudad."
               icon={Users}
               delay={0.3}
            />
         </div>
      </section>

      {/* 🔴 MARKETING PARA DUEÑOS (SELLING TO VENUE OWNERS) */}
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden bg-[#050505]">
         <div className="max-w-[1400px] mx-auto rounded-[3rem] bg-zinc-900 border border-white/10 p-10 lg:p-20 relative overflow-hidden shadow-2xl">
            {/* Owner Section Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-10">
                  <div className="space-y-6">
                     <div className="inline-flex h-14 px-6 rounded-xl bg-black border border-primary/30 items-center justify-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">PARA DUEÑOS DE PREDIOS</span>
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black font-kanit italic uppercase tracking-tighter leading-none">
                        MÁXIMA <span className="text-white">OCUPACIÓN.</span><br/>
                        <span className="text-primary text-5xl md:text-7xl">CERO FRICCIONES.</span>
                     </h2>
                     <p className="text-sm md:text-base font-semibold text-zinc-400 max-w-md leading-relaxed">
                        Lleva tu complejo al siguiente nivel. Pelotify es el software definitivo para gestionar tus canchas. Adiós a las reservas fantasma de WhatsApp.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-y border-white/10 py-8">
                     <div className="space-y-3 pl-4 border-l-2 border-primary/50">
                        <DollarSign className="w-6 h-6 text-primary" />
                        <h5 className="text-sm font-black uppercase tracking-wider text-white">Protege tu Caja</h5>
                        <p className="text-xs font-semibold text-zinc-500 leading-relaxed">Señas automatizadas con MercadoPago directo a tu cuenta bancaria.</p>
                     </div>
                     <div className="space-y-3 pl-4 border-l-2 border-primary/50">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        <h5 className="text-sm font-black uppercase tracking-wider text-white">Métricas de Poder</h5>
                        <p className="text-xs font-semibold text-zinc-500 leading-relaxed">Reportes de ingresos mensuales, franjas pico y retorno de clientes.</p>
                     </div>
                  </div>

                  <Link href="/canchas/login" className="inline-block pt-2">
                     <button className="px-10 h-16 bg-white text-black font-black uppercase text-sm tracking-widest rounded-xl hover:bg-primary transition-colors flex items-center gap-4 shadow-xl">
                        <span>ACCEDER AL PANEL PRO</span>
                        <ChevronRight className="w-5 h-5" />
                     </button>
                  </Link>
               </div>

               {/* Gorgeous Dashboard Mockup */}
               <div className="hidden lg:flex justify-end p-8 perspective-1000">
                  <div className="w-full max-w-md aspect-[4/5] rounded-[2.5rem] bg-[#050505] border border-white/10 flex flex-col p-8 relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] transform rotate-y-[-10deg] hover:rotate-y-0 transition-transform duration-700">
                     <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                     <div className="flex items-center justify-between mb-8">
                        <span className="text-xs font-black uppercase tracking-widest text-white">PANEL DE CONTROL</span>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                     </div>
                     
                     <div className="space-y-6 flex-1">
                        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/5 space-y-3">
                           <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Recaudación (Hoy)</p>
                           <p className="text-4xl font-black italic font-kanit text-white">$450.000</p>
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">+14.2%</span>
                           </div>
                        </div>

                        <div className="space-y-4 pt-4">
                           <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Turnos Ocupados</p>
                           {[1, 2, 3, 4].map(i => (
                              <div key={i} className="flex items-center gap-4">
                                 <span className="text-xs font-bold text-zinc-500 w-10 text-right">{18 + i}:00</span>
                                 <div className="h-3 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                                    <motion.div 
                                       initial={{ width: 0 }}
                                       whileInView={{ width: '100%' }}
                                       transition={{ duration: 1, delay: i * 0.15 }}
                                       className="h-full bg-primary" 
                                    />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                     
                     <div className="mt-8 flex items-center justify-center p-4 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" /> SEDE VERIFICADA
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 🔴 FINAL CTA (LAST IMPACT) */}
      <section className="py-72 px-6 text-center overflow-hidden">
         <div className="max-w-6xl mx-auto space-y-20 relative z-10">
            <h2 className="text-7xl md:text-[14rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.7] drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
               TU DESTINO <br /> ES EL <span className="text-primary italic animate-pulse [text-shadow:0_0_80px_rgba(44,252,125,0.4)]">GREEN.</span>
            </h2>
            <Link href="/register">
               <button className="px-28 h-28 bg-primary text-black font-black uppercase text-[20px] tracking-[0.6em] rounded-[2.5rem] shadow-[0_30px_100px_rgba(44,252,125,0.4)] hover:scale-110 active:scale-95 transition-all outline-none">
                  UNIRSE AHORA
               </button>
            </Link>
         </div>
         {/* Background accent */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1000px] max-h-[1000px] bg-primary/10 blur-[200px] rounded-full -z-10 animate-pulse" />
      </section>

      {/* 🟢 FOOTER (CLEAN & PRO) */}
      <footer className="py-24 px-6 lg:px-20 border-t border-white/5 bg-[#020205] relative z-10">
         <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="space-y-6 max-w-sm text-center md:text-left">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <img src="/logo_pelotify.png" className="w-12 h-12" alt="" />
                  <span className="text-3xl font-black italic uppercase tracking-tighter font-kanit">PELOTIFY</span>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 leading-loose">
                  LIDERANDO LA REVOLUCIÓN DEL FÚTBOL AMATEUR. PRECISIÓN, RANKING Y GESTIÓN INTEGRAL.
               </p>
            </div>
            
            <div className="flex gap-20 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
               <div className="flex flex-col gap-5">
                  <Link href="/help" className="hover:text-primary transition-colors">Ayuda</Link>
                  <Link href="/terms" className="hover:text-primary transition-colors">Legales</Link>
               </div>
               <div className="flex flex-col gap-5">
                  <Link href="/canchas/login" className="hover:text-primary transition-colors">Sedes</Link>
                  <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
               </div>
            </div>
            
            <div className="text-center md:text-right space-y-3">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">© 2026 PELOTIFY GLOBAL SYSTEMS.</p>
               <div className="flex items-center gap-4 justify-center md:justify-end opacity-20 group">
                  <Globe className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <TargetIcon className="w-5 h-5 group-hover:text-primary transition-colors" />
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
