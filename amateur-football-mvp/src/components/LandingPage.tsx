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
      <nav className="fixed top-0 inset-x-0 h-24 z-[100] px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-2xl transition-all shadow-sm">
         <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 flex items-center justify-center border border-emerald-500/50 group-hover:border-emerald-400 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all">
               <img src="/logo_pelotify.png" className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" alt="Pelotify" />
            </div>
            <span className="text-3xl font-black italic uppercase tracking-tighter font-kanit leading-none drop-shadow-lg">PELOTI<span className="text-emerald-500">FY</span></span>
         </div>

         <div className="hidden md:flex items-center gap-10">
            {['Jugadores', 'Sedes', 'Ranking', 'Características'].map((link) => (
               <Link key={link} href={link === 'Sedes' ? '/canchas/login' : `/login`} className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">
                  {link}
               </Link>
            ))}
            <Link href="/login">
               <button className="h-12 px-8 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-xl hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all">
                  INICIAR SESIÓN
               </button>
            </Link>
         </div>
      </nav>

      {/* 🔴 NEW HERO SECTION: HIGH-END PROFESSIONAL */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
         {/* Premium background */}
         <div className="absolute inset-0 -z-10 bg-[#020202]">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/15 via-transparent to-transparent opacity-90" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/15 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-zinc-950 to-transparent" />
         </div>

         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-12 max-w-6xl relative z-10 w-full mt-24"
         >
            <div className="space-y-8 flex flex-col items-center">
               <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
               >
                  <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/30 transition-all duration-700" />
                  <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-xl group-hover:scale-105 transition-transform duration-500 z-10">
                    <img src="/logo_pelotify.png" className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" alt="Pelotify Main Logo" />
                  </div>
               </motion.div>

               <h1 className="text-6xl md:text-8xl lg:text-[9.5rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white drop-shadow-2xl">
                  EL FÚTBOL ES <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-white">NUESTRO.</span>
               </h1>
               
               <p className="text-xs md:text-lg font-bold tracking-[0.2em] uppercase text-zinc-400 max-w-3xl mx-auto pt-6 border-t border-white/10 mt-4 leading-relaxed">
                  Lleva tu nivel a la cima. Crea tu carta, averigua tu rating, domina la ciudad, alquila predios sin fricciones. La plataforma definitiva.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
               <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full h-16 px-14 bg-emerald-500 text-black font-black uppercase text-[15px] tracking-[0.2em] rounded-2xl hover:bg-emerald-400 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(16,185,129,0.5)] group">
                     <span>ENTRAR A LA CANCHA</span>
                     <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
               </Link>
               <Link href="/canchas/login" className="w-full sm:w-auto">
                  <button className="w-full h-16 px-10 border border-white/20 text-white font-black uppercase text-[15px] tracking-[0.2em] rounded-2xl hover:bg-zinc-900 active:scale-95 transition-all flex items-center justify-center gap-3 bg-black/60 backdrop-blur shadow-2xl hover:border-emerald-500/50 group">
                     <TargetIcon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                     <span>ACCESO DUEÑOS</span>
                  </button>
               </Link>
            </div>
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

      {/* 🔵 THE PLAYER IDENTITY (MARKETING FOCUSED ON FIFA CARD - PUNCHIER) */}
      <section className="py-40 px-6 lg:px-12 bg-[#020202] relative border-y border-white/5 overflow-hidden">
         {/* Massive background text */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">
            <h1 className="text-[12rem] md:text-[25rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap">
               TU LEGADO
            </h1>
         </div>
         
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] pointer-events-none z-0" />
         
         <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center gap-20 lg:gap-32 relative z-10">
            
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="flex-1 space-y-12 order-2 lg:order-1"
            >
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                     <Award className="w-4 h-4 text-emerald-500" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">SISTEMA COMPETITIVO ÚNICO</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl lg:text-[7rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white">
                     TU IDENTIDAD <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">EN LA CANCHA.</span>
                  </h2>
                  <p className="text-lg md:text-xl font-medium text-zinc-400 leading-relaxed max-w-lg pt-4">
                     No juegas por nada. Por cada partido ganado, tus atributos mejoran. Nuestro algoritmo de ELO refleja tu talento real en la carta de jugador más respetada de la ciudad.
                  </p>
               </div>

               <div className="space-y-8 border-l-4 border-emerald-500/50 pl-8">
                  <div className="space-y-3">
                     <div className="flex items-center gap-4">
                        <Activity className="w-6 h-6 text-emerald-500" />
                        <h4 className="text-lg font-black uppercase tracking-widest text-white">RATING DINÁMICO (ELO)</h4>
                     </div>
                     <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Gana partidos oficiales para que todo el mundo vea tus números subir.</p>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-white/10">
                     <div className="flex items-center gap-4">
                        <Medal className="w-6 h-6 text-emerald-500" />
                        <h4 className="text-lg font-black uppercase tracking-widest text-white">CONDECORACIONES MVP</h4>
                     </div>
                     <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Sé la figura del partido y recolecta medallas en tu perfil público.</p>
                  </div>
               </div>

               <Link href="/register" className="inline-block pt-10">
                  <button className="h-16 px-10 border-2 border-emerald-500 text-white font-black uppercase text-[15px] tracking-[0.2em] rounded-2xl hover:bg-emerald-500 hover:text-black hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                     <span>FORJAR MI CARTA AHORA</span>
                     <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
               </Link>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
               whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1, type: "spring" }}
               className="flex-1 w-full flex justify-center order-1 lg:order-2 perspective-[2000px] relative"
            >
               <div className="absolute inset-0 bg-emerald-500/20 blur-[150px] rounded-full scale-100 -z-10" />
               <div className="scale-[1.1] sm:scale-[1.4] lg:scale-[1.8] transform-gpu z-10 my-20 lg:my-32">
                 <div className="animate-float hover:scale-110 hover:-rotate-y-12 transition-transform duration-700 drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] filter brightness-110">
                   <FifaCard player={dummyPlayer} />
                 </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 🔴 MARKETING PARA DUEÑOS (SELLING TO VENUE OWNERS) - PUNCHIER */}
      <section className="py-40 px-6 lg:px-12 relative overflow-hidden bg-[#000000] border-y border-emerald-900/30">
         {/* Massive back text */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.02]">
            <h1 className="text-[10rem] md:text-[18rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap">
               CERO FRICCIONES
            </h1>
         </div>

         <div className="max-w-[1500px] mx-auto rounded-[3.5rem] bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-10 lg:p-20 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            {/* Owner Section Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.08] pointer-events-none" />
            <div className="absolute -left-40 -top-40 w-[1000px] h-[1000px] bg-emerald-500/10 blur-[200px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-12">
                  <div className="space-y-8">
                     <div className="inline-flex h-14 px-6 rounded-xl bg-black border border-emerald-500/50 items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">POTENCIA TU PREDIO DEPORTIVO</span>
                     </div>
                     <h2 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
                        MÁXIMA <span className="text-white">OCUPACIÓN.</span><br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-300 whitespace-nowrap text-5xl md:text-7xl lg:text-[5.5rem] mt-2 block">CERO FRICCIONES.</span>
                     </h2>
                     <p className="text-lg md:text-xl font-medium text-zinc-300 max-w-lg leading-relaxed pt-4">
                        Despídete de los huecos vacíos y tu plata al aire. Pelotify automatiza las reservas, los pagos y la carga administrativa de tus canchas.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 border-y border-white/10 py-10">
                     <div className="space-y-4 pl-6 border-l-4 border-emerald-500">
                        <DollarSign className="w-8 h-8 text-emerald-500 drop-shadow-md" />
                        <h5 className="text-base font-black uppercase tracking-widest text-white">Protege tu Caja Fuerte</h5>
                        <p className="text-sm font-semibold text-zinc-500 leading-relaxed uppercase tracking-wider">Señas automatizadas 100% integradas a MercadoPago. Cobradas directo a tu cuenta bancaria.</p>
                     </div>
                     <div className="space-y-4 pl-6 border-l-4 border-emerald-500">
                        <BarChart3 className="w-8 h-8 text-emerald-500 drop-shadow-md" />
                        <h5 className="text-base font-black uppercase tracking-widest text-white">Métricas de Emperador</h5>
                        <p className="text-sm font-semibold text-zinc-500 leading-relaxed uppercase tracking-wider">Analíticas de ingresos, picos calientes de alquiler e historial de clientes.</p>
                     </div>
                  </div>

                  <Link href="/canchas/login" className="inline-block pt-6">
                     <button className="px-12 h-20 bg-white text-black font-black uppercase text-[15px] tracking-[0.2em] rounded-2xl hover:bg-emerald-500 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                        <span>ACCEDER AL PANEL PRO</span>
                        <ChevronRight className="w-6 h-6" />
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
