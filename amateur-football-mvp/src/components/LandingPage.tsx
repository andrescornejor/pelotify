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
  BarChart3
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
  badges: ["Legend", "Pro"],
  image: "https://api.dicebear.com/7.x/notionists/svg?seed=Maestro&backgroundColor=transparent"
};

const FeatureBox = ({ title, desc, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:border-primary/30 transition-all relative overflow-hidden group shadow-lg backdrop-blur-sm"
  >
    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-[50px] group-hover:bg-primary/20 transition-colors" />
    <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="text-xl font-black italic font-kanit uppercase tracking-tight mb-2 text-white">{title}</h3>
    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 leading-relaxed font-sans">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black overflow-x-hidden font-sans scroll-smooth">
      
      {/* 🟢 TOP NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-20 z-[100] px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10">
               <img src="/logo_pelotify.png" className="w-6 h-6 object-contain" alt="Pelotify" />
            </div>
            <span className="text-2xl font-black italic uppercase tracking-tighter font-kanit leading-none">PELOTI<span className="text-primary">FY</span></span>
         </div>

         <div className="hidden md:flex items-center gap-8">
            {['Torneos', 'Sedes', 'Ranking'].map((link) => (
               <Link key={link} href={link === 'Sedes' ? '/canchas/login' : `/login`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                  {link}
               </Link>
            ))}
            <Link href="/login">
               <button className="h-10 px-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-primary hover:text-black transition-colors shadow-lg">
                  ENTRAR
               </button>
            </Link>
         </div>
      </nav>

      {/* 🔴 HERO SECTION */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 pt-20 text-center">
         <div className="absolute inset-0 -z-10 bg-[#050505] overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 blur-[150px] opacity-30 rounded-full" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 max-w-6xl relative z-10 w-full"
         >
            <div className="space-y-6">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md"
               >
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">EL FUTURO DEL FÚTBOL AMATEUR</span>
               </motion.div>

               <h1 className="text-6xl md:text-8xl lg:text-[11rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white">
                  LA CANCHA <br /> <span className="text-primary">ES TUYA.</span>
               </h1>
               
               <p className="text-sm md:text-lg font-bold uppercase tracking-[0.4em] text-zinc-400 max-w-2xl mx-auto pt-6">
                  Gestiona tus partidos, domina el ranking y vive el fútbol como un profesional.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
               <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full h-16 px-12 bg-primary text-black font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(44,252,125,0.2)]">
                     <span>FICHARME AHORA</span>
                     <ArrowRight className="w-5 h-5" />
                  </button>
               </Link>
               <Link href="/canchas/login" className="w-full sm:w-auto">
                  <button className="w-full h-16 px-12 border border-white/10 text-white font-bold uppercase text-sm tracking-[0.2em] rounded-2xl hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-3 bg-zinc-900/50 backdrop-blur">
                     <Users className="w-5 h-5" />
                     <span>SOY DUEÑO</span>
                  </button>
               </Link>
            </div>
         </motion.div>
      </section>

      {/* 🟡 SECTION: THE LEGEND (PLAYER CARD PERFORMANCE) */}
      <section className="py-32 px-6 lg:px-12 max-w-[1400px] mx-auto overflow-hidden relative border-t border-white/5">
         <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
         
         <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            {/* INFO WRAPPER */}
            <div className="flex-1 space-y-10 order-2 lg:order-1">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-primary">
                     <span className="w-8 h-px bg-primary" />
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em]">IDENTIDAD DIGITAL</p>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black font-kanit italic uppercase tracking-tighter leading-[0.9]">
                     TU PROPIA <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">PELOTIFY CARD.</span>
                  </h2>
                  <p className="text-base font-medium text-zinc-400 leading-relaxed max-w-lg">
                     Tu desempeño define tu ficha. Goles, victorias y el respeto de la liga se reflejan en tu rating global. Colecciona trofeos y demuestra que eres el MVP.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                     { icon: Activity, title: 'Rating en Vivo', desc: 'Sube o baja tu Elo Específico.' },
                     { icon: TargetIcon, title: 'Atributos Pro', desc: 'Fuerza, regate y pase real.' },
                     { icon: Trophy, title: 'Ranking', desc: 'Competí en el Top Elite.' },
                     { icon: Award, title: 'Medallas MVP', desc: 'Suma logros en cada actuación.' }
                  ].map((feat, i) => (
                     <div key={i} className="flex gap-4 p-5 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                           <feat.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold uppercase tracking-wider text-white">{feat.title}</h4>
                           <p className="text-xs text-zinc-500 mt-1">{feat.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* CARD CONTAINER */}
            <div className="flex-1 w-full flex justify-center order-1 lg:order-2 perspective-1000 relative">
               <div className="scale-110 sm:scale-125 lg:scale-150 transform-gpu z-10 my-10 lg:my-20">
                 <FifaCard player={dummyPlayer} />
               </div>
            </div>
         </div>
      </section>

      {/* 🟡 SECTION: FEATURES (THE BENTO GRID ECOSYSTEM) */}
      <section className="py-32 px-6 lg:px-12 bg-black border-y border-white/5 overflow-hidden">
         <div className="max-w-[1400px] mx-auto space-y-16">
            <div className="text-center md:text-left md:flex justify-between items-end gap-8 mb-16">
               <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black font-kanit italic uppercase tracking-tighter">
                     EL ECOSISTEMA <span className="text-primary">PELOTIFY.</span>
                  </h2>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] max-w-xl">
                     Todo lo que necesitas para jugar, organizar y analizar tu desempeño.
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FeatureBox 
                  title="Buscador Inteligente"
                  desc="Encuentra predios cercanos con disponibilidad en tiempo real y reserva instantánea."
                  icon={Search}
                  delay={0.1}
               />
               <FeatureBox 
                  title="Pagos Seguros"
                  desc="Señas automatizadas con Mercado Pago integradas 100% en el sistema."
                  icon={Zap}
                  delay={0.2}
               />
               <FeatureBox 
                  title="Planteles & Hub"
                  desc="Gestos de equipos, estadísticas y transferencias globales en la red."
                  icon={Users}
                  delay={0.3}
               />
            </div>
         </div>
      </section>

      {/* 🔴 SECTION: BUSINESS (SELLING TO VENUE OWNERS) */}
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden bg-[#050505]">
         <div className="max-w-[1400px] mx-auto rounded-[3rem] bg-zinc-900/50 border border-white/10 p-10 lg:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-10">
                  <div className="space-y-6">
                     <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-primary" />
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black font-kanit italic uppercase tracking-tighter leading-none">
                        PROFESIONALIZA <br /> <span className="text-white">TU PREDIO.</span>
                     </h2>
                     <p className="text-sm md:text-lg font-medium text-zinc-400 max-w-md">
                        Un panel de control completo. Gestiona turnos, recolecta señas de forma automática y analiza la facturación diaria.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <h5 className="text-sm font-bold uppercase tracking-wider text-white">Ingresos Seguros</h5>
                        <p className="text-xs text-zinc-500">Anticipos requeridos y menos cancelaciones de última hora.</p>
                     </div>
                     <div className="space-y-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h5 className="text-sm font-bold uppercase tracking-wider text-white">Métricas de Ocupación</h5>
                        <p className="text-xs text-zinc-500">Reportes de caja mensual, horarios pico y facturación.</p>
                     </div>
                  </div>

                  <Link href="/canchas/login" className="inline-block pt-4">
                     <button className="px-8 h-14 bg-white text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-primary transition-colors flex items-center gap-3">
                        <span>ACCESO PARA PREDIOS</span>
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </Link>
               </div>

               {/* Mockup */}
               <div className="hidden lg:flex justify-end">
                  <div className="w-full max-w-sm aspect-square rounded-[2rem] bg-black border border-white/10 flex flex-col justify-center p-10 relative overflow-hidden shadow-2xl">
                     <div className="space-y-8 relative z-10">
                        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/5 space-y-2 backdrop-blur-md">
                           <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Eficiencia</p>
                           <p className="text-5xl font-black italic font-kanit text-primary">97.4%</p>
                        </div>
                        <div className="space-y-4">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${Math.random() * 50 + 40}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.2 }}
                                    className="h-full bg-primary/60" 
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 🔴 FINAL CTA */}
      <section className="py-40 px-6 text-center border-t border-white/5">
         <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-none">
               SAL A LA <span className="text-primary">CANCHA.</span>
            </h2>
            <Link href="/register" className="inline-block">
               <button className="px-16 h-20 bg-primary text-black font-black uppercase text-lg tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all outline-none shadow-[0_0_50px_rgba(44,252,125,0.3)]">
                  UNIRSE GRATIS
               </button>
            </Link>
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
            </div>
            
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
               <Link href="/help" className="hover:text-white transition-colors">Soporte</Link>
               <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
               <Link href="/canchas/login" className="hover:text-white transition-colors">Sedes</Link>
               <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
            
            <div className="text-center md:text-right space-y-2">
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

