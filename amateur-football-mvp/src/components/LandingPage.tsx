'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ delay, duration: 0.8, type: "spring", stiffness: 50 }}
    className="group relative p-8 md:p-12 rounded-[3.5rem] bg-[#0A0A0A] border border-white/5 hover:border-primary/50 overflow-hidden transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(44,252,125,0.15)] z-10"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0" />
    <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/40 transition-colors z-0" />
    
    <div className="relative z-10 w-16 h-16 rounded-[1.5rem] bg-black border border-primary/20 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
      <Icon className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.8)]" />
    </div>
    
    <h3 className="relative z-10 text-3xl font-black italic font-kanit uppercase tracking-tighter mb-4 text-white group-hover:text-primary transition-colors duration-500">{title}</h3>
    <p className="relative z-10 text-sm md:text-base font-semibold text-zinc-400 tracking-wider leading-relaxed pr-4 group-hover:text-zinc-300 transition-colors duration-500">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  const [viewMode, setViewMode] = useState<'jugador' | 'dueno'>('jugador');

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black font-sans scroll-smooth overflow-x-hidden">
      
      {/* 🟢 TOP NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-28 z-[100] px-6 lg:px-12 flex items-center justify-between border-b border-primary/10 bg-[#050505]/80 backdrop-blur-3xl transition-all shadow-2xl">
         <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 group cursor-pointer"
         >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center border border-primary/30 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(44,252,125,0.5)] transition-all duration-500">
               <img src="/logo_pelotify.png" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(44,252,125,0.8)] animate-float" alt="Pelotify" />
            </div>
            <span className="text-4xl font-black italic uppercase tracking-tighter font-kanit leading-none drop-shadow-lg text-white">PELOTI<span className="text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.5)]">FY</span></span>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex items-center gap-10"
         >
            <Link href="/login">
               <button className="h-14 px-10 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-primary hover:shadow-[0_0_30px_rgba(44,252,125,0.6)] hover:scale-105 active:scale-95 transition-all duration-300">
                  INICIAR SESIÓN
               </button>
            </Link>
         </motion.div>
      </nav>

      {/* 🔴 OVERHAULED HERO SECTION: MASSIVE & GLOWING */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden bg-[#050505]">
         {/* Premium background */}
         <div className="absolute inset-0 -z-10 bg-[#050505]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 blur-[180px] rounded-full pointer-events-none transition-all duration-1000 opacity-60" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
            <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#020202] to-transparent pointer-events-none" />
         </div>

         {/* Massive back text watermark */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">
            <h1 className="text-[20rem] md:text-[35rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-primary">
               FÚTBOL
            </h1>
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="space-y-12 max-w-6xl relative z-10 w-full mt-24"
         >
            <div className="space-y-10 flex flex-col items-center">
               
               {/* Aesthetic Logo Container */}
               <motion.div 
                  initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 1.5, type: "spring", stiffness: 40 }}
                  className="relative group perspective-1000"
               >
                  <div className="absolute -inset-10 bg-primary/30 blur-[60px] rounded-full group-hover:bg-primary/50 transition-all duration-700 animate-pulse" />
                  <div className="w-48 h-48 md:w-56 md:h-56 relative rounded-[3rem] bg-gradient-to-br from-[#0A0A0A] to-black flex items-center justify-center border-2 border-primary/30 shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(44,252,125,0.2)] backdrop-blur-3xl group-hover:scale-110 group-hover:border-primary/60 transition-all duration-700 z-10 preserve-3d">
                    <img src="/logo_pelotify.png" className="w-36 h-36 md:w-40 md:h-40 object-contain drop-shadow-[0_0_25px_rgba(44,252,125,1)] animate-float" alt="Pelotify Main Logo" />
                  </div>
               </motion.div>

               <div className="space-y-4">
                  <h1 className="text-7xl md:text-[10rem] lg:text-[11rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] text-white drop-shadow-2xl">
                     EL FÚTBOL ES <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white drop-shadow-[0_0_30px_rgba(44,252,125,0.3)]">NUESTRO.</span>
                  </h1>
                  
                  <motion.p 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 1, duration: 1 }}
                     className="text-sm md:text-xl font-bold tracking-[0.25em] uppercase text-zinc-400 max-w-4xl mx-auto pt-8 border-t border-white/10 mt-6 leading-relaxed"
                  >
                     Sube tu nivel. Crea tu carta, domina la ciudad, alquila predios sin fricciones. La plataforma definitiva.
                  </motion.p>
               </div>
            </div>

            {/* 🔥🔥 AESTHETIC TOGGLE FOR AUDIENCE 🔥🔥 */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.2, duration: 0.8 }}
               className="flex flex-col sm:flex-row items-center justify-center pt-10"
            >
               <div className="flex bg-black border-2 border-white/10 p-2 rounded-full relative shadow-[0_40px_100px_rgba(0,0,0,1)]">
                  <button 
                     onClick={() => setViewMode('jugador')}
                     className={`relative px-12 md:px-16 py-6 md:py-8 rounded-full font-black uppercase tracking-[0.25em] text-xs md:text-sm transition-all duration-500 z-10 ${viewMode === 'jugador' ? 'text-black' : 'text-zinc-500 hover:text-white hover:scale-105'}`}
                  >
                     {viewMode === 'jugador' && (
                        <motion.div layoutId="viewModeIndicator" className="absolute inset-0 bg-primary rounded-full shadow-[0_0_40px_rgba(44,252,125,0.6)] -z-10" transition={{ type: 'spring', stiffness: 50, damping: 10 }} />
                     )}
                     SOY JUGADOR
                  </button>
                  <button 
                     onClick={() => setViewMode('dueno')}
                     className={`relative px-12 md:px-16 py-6 md:py-8 rounded-full font-black uppercase tracking-[0.25em] text-xs md:text-sm transition-all duration-500 z-10 flex items-center gap-3 ${viewMode === 'dueno' ? 'text-black' : 'text-zinc-500 hover:text-white hover:scale-105'}`}
                  >
                     {viewMode === 'dueno' && (
                        <motion.div layoutId="viewModeIndicator" className="absolute inset-0 bg-primary rounded-full shadow-[0_0_40px_rgba(44,252,125,0.6)] -z-10" transition={{ type: 'spring', stiffness: 50, damping: 10 }} />
                     )}
                     SOY DUEÑO
                  </button>
               </div>
            </motion.div>
         </motion.div>
      </section>

      {/* PAGE CONTENT DYNAMICALLY RENDERED BASED ON TOGGLE */}
      <AnimatePresence mode="wait">
        <motion.div 
           key={viewMode}
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -40 }}
           transition={{ duration: 0.6 }}
        >
          {viewMode === 'jugador' ? (
             <>
               {/* 🔵 SECCIÓN EXPLÍCATIVA PARA JUGADOR */}
               <section className="py-40 px-6 lg:px-12 bg-[#020202] border-t border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] pointer-events-none" />
                  <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-primary/5 blur-[200px] pointer-events-none" />

                  <div className="max-w-[1400px] mx-auto relative z-10">
                     <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24 space-y-6"
                     >
                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase font-kanit italic tracking-tighter text-white">
                           EL ECOSISTEMA <span className="text-primary drop-shadow-[0_0_20px_rgba(44,252,125,0.3)]">PERFECTO.</span>
                        </h2>
                        <p className="text-base md:text-xl text-zinc-400 font-bold max-w-3xl mx-auto uppercase tracking-widest leading-relaxed">
                           Diseñado para la gloria. Todo el flujo de tu equipo en un solo lugar.
                        </p>
                     </motion.div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <FeatureCard 
                           title="Reservas al Instante"
                           desc="Buscador inteligente con disponibilidad 100% real. Elige tu sede, cruza horarios con tu equipo y asegúrate tu lugar."
                           icon={Search}
                           delay={0.1}
                        />
                        <FeatureCard 
                           title="Integración Segura"
                           desc="Mercado Pago nativo. Todos apañan su seña directamente por la plataforma, cero transferencias al aire."
                           icon={Zap}
                           delay={0.2}
                        />
                        <FeatureCard 
                           title="Armado de Planteles"
                           desc="Convoca jugadores según la posición que te falte. Filtra por ELO y contrata a los mejores."
                           icon={Users}
                           delay={0.3}
                        />
                        <FeatureCard 
                           title="Estadísticas y Rankings"
                           desc="Tu historia documentada. Goles, asistencias, MVPs y rating global actualizado partido a partido."
                           icon={BarChart3}
                           delay={0.4}
                        />
                     </div>
                  </div>
               </section>

               {/* 🔵 THE PLAYER IDENTITY (MARKETING FOCUSED ON FIFA CARD - FULL GREEN AESTHETIC) */}
               <section className="py-40 px-6 lg:px-12 bg-[#050505] relative border-y border-primary/20 overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">
                     <h1 className="text-[15rem] md:text-[25rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-primary">
                        TU LEGADO
                     </h1>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/15 blur-[180px] pointer-events-none z-0" />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
                  
                  <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center gap-20 lg:gap-32 relative z-10">
                     
                     <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 space-y-14 order-2 lg:order-1"
                     >
                        <div className="space-y-6">
                           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(44,252,125,0.2)]">
                              <Award className="w-5 h-5 text-primary" />
                              <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">SISTEMA COMPETITIVO ELO</span>
                           </div>
                           <h2 className="text-6xl md:text-8xl lg:text-[8rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white">
                              TU IDENTIDAD <br />
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white drop-shadow-[0_0_30px_rgba(44,252,125,0.4)]">EN LA CANCHA.</span>
                           </h2>
                           <p className="text-lg md:text-xl font-medium text-zinc-300 leading-relaxed max-w-lg pt-4">
                              No juegas por nada. Por cada partido ganado, tus atributos mejoran. Nuestro algoritmo refleja tu talento real en la carta más deseada de la ciudad.
                           </p>
                        </div>

                        <div className="space-y-8 border-l-4 border-primary pl-8">
                           <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                              className="space-y-3 hover:-translate-y-1 transition-transform"
                           >
                              <div className="flex items-center gap-4">
                                 <Activity className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
                                 <h4 className="text-xl font-black uppercase tracking-widest text-white">RATING DINÁMICO (ELO)</h4>
                              </div>
                              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-12">Gana partidos oficiales para que todo el mundo vea tus números subir.</p>
                           </motion.div>
                           <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                              className="space-y-3 pt-6 border-t border-white/10 hover:-translate-y-1 transition-transform"
                           >
                              <div className="flex items-center gap-4">
                                 <Medal className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
                                 <h4 className="text-xl font-black uppercase tracking-widest text-white">CONDECORACIONES MVP</h4>
                              </div>
                              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-12">Sé la figura del partido y recolecta medallas en tu perfil público.</p>
                           </motion.div>
                        </div>
                     </motion.div>

                     <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotateY: 25 }}
                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, type: "spring", stiffness: 40 }}
                        className="flex-1 w-full flex justify-center order-1 lg:order-2 perspective-[2000px] relative"
                     >
                        <div className="absolute inset-0 bg-primary/30 blur-[150px] rounded-full scale-110 -z-10 animate-pulse" />
                        <div className="scale-[1.2] sm:scale-[1.5] lg:scale-[1.8] transform-gpu z-10 my-20 lg:my-32">
                          <div className="animate-[float_6s_ease-in-out_infinite] hover:scale-110 hover:-rotate-y-12 transition-transform duration-700 drop-shadow-[0_60px_100px_rgba(0,0,0,0.9)] filter brightness-110">
                            <FifaCard player={dummyPlayer} />
                          </div>
                        </div>
                     </motion.div>
                  </div>
               </section>

               {/* 🔴 FINAL CTA BLOCK JUGADOR */}
               <section className="py-40 px-6 text-center border-b border-primary/20 relative bg-[#050505] overflow-hidden">
                  <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 blur-[200px] pointer-events-none" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/15 blur-[250px] pointer-events-none" />
                  
                  <motion.div 
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 1 }}
                     className="max-w-5xl mx-auto space-y-16 relative z-10"
                  >
                     <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] drop-shadow-2xl text-white">
                        ENTRA A <br/>
                        <span className="text-primary drop-shadow-[0_0_30px_rgba(44,252,125,0.3)]">LA CANCHA.</span>
                     </h2>
                     <p className="text-lg md:text-2xl font-bold text-zinc-400 uppercase tracking-widest max-w-3xl mx-auto leading-relaxed">
                        Únete a miles de jugadores que ya transformaron su manera de probar nivel. Demuestra tu jerarquía y conviértete en una leyenda local.
                     </p>
                     <div className="pt-10 flex flex-col items-center justify-center">
                        <Link href="/register" className="inline-block relative group">
                           <div className="absolute -inset-2 bg-primary/40 blur-xl rounded-full group-hover:scale-110 group-hover:bg-primary/60 transition-all duration-500" />
                           <button className="px-16 h-24 bg-primary text-black font-black uppercase text-xl tracking-[0.3em] rounded-full hover:bg-white hover:scale-110 active:scale-95 transition-all duration-500 flex items-center gap-6 relative z-10 shadow-[0_0_50px_rgba(44,252,125,0.6)]">
                              <span>VER MI CARTA</span>
                              <CheckCircle2 className="w-8 h-8" />
                           </button>
                        </Link>
                     </div>
                  </motion.div>
               </section>
             </>
          ) : (
             <>
               {/* 🔴 MARKETING PARA DUEÑOS (SELLING TO VENUE OWNERS) - TITANIC SCALE */}
               <section className="py-40 px-6 lg:px-12 relative overflow-hidden bg-[#020202] border-y border-primary/10">                 
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.02]">
                     <h1 className="text-[12rem] md:text-[22rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-white pr-10">
                        CERO FRICCIÓN
                     </h1>
                  </div>

                  <div className="max-w-[1500px] mx-auto rounded-[4rem] bg-[#0A0A0A] border border-white/5 p-10 md:p-16 lg:p-24 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] hover:border-primary/30 hover:shadow-[0_40px_100px_rgba(44,252,125,0.1)] transition-all duration-1000 group">
                     <div className="absolute inset-0 bg-gradient-to-tr from-black/90 to-transparent pointer-events-none z-0" />
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.08] pointer-events-none" />
                     <div className="absolute -left-40 -top-40 w-[1200px] h-[1200px] bg-primary/15 blur-[250px] rounded-full pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-70" />
                     
                     <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div 
                           initial={{ opacity: 0, y: 50 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ duration: 0.8 }}
                           className="space-y-14"
                        >
                           <div className="space-y-10">
                              <div className="inline-flex h-16 px-8 rounded-2xl bg-black border border-primary/50 items-center justify-center gap-4 shadow-[0_0_30px_rgba(44,252,125,0.2)]">
                                 <MapPin className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(44,252,125,0.8)]" />
                                 <span className="text-sm font-black uppercase tracking-[0.3em] text-white">POTENCIA TU PREDIO DEPORTIVO</span>
                              </div>
                              <h2 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] drop-shadow-2xl text-white">
                                 MÁXIMA <span className="text-zinc-500 pr-4 block lg:inline-block">OCUPACIÓN.</span><br/>
                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white whitespace-normal text-[12vw] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] mt-4 block drop-shadow-[0_0_20px_rgba(44,252,125,0.3)] pr-6 pb-2 leading-none max-w-full break-words">CERO FRICCIÓN.</span>
                              </h2>
                              <p className="text-lg md:text-2xl font-bold text-zinc-400 max-w-xl leading-relaxed pt-6">
                                 Despídete de los huecos vacíos y tu plata al aire. Pelotify automatiza las reservas, los pagos y la carga administrativa de tus canchas.
                              </p>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 border-y border-white/5 py-12">
                              <div className="space-y-4 pl-6 border-l-4 border-primary hover:-translate-y-1 transition-transform duration-300">
                                 <DollarSign className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.6)]" />
                                 <h5 className="text-base font-black uppercase tracking-widest text-white">Protege tu Caja Fuerte</h5>
                                 <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">Señas automatizadas 100% integradas a MercadoPago. Directo a tu banco.</p>
                              </div>
                              <div className="space-y-4 pl-6 border-l-4 border-primary hover:-translate-y-1 transition-transform duration-300">
                                 <BarChart3 className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.6)]" />
                                 <h5 className="text-base font-black uppercase tracking-widest text-white">Métricas de Emperador</h5>
                                 <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">Analíticas de ingresos, picos calientes de alquiler e historial de clientes.</p>
                              </div>
                              <div className="space-y-4 pl-6 border-l-4 border-primary hover:-translate-y-1 transition-transform duration-300">
                                 <Zap className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.6)]" />
                                 <h5 className="text-base font-black uppercase tracking-widest text-white">Autogestión Completa</h5>
                                 <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">El jugador arma su equipo y paga. Tú solo recibes la reserva lista y el dinero.</p>
                              </div>
                              <div className="space-y-4 pl-6 border-l-4 border-primary hover:-translate-y-1 transition-transform duration-300">
                                 <Globe className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.6)]" />
                                 <h5 className="text-base font-black uppercase tracking-widest text-white">Visibilidad Total</h5>
                                 <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">Aparece en el mapa frente a miles de jugadores. Aumenta tu demanda y llena tus horarios.</p>
                              </div>
                              <div className="space-y-4 pl-6 border-l-4 border-primary hover:-translate-y-1 transition-transform duration-300">
                                 <Users className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.6)]" />
                                 <h5 className="text-base font-black uppercase tracking-widest text-white">Filtro de Fiabilidad</h5>
                                 <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">Historial integrado. Bloquea de tus reservas a jugadores que cancelan a última hora sin pagar.</p>
                              </div>
                              <div className="space-y-4 pl-6 border-l-4 border-primary hover:-translate-y-1 transition-transform duration-300">
                                 <Trophy className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.6)]" />
                                 <h5 className="text-base font-black uppercase tracking-widest text-white">Predio Oficial</h5>
                                 <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">Valídate como sede élite y aloja competiciones oficiales de ranking para toda la comunidad.</p>
                              </div>
                           </div>
                        </motion.div>

                        <motion.div 
                           initial={{ opacity: 0, x: 50 }}
                           whileInView={{ opacity: 1, x: 0 }}
                           viewport={{ once: true }}
                           transition={{ duration: 1, type: "spring", stiffness: 30 }}
                           className="hidden lg:flex justify-end p-8 perspective-1000"
                        >
                           <div className="w-full max-w-lg aspect-[4/5] rounded-[3.5rem] bg-[#050505] border-2 border-primary/20 flex flex-col p-10 relative overflow-hidden shadow-[0_60px_100px_rgba(0,0,0,0.9)] transform rotate-y-[-15deg] group-hover:rotate-y-[-5deg] transition-transform duration-1000">
                              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                              <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                              
                              <div className="flex items-center justify-between mb-12 relative z-10">
                                 <span className="text-sm font-black uppercase tracking-widest text-primary">DASHBOARD</span>
                                 <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(44,252,125,1)]" />
                              </div>
                              
                              <div className="space-y-8 flex-1 relative z-10">
                                 <div className="p-8 rounded-[2rem] bg-black/50 border border-primary/10 space-y-4 backdrop-blur-md">
                                    <p className="text-xs uppercase font-black tracking-widest text-zinc-500">Recaudación (Hoy)</p>
                                    <p className="text-5xl font-black italic font-kanit text-white">$450.000</p>
                                    <div className="flex items-center gap-3">
                                       <span className="text-xs font-black text-black bg-primary px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(44,252,125,0.5)]">+14.2%</span>
                                    </div>
                                 </div>

                                 <div className="space-y-6 pt-6">
                                    <p className="text-xs uppercase font-black tracking-widest text-zinc-500">Turnos Ocupados</p>
                                    {[1, 2, 3, 4].map(i => (
                                       <div key={i} className="flex items-center gap-6">
                                          <span className="text-sm font-black text-zinc-400 w-14 text-right">{18 + i}:00</span>
                                          <div className="h-4 flex-1 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                                             <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '100%' }}
                                                transition={{ duration: 1.5, delay: i * 0.2, type: "spring" }}
                                                className="h-full bg-primary shadow-[0_0_20px_rgba(44,252,125,0.8)]" 
                                             />
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              
                              <div className="mt-12 flex items-center justify-center p-6 rounded-2xl bg-primary/10 text-primary border border-primary/30 relative z-10">
                                 <span className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                    <ShieldCheck className="w-6 h-6 drop-shadow-[0_0_8px_rgba(44,252,125,0.8)]" /> 
                                    SEDE VERIFICADA
                                 </span>
                              </div>
                           </div>
                        </motion.div>
                     </div>
                  </div>
               </section>

               {/* 🔴 NUEVA SECCIÓN: PERFIL DE ESTABLECIMIENTO (ESCAPARATE) */}
               <section className="py-40 px-6 lg:px-12 bg-[#050505] relative border-y border-primary/20 overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">
                     <h1 className="text-[12rem] md:text-[20rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-primary">
                        APARIENCIA
                     </h1>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/15 blur-[180px] pointer-events-none z-0" />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
                  
                  <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center gap-20 lg:gap-32 relative z-10">
                     
                     <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 space-y-14 order-2 lg:order-1"
                     >
                        <div className="space-y-6">
                           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(44,252,125,0.2)]">
                              <Sparkles className="w-5 h-5 text-primary" />
                              <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">TU PREDIO EN VITRINA</span>
                           </div>
                           <h2 className="text-6xl md:text-8xl lg:text-[7rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white">
                              ATRAE A <br />
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white drop-shadow-[0_0_30px_rgba(44,252,125,0.4)]">MÁS EQUIPOS.</span>
                           </h2>
                           <p className="text-lg md:text-xl font-medium text-zinc-300 leading-relaxed max-w-lg pt-4">
                              No eres unas canchas más. Tendrás tu propio perfil público digital con información de interés que impulsará las reservas de tu complejo.
                           </p>
                        </div>

                        <div className="space-y-8 border-l-4 border-primary pl-8">
                           <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                              className="space-y-3 hover:-translate-y-1 transition-transform"
                           >
                              <div className="flex items-center gap-4">
                                 <Activity className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
                                 <h4 className="text-xl font-black uppercase tracking-widest text-white">FOTOS Y CALIFICACIONES</h4>
                              </div>
                              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-12">Destaca tus instalaciones. El boca a boca en forma de estrellitas y reseñas de jugadores reales.</p>
                           </motion.div>
                           <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                              className="space-y-3 pt-6 border-t border-white/10 hover:-translate-y-1 transition-transform"
                           >
                              <div className="flex items-center gap-4">
                                 <MapPin className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
                                 <h4 className="text-xl font-black uppercase tracking-widest text-white">AMENIDADES Y UBICACIÓN</h4>
                              </div>
                              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-12">Desde duchas, bar para el 3er tiempo, parking exclusivo... muestra por qué deben alquilarte.</p>
                           </motion.div>
                        </div>
                     </motion.div>

                     <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotateY: 25 }}
                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, type: "spring", stiffness: 40 }}
                        className="flex-1 w-full flex justify-center order-1 lg:order-2 perspective-[2000px] relative"
                     >
                        <div className="absolute inset-0 bg-primary/30 blur-[150px] rounded-full scale-110 -z-10 animate-pulse" />
                        
                        <div className="w-full max-w-sm rounded-[3rem] bg-[#0A0A0A] border-2 border-primary/40 shadow-[0_40px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(44,252,125,0.2)] overflow-hidden transform-gpu z-10 animate-[float_6s_ease-in-out_infinite] hover:scale-105 hover:-rotate-y-12 transition-transform duration-700">
                           {/* Cover photo */}
                           <div className="h-48 bg-zinc-800 relative">
                              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-80" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                 <ShieldCheck className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(44,252,125,1)]" />
                                 <span className="text-white font-black text-xs uppercase tracking-widest bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">Sede Verificada</span>
                              </div>
                           </div>
                           
                           {/* Info */}
                           <div className="p-8 space-y-6 relative">
                              <div className="absolute -top-12 right-6 w-20 h-20 rounded-2xl bg-black border-2 border-primary overflow-hidden shadow-[0_0_20px_rgba(44,252,125,0.4)] flex items-center justify-center p-2">
                                 <img src="/logo_pelotify.png" className="w-full h-full object-contain" alt="Logo" />
                              </div>

                              <div>
                                 <h3 className="text-3xl font-black italic font-kanit uppercase text-white tracking-tighter">Complejo La Gambeta</h3>
                                 <div className="flex items-center gap-2 text-zinc-400 mt-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Av. Siempre Viva 123</span>
                                 </div>
                              </div>

                              <div className="flex gap-4 border-y border-white/10 py-5">
                                 <div className="flex-1 text-center border-r border-white/10">
                                    <p className="text-2xl font-black text-white">4.9</p>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Valoración</p>
                                 </div>
                                 <div className="flex-1 text-center border-r border-white/10">
                                    <p className="text-2xl font-black text-white">+500</p>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Partidos</p>
                                 </div>
                                 <div className="flex-1 text-center">
                                    <p className="text-2xl font-black text-white">6</p>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Canchas</p>
                                 </div>
                              </div>

                              <div className="space-y-3">
                                 <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Servicios Destacados</p>
                                 <div className="flex flex-wrap gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">⚽ Césped Sintético</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">🚿 Vestuarios</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">🍔 Bar</span>
                                 </div>
                              </div>

                              <button className="w-full mt-4 py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(44,252,125,0.4)] relative overflow-hidden group">
                                 <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12" />
                                 RESERVAR TURNO
                              </button>
                           </div>
                        </div>
                     </motion.div>
                  </div>
               </section>
               {/* 🔴 FINAL CTA BLOCK DUEÑO */}
               <section className="py-40 px-6 text-center border-b border-primary/20 relative bg-[#050505] overflow-hidden">
                  <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 blur-[200px] pointer-events-none" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/15 blur-[250px] pointer-events-none" />
                  
                  <motion.div 
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 1 }}
                     className="max-w-5xl mx-auto space-y-16 relative z-10"
                  >
                     <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] drop-shadow-2xl text-white">
                        DIGITALIZA <br/>
                        <span className="text-primary drop-shadow-[0_0_30px_rgba(44,252,125,0.3)]">TU PREDIO.</span>
                     </h2>
                     <p className="text-lg md:text-2xl font-bold text-zinc-400 uppercase tracking-widest max-w-3xl mx-auto leading-relaxed">
                        Accede al panel de control que empodera a las mejores ligas y sedes deportivas. Multiplica tu ocupación y protege tus cobros en automático.
                     </p>
                     <div className="pt-10 flex flex-col items-center justify-center">
                        <Link href="/canchas/register" className="inline-block relative group">
                           <div className="absolute -inset-2 bg-primary/40 blur-xl rounded-full group-hover:scale-110 group-hover:bg-primary/60 transition-all duration-500" />
                           <button className="px-16 h-24 bg-primary text-black font-black uppercase text-xl tracking-[0.3em] rounded-full hover:bg-white hover:scale-110 active:scale-95 transition-all duration-500 flex items-center gap-6 relative z-10 shadow-[0_0_50px_rgba(44,252,125,0.6)]">
                              <span>SUMAR MI COMPLEJO</span>
                              <CheckCircle2 className="w-8 h-8" />
                           </button>
                        </Link>
                     </div>
                  </motion.div>
               </section>
             </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 🟢 FOOTER */}
      <footer className="py-16 px-6 lg:px-12 bg-black border-t-4 border-primary/50 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none opacity-50" />
         <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="space-y-6 text-center md:text-left">
               <div className="flex items-center gap-4 justify-center md:justify-start">
                  <img src="/logo_pelotify.png" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(44,252,125,0.5)]" alt="Pelotify" />
                  <span className="text-3xl font-black italic uppercase tracking-tighter font-kanit text-white">PELOTI<span className="text-primary">FY</span></span>
               </div>
               <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">
                  La evolución definitiva del fútbol amateur.
               </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
               <Link href="/help" className="hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(44,252,125,0.5)]">Soporte</Link>
               <Link href="/terms" className="hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(44,252,125,0.5)]">Términos legales</Link>
               <Link href="/canchas/login" className="text-primary hover:text-white transition-colors flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                  Acceso Dueños <TargetIcon className="w-4 h-4" />
               </Link>
            </div>
            
            <div className="text-center md:text-right space-y-3">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">© 2026 PELOTIFY TODOS LOS DERECHOS RESERVADOS.</p>
            </div>
         </div>
      </footer>
    </div>
  );
}
