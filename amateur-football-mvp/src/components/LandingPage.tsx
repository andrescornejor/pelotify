'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Users, 
  Zap, 
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
  DollarSign,
  BarChart3,
  Calendar,
  Star,
  Medal,
  Flashlight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- FIFA CARD COMPONENT (ULTRA PREMIUM) ---
const FutCard = ({ name = 'JUGADOR', rating = 99, position = 'M C' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, rotateY: 20 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -20, rotateY: 10, rotateX: -5 }}
      className="relative w-full max-w-[340px] aspect-[1/1.5] group perspective-1000 select-none"
    >
      {/* The Glow Aura */}
      <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 group-hover:scale-110 transition-transform duration-1000 opacity-30" />
      
      {/* Card Body */}
      <div className="relative w-full h-full bg-[#080808] border-2 border-primary/40 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
        
        {/* Fut Header Shine */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent" />
        
        {/* Header: Social / Rank Icons */}
        <div className="p-8 pb-0 space-y-1 relative z-10 text-left">
           <div className="flex flex-col items-start">
              <span className="text-[7rem] font-black italic font-kanit text-white leading-[0.7] tracking-tighter drop-shadow-2xl">
                {rating}
              </span>
              <span className="text-xl font-black text-primary uppercase tracking-[0.4em] mt-2 bg-primary/10 px-3 py-1 rounded-lg">
                {position}
              </span>
           </div>
           {/* Club/League Badges (Mock) */}
           <div className="flex flex-col gap-2 mt-4 opacity-40">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                 <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center overflow-hidden">
                 <img src="/logo_pelotify.png" className="w-5 h-5 object-contain" alt="" />
              </div>
           </div>
        </div>

        {/* Player Illustration (The Art) */}
        <div className="flex-1 relative flex items-center justify-center -mt-16">
           {/* Light behind player */}
           <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1/2 bg-primary/20 blur-[80px] rounded-full" />
           
           <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
              <User className="w-full h-full text-white/5 stroke-[0.2] transition-transform duration-700 group-hover:scale-110" />
              
              {/* Name Overlay (Ribbon Style) */}
              <div className="absolute bottom-10 inset-x-0 z-20 flex flex-col items-center">
                 <div className="px-10 py-5 bg-gradient-to-r from-transparent via-primary/20 to-transparent border-y border-primary/30 backdrop-blur-md w-full text-center relative shadow-[0_10px_40px_rgba(44,252,125,0.2)]">
                    <h4 className="text-4xl font-black italic font-kanit text-white uppercase tracking-tighter mix-blend-difference">
                       {name}
                    </h4>
                 </div>
              </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="p-8 pt-0 bg-surface/50 relative z-20 mb-4 h-32 flex flex-col justify-end">
           <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              {[
                { label: 'PAC', val: 99 }, { label: 'DRI', val: 99 },
                { label: 'SHO', val: 99 }, { label: 'DEF', val: 99 },
                { label: 'PAS', val: 99 }, { label: 'PHY', val: 99 }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-1 group/stat">
                   <span className="text-2xl font-black italic font-kanit text-white leading-none">{s.val}</span>
                   <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest group-hover/stat:text-primary transition-colors">{s.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Bottom Bar Accent */}
        <div className="h-2 bg-primary w-full animate-pulse shadow-[0_0_20px_rgba(44,252,125,0.5)]" />
      </div>
      
      {/* Card Shine Reflection */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </motion.div>
  );
};

// --- FEATURE CARD ---
const BentoItem = ({ title, desc, icon: Icon, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8 }}
    whileHover={{ y: -10 }}
    className="p-10 rounded-[3rem] glass-premium border border-white/5 flex flex-col gap-8 relative overflow-hidden group shadow-2xl"
  >
    <div className="w-16 h-16 rounded-[2rem] bg-surface flex items-center justify-center border border-white/5 shadow-inner group-hover:rotate-[360deg] transition-transform duration-1000">
      <Icon className="w-8 h-8 text-primary shadow-glow" />
    </div>
    <div className="space-y-4">
       <h3 className="text-3xl font-black italic font-kanit uppercase tracking-tighter text-white group-hover:text-primary transition-colors">{title}</h3>
       <p className="text-[12px] font-black uppercase tracking-[0.3em] text-white/30 leading-relaxed italic">{desc}</p>
    </div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -z-10 group-hover:bg-primary/20 transition-colors" />
  </motion.div>
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-primary selection:text-black overflow-x-hidden font-sans">
      
      {/* 🟢 TOP NAV BAR (PREMIUM) */}
      <header className="fixed top-0 inset-x-0 h-28 z-[100] px-8 lg:px-24 flex items-center justify-between pointer-events-none">
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-3 pointer-events-auto"
         >
            <div className="h-14 w-14 bg-primary/20 border border-primary/40 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-[0_0_30px_rgba(44,252,125,0.2)]">
               <img src="/logo_pelotify.png" className="w-9 h-9" alt="" />
            </div>
            <span className="text-3xl font-black italic font-kanit uppercase tracking-tighter leading-none">
              PELOTI<span className="text-primary">FY</span>
            </span>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="hidden lg:flex items-center gap-2 glass-premium h-16 px-6 rounded-2xl border border-white/10 pointer-events-auto shadow-2xl"
         >
            {['Torneos', 'Sedes', 'Ranking', 'Soporte'].map((link) => (
               <Link 
                 key={link} 
                 href={link === 'Sedes' ? '/canchas/login' : `/login`} 
                 className="px-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-primary transition-all h-full flex items-center relative group"
               >
                  {link}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
               </Link>
            ))}
            <Link href="/login" className="ml-4">
               <button className="h-10 px-8 bg-primary rounded-xl text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white active:scale-95 transition-all flex items-center gap-2 group">
                  ENTRAR <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </Link>
         </motion.div>
      </header>

      {/* 🔴 HERO SECTION (ABSOLUTE SPECTACLE) */}
      <section className="relative min-h-[105vh] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
         {/* Focal Visuals */}
         <div className="absolute inset-0 -z-10 bg-[#020205]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(44,252,125,0.08)_0%,transparent_70%)]" />
            
            {/* Animated Particles Mock (CSS) */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
               {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      y: [Math.random() * 1000, -200],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: Math.random() * 5 + 5,
                      delay: Math.random() * 10
                    }}
                    className="absolute w-px h-20 bg-gradient-to-t from-transparent via-primary to-transparent"
                    style={{ left: `${Math.random() * 100}%`, top: '100%' }}
                  />
               ))}
            </div>
         </div>

         <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 max-w-7xl pt-20"
         >
            <div className="space-y-8">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-4 px-8 py-3 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl shadow-[0_0_40px_rgba(44,252,125,0.1)]"
               >
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">Operación Victoria : Temp 1</span>
               </motion.div>

               <h1 className="text-[13vw] lg:text-[14rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.7] drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                  LA CANCHA <br /> <span className="text-primary italic animate-glow-pulse [text-shadow:0_0_100px_rgba(44,252,125,0.5)]">PIDE SANGRE.</span>
               </h1>
               
               <p className="text-sm md:text-3xl font-black uppercase tracking-[0.8em] text-white/20 max-w-5xl mx-auto italic pt-16 drop-shadow-lg">
                  Líderes mundiales en fútbol amateur competitivo.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-20">
               <Link href="/register" className="w-full sm:w-auto overflow-visible">
                  <button className="w-full h-28 px-20 bg-primary text-black font-black uppercase text-[20px] tracking-[0.6em] rounded-[2.5rem] shadow-[0_30px_100px_rgba(44,252,125,0.4)] hover:bg-white hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-8 group">
                     <span>UNIRME</span>
                     <ArrowRight className="w-10 h-10 group-hover:translate-x-4 transition-transform duration-500" />
                  </button>
               </Link>
               <Link href="/canchas/login" className="w-full sm:w-auto">
                  <button className="w-full h-28 px-16 border border-white/10 text-white font-black uppercase text-[16px] tracking-[0.5em] rounded-[2.5rem] hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl backdrop-blur-sm">
                     <Users className="w-7 h-7" />
                     <span>SOY DUEÑO</span>
                  </button>
               </Link>
            </div>
         </motion.div>

         <div className="absolute bottom-20 flex flex-col items-center gap-8 opacity-20">
            <span className="text-[11px] font-black uppercase tracking-[1em]">SCROLL TO EXPLORE</span>
            <div className="w-[1.5px] h-32 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
         </div>
      </section>

      {/* 🟡 THE LEGEND SECTION (FIFA CARD SPECTACLE) */}
      <section className="py-60 px-8 lg:px-24 max-w-[1600px] mx-auto relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[200px] -z-10 rounded-full animate-pulse" />
         
         <div className="flex flex-col lg:flex-row items-center gap-32 lg:gap-48 relative">
            {/* The Ultimate FUT Card */}
            <div className="flex-1 w-full flex justify-center perspective-1000 relative">
               <FutCard name="EL MAESTRO" rating={99} position="M C" />
               
               {/* Floating Medals */}
               <motion.div 
                 animate={{ y: [0, -20, 0] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="absolute -top-10 -right-10 p-8 glass-premium rounded-[2.5rem] border border-primary/40 shadow-2xl space-y-3 w-56 scale-75 md:scale-110"
               >
                  <Medal className="w-10 h-10 text-primary shadow-glow" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">MVP STATUS</p>
                  <p className="text-2xl font-black italic font-kanit text-white leading-none tracking-tighter uppercase underline decoration-primary/50">HALL OF FAME</p>
               </motion.div>
            </div>

            {/* Info Side */}
            <div className="flex-1 space-y-16">
               <div className="space-y-8">
                  <div className="flex items-center gap-6 text-primary">
                     <div className="w-20 h-px bg-primary opacity-30" />
                     <p className="text-[12px] font-black uppercase tracking-[0.6em]">ESTÁNDAR DE ÉLITE</p>
                  </div>
                  <h2 className="text-7xl md:text-[8.5rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.75] drop-shadow-2xl">
                     TU PERFIL, <br /> <span className="text-primary italic animate-glow-pulse">TU LEYENDA.</span>
                  </h2>
                  <p className="text-lg md:text-2xl font-black uppercase tracking-[0.3em] text-white/30 leading-[1.6] italic max-w-2xl">
                     Pelotify no es un buscador de canchas. Es el lugar donde tu rendimiento amateur se convierte en **Identidad Profesional**.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-10">
                  {[
                     { icon: Activity, title: 'Rating Vivo', desc: 'Cada gol cuenta para tu ELO global.' },
                     { icon: Star, title: 'Divisiones', desc: 'Escalá desde liga de barrio al profesionalismo.' },
                     { icon: Compass, title: 'Ojeadores', desc: 'Complejos y equipos buscan jugadores elite.' },
                     { icon: LayoutGrid, title: 'Ficha Técnica', desc: 'Stats reales mapeadas por posición.' }
                  ].map((feat, i) => (
                     <div key={i} className="space-y-5 p-10 rounded-[3rem] bg-[#0A0A0F] border border-white/5 hover:border-primary/20 transition-all shadow-xl group">
                        <feat.icon className="w-10 h-10 text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                        <div>
                           <h4 className="text-base font-black uppercase tracking-widest text-white">{feat.title}</h4>
                           <p className="text-[11px] font-black uppercase tracking-widest text-white/20 mt-2 leading-relaxed">{feat.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 🟡 BENTO GRID: THE ECOSYSTEM */}
      <section className="py-40 px-8 lg:px-24 max-w-[1600px] mx-auto space-y-20">
         <div className="text-center space-y-6 mb-24">
            <h2 className="text-5xl md:text-[7rem] font-black font-kanit italic uppercase tracking-tighter leading-none">
               TODO EL PODER. <br /> <span className="text-primary italic">UNA SOLO PANTALLA.</span>
            </h2>
            <p className="text-[12px] font-black text-white/30 uppercase tracking-[1em] italic leading-relaxed">Simplificando el fútbol del domingo.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <BentoItem 
               title="Buscador PRO"
               desc="Ubicá los mejores complejos con amenities certificadas. Filtrá por F5 a F11."
               icon={Search}
               delay={0.1}
            />
            <BentoItem 
               title="Pagos Directos"
               desc="Señá tu turno al instante con Mercado Pago. Sin bots, sin esperas, sin errores."
               icon={Zap}
               delay={0.2}
            />
            <BentoItem 
               title="Club Manager"
               desc="Creá equipos con tus amigos, asigná roles y dominá la tabla de posiciones."
               icon={Shield}
               delay={0.3}
            />
         </div>
      </section>

      {/* 🔴 BUSINESS SECTION: THE HUB FOR VENUES */}
      <section className="py-44 px-8 lg:px-24">
         <div className="max-w-[1600px] mx-auto rounded-[4.5rem] bg-gradient-to-br from-[#0A0A0F] via-black to-[#0A0A0F] border-2 border-primary/20 p-16 lg:p-36 relative overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.8)] group">
            <div className="absolute inset-0 bg-[#020205]/20 backdrop-blur-3xl -z-10" />
            <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-primary/10 blur-[250px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
               <div className="space-y-16">
                  <div className="space-y-10">
                     <div className="h-24 w-24 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-[0_0_50px_rgba(44,252,125,0.2)]">
                        <MapPin className="w-12 h-12 text-primary" />
                     </div>
                     <h2 className="text-6xl md:text-[6.5rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85]">
                        PROFESIONALIZÁ <br /> <span className="text-primary italic">TU NEGOCIO.</span>
                     </h2>
                     <p className="text-lg md:text-3xl font-black uppercase tracking-[0.4em] text-white/35 max-w-2xl leading-relaxed italic">
                        Control total de facturación, agenda digital y exposición ilimitada ante el nicho más grande del país.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
                     <div className="space-y-5 pl-10 border-l-2 border-primary/40 relative">
                        <DollarSign className="w-8 h-8 text-primary" />
                        <h5 className="text-[15px] font-black uppercase tracking-widest text-white">Facturación 24/7</h5>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/25 leading-relaxed">Olvidate del cuadernito. Turnos pagos por adelantado.</p>
                     </div>
                     <div className="space-y-5 pl-10 border-l-2 border-primary/40 relative">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        <h5 className="text-[15px] font-black uppercase tracking-widest text-white">Control de Caja</h5>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/25 leading-relaxed">Reportes diarios de ingresos y proyecciones mensuales.</p>
                     </div>
                  </div>

                  <Link href="/canchas/login" className="inline-block pt-8 overflow-visible">
                     <button className="px-20 h-24 bg-white text-black font-black uppercase text-[15px] tracking-[0.6em] rounded-2xl hover:bg-primary hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-6 group">
                        <span>DAR DE ALTA MI SEDE</span>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                     </button>
                  </Link>
               </div>

               {/* Power Dashboard Mockup (PRO) */}
               <div className="hidden lg:flex justify-center perspective-1000 scale-125">
                  <div className="w-full max-w-md aspect-[1/1] rounded-[4rem] bg-[#0A0A0F] border-2 border-white/5 flex flex-col justify-center p-16 relative shadow-[0_80px_160px_rgba(0,0,0,0.8)] overflow-hidden">
                     <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                     <div className="space-y-12 relative z-10 text-center">
                        <div className="space-y-4">
                           <p className="text-[11px] uppercase font-black tracking-[0.5em] text-white/40">Caja Proyectada : Marzo</p>
                           <p className="text-8xl font-black italic font-kanit text-primary leading-none tracking-tighter drop-shadow-2xl animate-pulse">$1.45M</p>
                        </div>
                        <div className="space-y-6">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="h-4 w-full rounded-full bg-white/[0.05] border border-white/5 overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${Math.random() * 70 + 30}%` }}
                                    transition={{ duration: 2, delay: i * 0.3 }}
                                    className="h-full bg-primary/40 shadow-glow" 
                                 />
                              </div>
                           ))}
                        </div>
                        <div className="pt-8 flex items-center justify-center gap-3">
                           <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/80">SINCRONIZACIÓN DIGITAL OK</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 🔴 FINAL IMPACT CTA */}
      <section className="py-80 px-8 text-center relative overflow-hidden">
         <div className="max-w-7xl mx-auto space-y-24 relative z-10">
            <h2 className="text-8xl md:text-[15rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.7] drop-shadow-[0_40px_100px_rgba(0,0,0,1)] mix-blend-difference">
               EL PARTIDO <br /> PIDE <span className="text-primary italic animate-glow-pulse">DUEÑO.</span>
            </h2>
            <Link href="/register" className="overflow-visible inline-block">
               <button className="px-32 h-32 bg-primary text-black font-black uppercase text-[24px] tracking-[0.6em] rounded-[3rem] shadow-[0_40px_120px_rgba(44,252,125,0.4)] hover:scale-110 active:scale-95 transition-all outline-none">
                  UNIRSE AHORA
               </button>
            </Link>
         </div>
         {/* Background accent extreme */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] bg-primary/10 blur-[250px] rounded-full -z-10 animate-pulse" />
      </section>

      {/* 🟢 FOOTER (MINIMAL ELITE) */}
      <footer className="py-32 px-10 lg:px-24 border-t border-white/5 bg-black relative z-10 overflow-hidden">
         <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-24">
            <div className="space-y-8 max-w-lg text-center lg:text-left">
               <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <img src="/logo_pelotify.png" className="w-10 h-10" alt="" />
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter font-kanit">PELOTIFY</h3>
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 leading-loose">
                  Líderando la evolución del fútbol amateur. Identidad, ranking y gestión totalizada en un ecosistema premium.
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-24 text-[11px] font-black uppercase tracking-[0.5em] text-white/30">
               <div className="flex flex-col gap-6">
                  <Link href="/help" className="hover:text-primary transition-all">Soporte</Link>
                  <Link href="/terms" className="hover:text-primary transition-all">Términos</Link>
               </div>
               <div className="flex flex-col gap-6">
                  <Link href="/canchas/login" className="hover:text-primary transition-all">Sedes</Link>
                  <Link href="/login" className="hover:text-primary transition-all">Login</Link>
               </div>
            </div>
            
            <div className="text-center lg:text-right space-y-6">
               <div className="flex items-center gap-8 justify-center lg:justify-end opacity-20">
                  <Globe className="w-6 h-6 hover:text-primary cursor-pointer transition-colors" />
                  <Medal className="w-6 h-6 hover:text-primary cursor-pointer transition-colors" />
                  <Star className="w-6 h-6 hover:text-primary cursor-pointer transition-colors" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/10 italic">© 2026 PELOTIFY GLOBAL ARCHITECTURE. TOKYO | MADRID | BS AS.</p>
            </div>
         </div>
      </footer>
    </div>
  );
}
