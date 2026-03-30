'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  Shield, 
  ChevronRight, 
  ArrowRight,
  Globe,
  Star,
  ZapOff,
  MapPin,
  Calendar,
  Lock,
  Search
} from 'lucide-react';
import Link from 'next/link';

const FeatureCard = ({ icon: Icon, title, description, color }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="p-8 rounded-[2.5rem] glass-premium border-white/5 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16 rounded-full group-hover:bg-primary/10 transition-colors" />
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-surface border border-white/5 shadow-inner`}>
      <Icon className="w-7 h-7" style={{ color }} />
    </div>
    <h3 className="text-xl font-black italic font-kanit uppercase tracking-tighter mb-3">{title}</h3>
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-10 px-4 sm:px-10 lg:px-20">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center space-y-12">
        {/* Ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 opacity-20 hidden lg:block">
           <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
           <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 mb-4"
        >
          <img src="/logo_pelotify.png" alt="Pelotify Logo" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(44,252,125,0.4)]" />
        </motion.div>

        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-9xl font-black font-kanit italic tracking-tighter leading-[0.8] uppercase"
          >
            LA CANCHA <br /> <span className="text-primary [text-shadow:0_0_40px_rgba(44,252,125,0.3)]">ES TUYA.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[11px] md:text-sm font-black uppercase tracking-[0.5em] text-foreground/40 max-w-xl mx-auto leading-loose"
          >
            La red definitiva de fútbol amateur. Buscá sedes, armá equipos y competí por la gloria en el ranking nacional.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 w-full max-w-lg"
        >
          <Link href="/register" className="flex-1">
            <button className="w-full h-16 bg-primary text-black font-black uppercase text-[12px] tracking-[0.4em] rounded-2xl shadow-[0_15px_40px_rgba(44,252,125,0.3)] hover:scale-105 active:scale-95 transition-all">
               FICHATE AHORA
            </button>
          </Link>
          <Link href="/login" className="flex-1">
            <button className="w-full h-16 glass-premium border-white/10 text-white font-black uppercase text-[12px] tracking-[0.4em] rounded-2xl hover:bg-white/5 active:scale-95 transition-all">
               INICIAR SESIÓN
            </button>
          </Link>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard 
          icon={Search}
          title="Buscá tu Sede"
          description="Encontrá las mejores canchas cerca tuyo con Google Maps y reservá al instante."
          color="#2cfc7d"
        />
        <FeatureCard 
          icon={Trophy}
          title="Ranking Global"
          description="Subí de nivel en nuestra liga oficial. De Hierro a Pelotify Maestro."
          color="#fbbf24"
        />
        <FeatureCard 
          icon={Lock}
          title="Pagos Seguros"
          description="Pagá tu seña con Mercado Pago integrado. Sin efectivo, sin líos."
          color="#3b82f6"
        />
      </section>

      {/* MID SECTION: FOR VENUE OWNERS */}
      <section className="py-20">
         <div className="rounded-[3rem] glass-premium p-12 lg:p-20 border-primary/20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 relative z-10">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <MapPin className="w-8 h-8 text-primary shadow-glow" />
               </div>
               <h2 className="text-4xl md:text-6xl font-black font-kanit italic uppercase tracking-tighter leading-none">
                  LLEVÁ TU COMPLEJO <br /> <span className="text-primary">AL SIGUIENTE NIVEL.</span>
               </h2>
               <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40 leading-relaxed max-w-lg">
                  ¿Sos dueño de una sede? Unificá tu gestión, recibí pagos directos y ganá visibilidad ante miles de jugadores. Registro gratuito y automático.
               </p>
               <Link href="/canchas" className="inline-block">
                  <button className="px-10 h-14 bg-foreground text-background font-black uppercase text-[10px] tracking-[0.3em] rounded-xl hover:scale-105 transition-all">
                     SABER MÁS (DUEÑOS)
                  </button>
               </Link>
            </div>
            <div className="flex-1 w-full max-w-md aspect-video rounded-[2rem] bg-surface border border-white/5 relative overflow-hidden group shadow-2xl">
               <img 
                  src="https://images.unsplash.com/photo-1529900948638-19f94ff446a1?auto=format&fit=crop&q=60&w=800" 
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  alt="Sede Pelotify"
               />
               <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-background to-transparent">
                  <div className="flex items-center gap-3">
                     <Zap className="w-4 h-4 text-primary animate-pulse" />
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">Dash Control Activo</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* RANKINGS OVERVIEW SECTION */}
      <section className="py-32 space-y-16">
         <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-7xl font-black font-kanit italic uppercase tracking-tighter">EL SISTEMA DE <span className="text-primary">RANGOS</span></h2>
            <p className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.4em]">¿Hasta dónde sos capaz de llegar?</p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
            {['HIERRO', 'BRONCE', 'PLATA', 'ORO', 'PLATINO', 'DIAMANTE', 'ELITE', 'MAESTRO', 'PELOTIFY'].map((r, i) => (
               <div key={r} className="flex flex-col items-center gap-4 p-6 glass-premium rounded-3xl border-white/5 group hover:border-primary/40 transition-all">
                  <div className="w-10 h-10 rounded-full bg-surface border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Star className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-foreground/40 text-center tracking-widest leading-none">{r}</span>
               </div>
            ))}
         </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="py-32 text-center space-y-10">
         <h2 className="text-5xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-none">NO TE QUEDES <br /> AFUERA DEL <span className="text-primary">PARTIDO.</span></h2>
         <Link href="/register" className="inline-block">
            <button className="px-16 h-20 bg-primary text-black font-black uppercase text-[14px] tracking-[0.5em] rounded-[2rem] shadow-[0_20px_60px_rgba(44,252,125,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
               COMENZAR AHORA <ArrowRight className="w-6 h-6" />
            </button>
         </Link>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="py-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-3">
           <img src="/logo_pelotify.png" className="w-10 h-10 object-contain" alt="Logo" />
           <span className="text-lg font-black italic uppercase italic tracking-tighter font-kanit">PELOTIFY</span>
         </div>
         <p className="text-[9px] font-black uppercase tracking-[0.3em]"> 2026 Pelotify INC. El fútgol amateur reinventado.</p>
         <div className="flex gap-6">
            <Globe className="w-4 h-4" />
            <Star className="w-4 h-4" />
            <Shield className="w-4 h-4" />
         </div>
      </footer>
    </div>
  );
}
