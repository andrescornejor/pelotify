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
  Smartphone,
  CheckCircle2,
  Medal
} from 'lucide-react';
import Link from 'next/link';
import { FifaCard } from './FifaCard';
import { cn } from '@/lib/utils';

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

const FeatureCard = ({ title, desc, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.5 }}
    className="group relative p-8 md:p-10 rounded-[2.5rem] bg-zinc-900/30 border border-white/10 hover:border-primary/50 overflow-hidden transition-all duration-500 backdrop-blur-md"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-colors" />
    
    <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:-rotate-6 transition-transform">
      <Icon className="w-6 h-6 text-primary drop-shadow-[0_0_12px_rgba(44,252,125,0.6)]" />
    </div>
    
    <h3 className="text-2xl font-black italic font-kanit uppercase tracking-tight mb-3 text-white">{title}</h3>
    <p className="text-xs md:text-sm font-semibold text-zinc-400 tracking-wider leading-relaxed pr-4">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-emerald-500 selection:text-black font-sans scroll-smooth overflow-x-hidden">
      
      {/* 🟢 TOP NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-20 z-[100] px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-2xl transition-all shadow-sm">
         <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 flex items-center justify-center border border-emerald-500/30 group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
               <img src="/logo_pelotify.png" className="w-6 h-6 object-contain" alt="Pelotify" />
            </div>
            <span className="text-2xl font-black italic uppercase tracking-tight font-kanit leading-none">PELOTI<span className="text-emerald-500">FY</span></span>
         </div>

         <div className="hidden md:flex items-center gap-8">
            {['Jugadores', 'Sedes', 'Ranking', 'Características'].map((link) => (
               <Link key={link} href={link === 'Sedes' ? '/canchas/login' : `/login`} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                  {link}
               </Link>
            ))}
            <Link href="/login">
               <button className="h-10 px-6 bg-white text-black font-black uppercase text-xs tracking-widest rounded-lg hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                  INICIAR SESIÓN
               </button>
            </Link>
         </div>
      </nav>

      {/* 🔴 NEW HERO SECTION: HIGH-END PROFESSIONAL */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
         {/* Premium background */}
         <div className="absolute inset-0 -z-10 bg-black">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/10 via-transparent to-transparent opacity-80" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
         </div>

         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-10 max-w-6xl relative z-10 w-full mt-20"
         >
            <div className="space-y-6 flex flex-col items-center">
               <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md"
               >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">LA PLATAFORMA DE FÚTBOL DEFINITIVA</span>
               </motion.div>

               <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-kanit uppercase tracking-tighter leading-[0.9] text-white">
                  JUEGA COMO UN <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-white">PROFESIONAL.</span>
               </h1>
               
               <p className="text-sm md:text-lg font-medium text-zinc-400 max-w-2xl mx-auto leading-relaxed pt-2">
                  Organiza partidos, gestiona pagos seguros, compite en rankings y lleva tus estadísticas al nivel de la élite. Todo lo que el fútbol amateur necesitaba, en un solo lugar.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
               <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full h-14 px-10 bg-emerald-500 text-black font-black uppercase text-sm tracking-widest rounded-xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                     <span>UNIRSE AHORA</span>
                     <ArrowRight className="w-5 h-5" />
                  </button>
               </Link>
               <Link href="/canchas/login" className="w-full sm:w-auto">
                  <button className="w-full h-14 px-8 border border-white/20 text-white font-bold uppercase text-sm tracking-widest rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 bg-black/40 backdrop-blur">
                     <span>DUEÑOS DE SEDES</span>
                  </button>
               </Link>
            </div>

            {/* Platform Stats / Trust */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 }}
               className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/10"
            >
               {[
                  { label: "MÁS DE", value: "10,000", desc: "JUGAdores ACTIVOS" },
                  { label: "RESERVAS", value: "SEGUras", desc: "MERCADOPAGO" },
                  { label: "ESTADÍSTICAS", value: "ELO", desc: "RANKING GLOBAL" },
                  { label: "COBERTURA", value: "TOTAL", desc: "MEJORES SEDES" }
               ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center justify-center space-y-1 p-4">
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</span>
                     <span className="text-xl md:text-2xl font-black text-white italic font-kanit">{stat.value}</span>
                     <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{stat.desc}</span>
                  </div>
               ))}
            </motion.div>
         </motion.div>
      </section>

      {/* 🔴 NUEVA SECCIÓN DE EXPLICACIÓN (DETAILED PLATFORM EXPLANATION) */}
      <section className="py-24 px-6 lg:px-12 bg-zinc-950 border-t border-white/5 relative">
         <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-3xl md:text-5xl font-black uppercase font-kanit italic tracking-tight text-white">
                  TODO LO QUE NECESITAS <span className="text-emerald-500">EN UNA APP.</span>
               </h2>
               <p className="text-sm md:text-base text-zinc-400 font-medium max-w-2xl mx-auto">
                  Pelotify elimina las complicaciones de organizar fútbol. Descubre todas las herramientas diseñadas para la mejor experiencia dentro y fuera de la cancha.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                     <Search className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wide text-white mb-3">Buscador y Reservas</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                     Encuentra la cancha perfecta usando filtros por zona, horario y tamaño. La disponibilidad es 100% real. Concreta tu reserva en cuestión de segundos, sin depender de mensajes de WhatsApp.
                  </p>
               </div>
               
               <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                     <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wide text-white mb-3">Pagos Seguros Automáticos</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                     Integración nativa con Mercado Pago. Cada jugador paga su parte directamente desde la plataforma. Olvídate de perseguir a tus amigos para que te transfieran, nosotros nos encargamos del split.
                  </p>
               </div>

               <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                     <Users className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wide text-white mb-3">Armado de Planteles</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                     Convoca jugadores según la posición que te falte. Perfiles verificados con estadísticas reales te aseguran que estás sumando al jugador correcto para completar tu equipo y ganar el partido.
                  </p>
               </div>

               <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                     <BarChart3 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wide text-white mb-3">Estadísticas y Rankings</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                     Cada victoria, gol y asistencia cuenta. Nuestro sistema procesa tus resultados y actualiza tu ranking global en la aplicación. Entra al Top de jugadores de tu ciudad y demuestra tu nivel.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 🔵 THE PLAYER IDENTITY (MARKETING FOCUSED ON FIFA CARD - KEPT AS REQUESTED) */}
      <section className="py-32 px-6 lg:px-12 bg-[#050505] relative border-y border-white/5 overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] pointer-events-none" />
         <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="flex-1 space-y-10 order-2 lg:order-1 relative z-10"
            >
               <div className="space-y-6">
                  <h2 className="text-5xl md:text-7xl font-black font-kanit italic uppercase tracking-tighter leading-[0.9] text-white">
                     TU IDENTIDAD <br />
                     <span className="text-primary">EN LA CANCHA.</span>
                  </h2>
                  <p className="text-base md:text-lg font-medium text-zinc-400 leading-relaxed max-w-lg">
                     Por cada partido ganado y por cada MVP obtenido, tus atributos mejoran. Nuestro algoritmo de ELO convierte tu rendimiento real en estadísticas visibles para toda la comunidad.
                  </p>
               </div>

               <div className="space-y-6 border-l-2 border-primary/30 pl-6">
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-primary" />
                        <h4 className="text-base font-black uppercase tracking-wider text-white">RATING DINÁMICO (ELO)</h4>
                     </div>
                     <p className="text-sm font-medium text-zinc-500">Gana partidos oficiales para escalar en la tabla general de la liga.</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-white/10">
                     <div className="flex items-center gap-3">
                        <Medal className="w-5 h-5 text-primary" />
                        <h4 className="text-base font-black uppercase tracking-wider text-white">CONDECORACIONES MVP</h4>
                     </div>
                     <p className="text-sm font-medium text-zinc-500">Tus compañeros y rivales pueden votarte como la figura del partido.</p>
                  </div>
               </div>

               <Link href="/register" className="inline-block pt-8">
                  <button className="h-14 px-8 border border-primary/50 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-primary hover:text-black transition-colors flex items-center gap-3 group shadow-[0_0_20px_rgba(44,252,125,0.1)]">
                     <span>CREAR MI CARTA DE JUGADOR</span>
                     <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
               </Link>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="flex-1 w-full flex justify-center order-1 lg:order-2 perspective-1000 relative"
            >
               <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75 -z-10" />
               <div className="scale-110 sm:scale-125 lg:scale-150 transform-gpu z-10 my-10 lg:my-20">
                 <div className="animate-float hover:scale-105 transition-transform duration-500 drop-shadow-2xl">
                   <FifaCard player={dummyPlayer} />
                 </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 🔴 MARKETING PARA DUEÑOS (SELLING TO VENUE OWNERS) - KEPT FROM PREVIOUS VERSION */}
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden bg-[#050505] border-y border-white/5">
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
      <section className="py-32 px-6 text-center border-b border-white/5 relative bg-zinc-950">
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px]" />
         
         <div className="max-w-4xl mx-auto space-y-10 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black font-kanit italic uppercase tracking-tighter leading-tight drop-shadow-2xl text-white">
               ES HORA DE ENTRAR A <span className="text-emerald-500">LA CANCHA.</span>
            </h2>
            <p className="text-sm md:text-base font-medium text-zinc-400">
               Únete a miles de jugadores que ya transformaron su manera de jugar al fútbol amateur. Demuestra tu nivel, organiza partidos sin esfuerzo y conviértete en una leyenda local.
            </p>
            <div className="pt-6">
               <Link href="/register" className="inline-block">
                  <button className="px-12 h-16 bg-emerald-500 text-black font-black uppercase text-sm tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center gap-3">
                     <span>COMENZAR AHORA MISMO</span>
                     <ArrowRight className="w-5 h-5" />
                  </button>
               </Link>
            </div>
         </div>
      </section>

      {/* 🟢 FOOTER */}
      <footer className="py-12 px-6 lg:px-12 bg-black">
         <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 pt-12">
            <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <img src="/logo_pelotify.png" className="w-6 h-6" alt="Pelotify" />
                  <span className="text-xl font-black italic uppercase tracking-tight font-kanit text-white">PELOTIFY</span>
               </div>
               <p className="text-xs font-medium text-zinc-500">
                  La evolución del fútbol amateur.
               </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-400">
               <Link href="/help" className="hover:text-white transition-colors">Soporte</Link>
               <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
               <Link href="/canchas/login" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
                  Acceso Dueños
               </Link>
            </div>
            
            <div className="text-center md:text-right space-y-2">
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">© 2026 PELOTIFY ALL RIGHTS RESERVED.</p>
            </div>
         </div>
      </footer>
    </div>
  );
}
