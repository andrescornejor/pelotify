'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target as TargetIcon, 
  Users, 
  Zap, 
  ArrowRight,
  Globe,
  MapPin,
  Search,
  Activity,
  Award,
  Sparkles,
  ChevronRight,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { FifaCard } from './FifaCard';

const dummyPlayer = {
  name: "MAESTRO",
  overall: 99,
  position: "M C",
  stats: {
    pac: 92,
    sho: 89,
    pas: 91,
    dri: 85,
    def: 45,
    phy: 78
  },
  mvpTrophies: 3,
  badges: ["Leyenda", "Goleador"],
  image: "https://api.dicebear.com/7.x/notionists/svg?seed=Maestro&backgroundColor=transparent"
};

const venues = [
  { name: "Complejo Ovalo", location: "Zona Centro", types: "F5 • F7", img: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
  { name: "Adiur", location: "Travesía y Sorrento", types: "F5 • F7 • F11", img: "https://images.unsplash.com/photo-1518605368461-1ee066e4d257?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
  { name: "Olimpicus Fútbol", location: "Av. Pellegrini", types: "F5", img: "https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
];

const FeatureBox = ({ title, desc, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ delay, duration: 0.5 }}
    className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:border-primary/40 transition-all duration-500 relative overflow-hidden group shadow-lg backdrop-blur-sm"
  >
    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-[50px] group-hover:bg-primary/20 transition-colors" />
    <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform">
      <Icon className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(44,252,125,0.5)]" />
    </div>
    <h3 className="text-xl font-black italic font-kanit uppercase tracking-tight mb-2 text-white">{title}</h3>
    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 leading-relaxed font-sans">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-primary selection:text-black overflow-x-hidden font-sans scroll-smooth">
      
      {/* 🟢 TOP NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-20 z-[100] px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl">
         <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors shadow-glow">
               <img src="/logo_pelotify.png" className="w-6 h-6 object-contain" alt="Pelotify" />
            </div>
            <span className="text-2xl font-black italic uppercase tracking-tighter font-kanit leading-none">PELOTI<span className="text-primary">FY</span></span>
         </div>

         <div className="hidden md:flex items-center gap-10">
            {['Jugadores', 'Sedes', 'Ranking'].map((link) => (
               <Link key={link} href={link === 'Sedes' ? '/canchas/login' : `/login`} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                  {link}
               </Link>
            ))}
            <Link href="/login">
               <button className="h-10 px-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-primary hover:text-black transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(44,252,125,0.4)]">
                  INGRESAR
               </button>
            </Link>
         </div>
      </nav>

      {/* 🔴 HERO SECTION - HIGH CONVERSION MARKETING */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 pt-20 text-center pb-20">
         <div className="absolute inset-0 -z-10 bg-[#030303] overflow-hidden">
            {/* Massive Glowing Orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[700px] bg-primary/10 blur-[180px] opacity-40 rounded-full" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.04]" />
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-12 max-w-6xl relative z-10 w-full"
         >
            <div className="space-y-6">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md shadow-[0_0_30px_rgba(44,252,125,0.15)]"
               >
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">LA REVOLUCIÓN DEL FÚTBOL AMATEUR ESTÁ AQUÍ</span>
               </motion.div>

               <h1 className="text-6xl md:text-[8rem] lg:text-[11rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white drop-shadow-2xl">
                  PROFESIONALIZA <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">TU PASIÓN.</span>
               </h1>
               
               <p className="text-sm md:text-xl font-bold uppercase tracking-[0.3em] text-zinc-300 max-w-3xl mx-auto pt-8 leading-relaxed">
                  Encuentra predios al instante, reserva seguro con Mercado Pago y forja tu leyenda en el único ranking amateur con estadísticas reales.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
               <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full h-16 px-14 bg-primary text-black font-black uppercase text-[15px] tracking-[0.2em] rounded-[1.5rem] hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(44,252,125,0.4)] group">
                     <span>FICHARME AHORA</span>
                     <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
               </Link>
               <Link href="/canchas/login" className="w-full sm:w-auto">
                  <button className="w-full h-16 px-14 border border-white/20 text-white font-black uppercase text-[14px] tracking-[0.2em] rounded-[1.5rem] hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-3 bg-zinc-900/40 backdrop-blur shadow-xl">
                     <TargetIcon className="w-5 h-5 text-zinc-300" />
                     <span>ACCESO DUEÑOS</span>
                  </button>
               </Link>
            </div>
         </motion.div>

         {/* Smooth Scroll indicator */}
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 flex flex-col items-center gap-4"
         >
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">DESCUBRE MÁS</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
         </motion.div>
      </section>

      {/* 🔵 ESTABLECIMIENTOS REGISTRADOS (THE VENUES SHOWCASE) */}
      <section className="py-32 px-6 lg:px-12 bg-[#050505] relative border-t border-white/5 overflow-hidden">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-900/20 blur-[150px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 blur-[150px] pointer-events-none" />

         <div className="max-w-[1400px] mx-auto space-y-16 relative z-10">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
               <h2 className="text-4xl md:text-6xl font-black font-kanit italic uppercase tracking-tighter text-white">
                  PREDIOS <span className="text-primary tracking-tighter">DE ÉLITE.</span>
               </h2>
               <p className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] leading-loose">
                  Juega en los mejores complejos deportivos de la ciudad. Reserva con disponibilidad garantizada y horarios en vivo.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {venues.map((venue, idx) => (
                  <motion.div 
                     key={idx}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: "-100px" }}
                     transition={{ delay: idx * 0.15, duration: 0.6 }}
                     className="group rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/10 relative shadow-2xl"
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                     <img 
                        src={venue.img} 
                        alt={venue.name} 
                        className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                     />
                     <div className="absolute bottom-0 left-0 right-0 p-8 z-20 space-y-2">
                        <div className="flex justify-between items-end">
                           <div>
                              <div className="flex items-center gap-2 mb-2">
                                 <ShieldCheck className="w-4 h-4 text-primary" />
                                 <span className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2 py-1 rounded-md">Verificado</span>
                              </div>
                              <h3 className="text-3xl font-black italic font-kanit uppercase tracking-tight text-white">{venue.name}</h3>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-300 pt-2 border-t border-white/10 mt-4">
                           <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-zinc-500" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">{venue.location}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">{venue.types}</span>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>

            <div className="flex justify-center pt-8">
               <Link href="/register">
                  <button className="h-14 px-10 border border-primary/50 text-white font-black uppercase text-[12px] tracking-[0.2em] rounded-xl hover:bg-primary hover:text-black transition-colors flex items-center gap-3 group">
                     <span>EXPLORAR TODAS LAS SEDES</span>
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
               </Link>
            </div>
         </div>
      </section>

      {/* 🟡 THE LEGEND (PLAYER IDENTITY - MARKETING) */}
      <section className="py-32 px-6 lg:px-12 max-w-[1400px] mx-auto overflow-hidden relative">
         <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
         
         <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            <div className="flex-1 space-y-10 order-2 lg:order-1">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-primary">
                     <span className="w-10 h-1 bg-primary rounded-full" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] shadow-glow">IDENTIDAD DIGITAL ÚNICA</p>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black font-kanit italic uppercase tracking-tighter leading-[0.9]">
                     RINDE AL MÁXIMO. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">MEJORA TU CARTA.</span>
                  </h2>
                  <p className="text-sm md:text-base font-semibold text-zinc-400 leading-relaxed max-w-lg">
                     No eres solo un jugador de fin de semana. En Pelotify, tu rendimiento forja tu reputación. Nuestro algoritmo calcula tu ELO basándose en victorias, MVPs y estadísticas globales.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                     { icon: Activity, title: 'Rating en Vivo', desc: 'Sube o baja tu Elo Específico.' },
                     { icon: TargetIcon, title: 'Atributos Reales', desc: 'Basado en feedback pospartido.' },
                     { icon: Trophy, title: 'Ranking Global', desc: 'Asciende en el top de tu ciudad.' },
                     { icon: Award, title: 'Recompensas MVP', desc: 'Trofeos para el mejor del campo.' }
                  ].map((feat, i) => (
                     <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-primary/40 hover:bg-zinc-900/80 transition-all duration-300">
                        <feat.icon className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(44,252,125,0.4)]" />
                        <div>
                           <h4 className="text-sm font-black uppercase tracking-wider text-white">{feat.title}</h4>
                           <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mt-2">{feat.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* PLAYER CARD HIGHLIGHT */}
            <div className="flex-1 w-full flex justify-center order-1 lg:order-2 perspective-1000 relative">
               <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 -z-10" />
               <div className="scale-110 sm:scale-125 lg:scale-150 transform-gpu z-10 my-10 lg:my-20 group">
                 <div className="animate-float">
                   <FifaCard player={dummyPlayer} />
                 </div>
               </div>
            </div>
         </div>
      </section>

      {/* 🟡 BENTO GRID (THE FEATURES) */}
      <section className="py-32 px-6 lg:px-12 bg-[#020202] border-y border-white/5 overflow-hidden">
         <div className="max-w-[1400px] mx-auto space-y-16">
            <div className="text-center md:text-left md:flex justify-between items-end gap-8 mb-16">
               <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black font-kanit italic uppercase tracking-tighter">
                     TU ECOSISTEMA <span className="text-primary">FUTBOLERO.</span>
                  </h2>
                  <p className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] max-w-2xl">
                     Herramientas diseñadas para que organizar tu partido sea tan emocionante como jugarlo.
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FeatureBox 
                  title="Buscador Inteligente"
                  desc="Filtrá predios por tipo de césped, techado, amenities y disponibilidad de franjas horarias 100% reales."
                  icon={Search}
                  delay={0.1}
               />
               <FeatureBox 
                  title="Reservas & Mercado Pago"
                  desc="Paga la seña sin salir de la app de forma ultra segura. Cuentas claras, sin transferencias dudosas."
                  icon={Zap}
                  delay={0.2}
               />
               <FeatureBox 
                  title="Armado de Planteles"
                  desc="Gestos de equipos, estadísticas por club y transferencias globales en la red de jugadores amateur."
                  icon={Users}
                  delay={0.3}
               />
            </div>
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

      {/* 🔴 FINAL CTA BLOCK */}
      <section className="py-40 px-6 text-center border-t border-white/5 relative bg-[#020202]">
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[150px]" />
         
         <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            <h2 className="text-5xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-none drop-shadow-2xl">
               SAL A LA <span className="text-primary hover:text-white transition-colors cursor-default">CANCHA.</span>
            </h2>
            <p className="text-sm md:text-xl font-bold uppercase tracking-[0.3em] text-zinc-400">
               EL ENCUENTRO EMPIEZA ANTES DEL PITAZO INICIAL.
            </p>
            <div className="pt-8">
               <Link href="/register" className="inline-block">
                  <button className="px-16 h-24 bg-primary text-black font-black uppercase text-xl tracking-[0.3em] rounded-3xl hover:scale-105 active:scale-95 transition-all outline-none shadow-[0_0_50px_rgba(44,252,125,0.4)] group flex items-center gap-6">
                     <span>FICHÁ TÚ CUENTA</span>
                     <Smartphone className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                  </button>
               </Link>
            </div>
         </div>
      </section>

      {/* 🟢 FOOTER */}
      <footer className="py-16 px-6 lg:px-12 border-t border-white/5 bg-black">
         <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <img src="/logo_pelotify.png" className="w-8 h-8 opacity-80" alt="" />
                  <span className="text-xl font-black italic uppercase tracking-tighter font-kanit text-white">PELOTIFY</span>
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  PLATAFORMA INTEGRAL PARA EL FÚTBOL AMATEUR
               </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
               <Link href="/help" className="hover:text-primary transition-colors">Soporte</Link>
               <Link href="/terms" className="hover:text-primary transition-colors">Legales</Link>
               <Link href="/canchas/login" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Sedes
               </Link>
               <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
            </div>
            
            <div className="text-center md:text-right space-y-3">
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">© 2026 PELOTIFY.</p>
               <div className="flex items-center justify-center md:justify-end gap-3 opacity-40">
                  <Globe className="w-4 h-4" />
                  <TargetIcon className="w-4 h-4" />
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
