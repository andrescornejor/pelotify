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
    <div className="min-h-screen bg-[#030303] text-white selection:bg-primary selection:text-black font-sans scroll-smooth overflow-x-hidden">
      
      {/* 🟢 TOP NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-24 z-[100] px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl">
         <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors shadow-2xl">
               <img src="/logo_pelotify.png" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" alt="Pelotify" />
            </div>
            <span className="text-3xl font-black italic uppercase tracking-tighter font-kanit leading-none filter drop-shadow-md">PELOTI<span className="text-primary">FY</span></span>
         </div>

         <div className="hidden md:flex items-center gap-10">
            {['Jugadores', 'Sedes', 'Ranking'].map((link) => (
               <Link key={link} href={link === 'Sedes' ? '/canchas/login' : `/login`} className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">
                  {link}
               </Link>
            ))}
            <Link href="/login">
               <button className="h-12 px-8 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-xl hover:bg-primary transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(44,252,125,0.4)]">
                  INGRESAR
               </button>
            </Link>
         </div>
      </nav>

      {/* 🔴 NEW HERO SECTION: MINIMALIST & BOLD */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 pt-20 text-center pb-20">
         <div className="absolute inset-0 -z-10 bg-[#030303] overflow-hidden">
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] max-w-[1000px] h-[600px] bg-primary/10 blur-[150px] opacity-60 rounded-full" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[#030303] to-transparent" />
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-12 max-w-5xl relative z-10 w-full"
         >
            <div className="space-y-6 flex flex-col items-center">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-md shadow-[0_0_20px_rgba(44,252,125,0.2)]"
               >
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">LA NUEVA ERA DEL FÚTBOL AMATEUR</span>
               </motion.div>

               <h1 className="text-[5.5rem] md:text-[8rem] lg:text-[10rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] text-white drop-shadow-2xl px-4">
                  ELEVA TU <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-white">JUEGO.</span>
               </h1>
               
               <p className="text-sm md:text-lg font-bold uppercase tracking-[0.3em] text-zinc-400 max-w-3xl mx-auto pt-8 leading-relaxed border-t border-white/10 mt-6">
                  Reserva predios al instante. Domina el ranking de la ciudad. Juega como un verdadero profesional.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
               <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full h-16 px-14 bg-primary text-black font-black uppercase text-[15px] tracking-[0.2em] rounded-2xl hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(44,252,125,0.4)] group">
                     <span>UNIRSE AHORA</span>
                     <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
               </Link>
               <Link href="/canchas/login" className="w-full sm:w-auto">
                  <button className="w-full h-16 px-10 border border-white/20 text-white font-black uppercase text-[14px] tracking-[0.2em] rounded-2xl hover:bg-zinc-900 active:scale-95 transition-all flex items-center justify-center gap-3 bg-black/40 backdrop-blur shadow-xl">
                     <TargetIcon className="w-5 h-5 text-zinc-400" />
                     <span>ACCESO DUEÑOS</span>
                  </button>
               </Link>
            </div>
         </motion.div>
      </section>

      {/* 🔵 THE PLAYER IDENTITY (MARKETING FOCUSED ON FIFA CARD) */}
      <section className="py-32 px-6 lg:px-12 bg-[#050505] relative border-y border-white/5 overflow-hidden">
         <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="flex-1 space-y-10 order-2 lg:order-1"
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
                     <p className="text-xs font-semibold tracking-wider text-zinc-500">Gana partidos oficiales para escalar en la tabla general de la liga.</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-white/10">
                     <div className="flex items-center gap-3">
                        <Medal className="w-5 h-5 text-primary" />
                        <h4 className="text-base font-black uppercase tracking-wider text-white">CONDECORACIONES MVP</h4>
                     </div>
                     <p className="text-xs font-semibold tracking-wider text-zinc-500">Tus compañeros y rivales pueden votarte como la figura del partido.</p>
                  </div>
               </div>

               <Link href="/register" className="inline-block pt-8">
                  <button className="h-14 px-8 border border-primary/50 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-primary hover:text-black transition-colors flex items-center gap-3 group">
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
                 <div className="animate-float">
                   <FifaCard player={dummyPlayer} />
                 </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 🟡 THE ECOSYSTEM BENTO GRID */}
      <section className="py-32 px-6 lg:px-12 bg-[#020202] overflow-hidden">
         <div className="max-w-[1400px] mx-auto space-y-20">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
               <h2 className="text-4xl md:text-6xl font-black font-kanit italic uppercase tracking-tighter">
                  UN ECOSISTEMA PREPARADO <br className="hidden md:block"/> PARA <span className="text-primary">LA GLORIA.</span>
               </h2>
               <p className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">
                  Todo el flujo de tu equipo, desde encontrar horarios disponibles hasta definir quién se lleva la copa.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <FeatureCard 
                  title="Reservas al Instante"
                  desc="Buscador inteligente con disponibilidad 100% real. Elige tu sede, cruza horarios con tu equipo y asegúrate tu lugar."
                  icon={Search}
                  delay={0.1}
               />
               <FeatureCard 
                  title="Integración Segura"
                  desc="Mercado Pago nativo. Todos apañan su seña directamente por la plataforma, cero transferencias al aire y total transparencia."
                  icon={Zap}
                  delay={0.2}
               />
               <FeatureCard 
                  title="Planteles Completos"
                  desc="Arma tu Dream Team, convoca jugadores de otras posiciones y enfréntate en duelos que afectan tus stats directamente."
                  icon={Users}
                  delay={0.3}
               />
            </div>
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
      <section className="py-40 px-6 text-center border-b border-white/5 relative bg-[#020202]">
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[150px]" />
         
         <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            <h2 className="text-6xl md:text-8xl font-black font-kanit italic uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
               TU DESTINO ES EL <span className="text-primary hover:text-white transition-colors cursor-default">GREEN.</span>
            </h2>
            <p className="text-sm md:text-xl font-bold uppercase tracking-[0.3em] text-zinc-400 italic">
               EMPIEZA A CREAR TU LEGADO AHORA MISMO.
            </p>
            <div className="pt-8">
               <Link href="/register" className="inline-block">
                  <button className="px-16 h-24 bg-primary text-black font-black uppercase text-xl tracking-[0.3em] rounded-[2rem] hover:scale-105 active:scale-95 transition-all outline-none shadow-[0_0_50px_rgba(44,252,125,0.4)] flex items-center gap-4">
                     <CheckCircle2 className="w-8 h-8" />
                     <span>EMPEZAR GRATIS</span>
                  </button>
               </Link>
            </div>
         </div>
      </section>

      {/* 🟢 FOOTER */}
      <footer className="py-16 px-6 lg:px-12 bg-[#050505]">
         <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <img src="/logo_pelotify.png" className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" alt="Pelotify" />
                  <span className="text-2xl font-black italic uppercase tracking-tighter font-kanit text-white">PELOTIFY</span>
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  PLATAFORMA INTEGRAL PARA EL FÚTBOL AMATEUR
               </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
               <Link href="/help" className="hover:text-primary transition-colors">Soporte</Link>
               <Link href="/terms" className="hover:text-primary transition-colors">Legales</Link>
               <Link href="/canchas/login" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Acceso Sedes
               </Link>
               <Link href="/login" className="hover:text-primary transition-colors">Iniciar Sesión</Link>
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
