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
   Medal,
   Video,
   Shield,
   Star,
   Hexagon,
   Flame,
   Crown
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
         <nav className="fixed top-0 inset-x-0 h-20 sm:h-28 z-[100] px-4 sm:px-6 lg:px-12 flex items-center justify-between border-b border-primary/10 bg-[#050505]/80 backdrop-blur-3xl transition-all shadow-2xl">
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="flex items-center gap-2 sm:gap-4 group cursor-pointer"
            >
               <div className="w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center relative transition-transform duration-500 group-hover:scale-110 shrink-0">
                  <div className="absolute inset-0 bg-primary/15 blur-[20px] rounded-full opacity-40 shrink-0" />
                  <img src="/logo_pelotify.png" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(44,252,125,0.2)] animate-float" alt="Pelotify" />
               </div>
               <div className="flex flex-col justify-center">
                  <span className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter font-kanit leading-none drop-shadow-lg text-white">
                     PELOTI<span className="text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.5)]">FY</span>
                  </span>
                  <span className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-primary text-center mt-1">
                     DOMINA EL POTRERO
                  </span>
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="flex items-center gap-3 md:gap-10"
            >
               <Link href="/login">
                  <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="h-9 sm:h-12 md:h-14 px-4 sm:px-6 md:px-10 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-[0.05em] sm:tracking-[0.2em] rounded-xl sm:rounded-2xl hover:bg-primary hover:shadow-[0_0_30px_rgba(44,252,125,0.6)] transition-all duration-300 whitespace-nowrap"
                  >
                     INGRESAR
                  </motion.button>
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
               <h1 className="text-[8rem] sm:text-[20rem] md:text-[35rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-primary">
                  FÚTBOL
               </h1>
            </div>

            {/* Aesthetic Logo Container */}
            <motion.div
               initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
               animate={{ opacity: 1, scale: 1, rotateY: 0 }}
               transition={{ duration: 1.5, type: "spring", stiffness: 40 }}
               className="relative group perspective-1000 z-[110] mt-24 flex flex-col items-center"
            >
               <div className="absolute -inset-10 bg-primary/30 blur-[60px] rounded-full group-hover:bg-primary/50 transition-all duration-700 animate-pulse" />
               <div className="w-36 h-36 md:w-56 md:h-56 relative rounded-[3rem] bg-gradient-to-br from-[#0A0A0A] to-black flex items-center justify-center border-2 border-primary/30 shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(44,252,125,0.2)] backdrop-blur-3xl group-hover:scale-110 group-hover:border-primary/60 transition-all duration-700 z-10 preserve-3d">
                  <img src="/logo_pelotify.png" className="w-24 h-24 md:w-40 md:h-40 object-contain drop-shadow-[0_0_25px_rgba(44,252,125,1)] animate-float" alt="Pelotify Main Logo" />
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
               className="space-y-12 max-w-6xl relative z-10 w-full mt-10"
            >
               <div className="space-y-10 flex flex-col items-center">

                  <div className="space-y-4">
                     <h1 className="text-5xl sm:text-7xl md:text-[10rem] lg:text-[11rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] text-white drop-shadow-2xl">
                        DOMINÁ <br />
                        <span className="text-primary drop-shadow-[0_0_40px_rgba(44,252,125,0.6)]">LA CANCHA</span>
                     </h1>

                     {/* ⬇️ SCROLL INDICATOR */}
                     <div className="flex justify-center w-full py-4 relative z-20">
                        <motion.div
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 2, duration: 1 }}
                           onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                           className="flex flex-col items-center gap-3 cursor-pointer group"
                        >
                           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-primary transition-colors duration-300">SCROLL</span>
                           <motion.div
                              animate={{ y: [0, 8, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                              className="w-8 h-12 rounded-full border-2 border-primary/30 flex items-start justify-center p-2 group-hover:border-primary transition-colors duration-300 bg-black/50 backdrop-blur-sm shadow-[0_0_15px_rgba(44,252,125,0.05)]"
                           >
                              <motion.div
                                 animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                                 transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                 className="w-1 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(44,252,125,0.8)]"
                              />
                           </motion.div>
                        </motion.div>
                     </div>

                     <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-sm md:text-xl font-bold tracking-widest md:tracking-[0.25em] uppercase text-zinc-400 max-w-4xl mx-auto pt-8 border-t border-white/10 mt-6 leading-relaxed"
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
                  <div className="flex flex-row items-stretch bg-black border-2 border-white/10 p-1.5 sm:p-2 rounded-3xl sm:rounded-full relative shadow-[0_40px_100px_rgba(0,0,0,1)] w-[95%] sm:w-auto max-w-[400px] sm:max-w-none mx-auto">
                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('jugador')}
                        className={`relative flex-1 sm:flex-none px-2 sm:px-12 md:px-16 py-4 sm:py-6 md:py-8 rounded-3xl sm:rounded-full font-black uppercase tracking-[0.05em] sm:tracking-[0.25em] text-[10px] sm:text-xs md:text-sm transition-all duration-500 z-10 flex items-center justify-center text-center leading-none ${viewMode === 'jugador' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
                     >
                        {viewMode === 'jugador' && (
                           <motion.div layoutId="viewModeIndicator" className="absolute inset-0 bg-primary rounded-3xl sm:rounded-full shadow-[0_0_40px_rgba(44,252,125,0.6)] -z-10" transition={{ type: 'spring', stiffness: 50, damping: 10 }} />
                        )}
                        SOY JUGADOR
                     </motion.button>
                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('dueno')}
                        className={`relative flex-1 sm:flex-none px-2 sm:px-12 md:px-16 py-4 sm:py-6 md:py-8 rounded-3xl sm:rounded-full font-black uppercase tracking-[0.05em] sm:tracking-[0.25em] text-[10px] sm:text-xs md:text-sm transition-all duration-500 z-10 flex items-center justify-center gap-1.5 sm:gap-3 text-center leading-none ${viewMode === 'dueno' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
                     >
                        {viewMode === 'dueno' && (
                           <motion.div layoutId="viewModeIndicator" className="absolute inset-0 bg-primary rounded-3xl sm:rounded-full shadow-[0_0_40px_rgba(44,252,125,0.6)] -z-10" transition={{ type: 'spring', stiffness: 50, damping: 10 }} />
                        )}
                        SOY DUEÑO
                     </motion.button>
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
                     <section className="py-20 md:py-40 px-6 lg:px-12 bg-[#020202] border-t border-white/5 relative overflow-hidden">
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
                              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase font-kanit italic tracking-tighter text-white">
                                 EL ECOSISTEMA <span className="text-primary drop-shadow-[0_0_20px_rgba(44,252,125,0.3)]">PERFECTO.</span>
                              </h2>
                              <p className="text-base md:text-xl text-zinc-400 font-bold max-w-3xl mx-auto uppercase tracking-widest leading-relaxed">
                                 Diseñado para la gloria. Todo el flujo de tu equipo en un solo lugar.
                              </p>
                           </motion.div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <FeatureCard
                                 title="Reservas al Instante"
                                 desc="Buscador inteligente con disponibilidad 100% real. Elige tu sede,  y arma el futbol."
                                 icon={Search}
                                 delay={0.1}
                              />
                              <FeatureCard
                                 title="Integración Segura"
                                 desc="Mercado Pago nativo. Todos pueden pagar su parte directamente por la plataforma."
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

                     {/* 🔵 NUEVA SECCIÓN: BUSCADOR DE PARTIDOS (MAPA EN VIVO) */}
                     <section className="py-20 md:py-40 px-6 lg:px-12 bg-[#050505] relative border-y border-primary/10 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.02]">
                           <h1 className="text-[5rem] sm:text-[15rem] md:text-[25rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-primary">
                              EN VIVO
                           </h1>
                        </div>

                        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-32 relative z-10">
                           <motion.div
                              initial={{ opacity: 0, x: -50 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1 }}
                              className="flex-1 space-y-12"
                           >
                              <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-primary/10 border border-primary/30 shadow-[0_0_30px_rgba(44,252,125,0.2)]">
                                 <Activity className="w-8 h-8 text-primary animate-pulse" />
                                 <span className="text-sm font-black uppercase tracking-[0.4em] text-primary">PRÓXIMOS PARTIDOS EN VIVO</span>
                              </div>

                              <h2 className="text-5xl md:text-8xl lg:text-[9rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] text-white">
                                 ENCUENTRA PARTIDO <br />
                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white drop-shadow-[0_0_40px_rgba(44,252,125,0.5)]">PARA HOY.</span>
                              </h2>

                              <p className="text-lg md:text-3xl font-bold text-zinc-400 leading-relaxed max-w-2xl italic uppercase tracking-widest">
                                 Explora el mapa y únete a partidos que necesitan jugadores ahora mismo. Sin grupos de WhatsApp, sin esperas. Elige tu nivel, reserva tu lugar y salta a la cancha.
                              </p>


                           </motion.div>

                           <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, type: "spring" }}
                              className="flex-1 w-full relative"
                           >
                              <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full scale-90 -z-10 animate-pulse" />

                              <div className="w-full aspect-square md:aspect-[4/3] rounded-[3.5rem] bg-[#0A0A0A] border-4 border-white/5 overflow-hidden relative shadow-[0_60px_100px_rgba(0,0,0,1)] group">
                                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.1]" />

                                 <div className="absolute inset-4 rounded-[2.5rem] border border-white/5 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
                                    <div className="absolute inset-0 opacity-20">
                                       {Array.from({ length: 10 }).map((_, i) => (
                                          <div key={i} className="absolute w-px h-full bg-primary/20" style={{ left: `${(i + 1) * 10}%` }} />
                                       ))}
                                       {Array.from({ length: 10 }).map((_, i) => (
                                          <div key={i} className="absolute h-px w-full bg-primary/20" style={{ top: `${(i + 1) * 10}%` }} />
                                       ))}
                                    </div>

                                    {[
                                       { x: '25%', y: '35%', name: 'F5 Estelar', time: '21:00hs', status: 'FALTAN 2' },
                                       { x: '65%', y: '25%', name: 'Desafío Elite', time: '19:30hs', status: 'FALTA 1' },
                                       { x: '45%', y: '65%', name: 'Amistoso Mixto', time: '22:00hs', status: 'CUPO LLENO', full: true },
                                       { x: '75%', y: '70%', name: 'Copa Pelotify', time: '20:00hs', status: '3 LUGARES' }
                                    ].map((match, i) => (
                                       <motion.div
                                          key={i}
                                          initial={{ scale: 0 }}
                                          whileInView={{ scale: 1 }}
                                          transition={{ delay: 0.5 + (i * 0.2), type: "spring" }}
                                          className="absolute z-20 group/pin"
                                          style={{ left: match.x, top: match.y }}
                                       >
                                          <div className="relative pointer-events-auto">
                                             <div className={cn(
                                                "absolute -inset-4 blur-xl rounded-full animate-pulse opacity-0 group-hover/pin:opacity-100 transition-opacity",
                                                match.full ? "bg-zinc-500/40" : "bg-primary/40"
                                             )} />
                                             <div className={cn(
                                                "w-6 h-6 rounded-full border-4 border-black shadow-lg relative z-10 cursor-pointer group-hover/pin:scale-125 transition-transform",
                                                match.full ? "bg-zinc-600" : "bg-primary shadow-[0_0_20px_rgba(44,252,125,0.8)]"
                                             )} />

                                             <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover/pin:opacity-100 transition-all scale-90 group-hover/pin:scale-100 bg-black border border-primary/30 p-4 rounded-2xl backdrop-blur-md min-w-[180px] z-30 pointer-events-none shadow-2xl">
                                                <div className="flex justify-between items-start mb-2">
                                                   <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">{match.name}</p>
                                                   <span className="text-[8px] font-black text-zinc-500">{match.time}</span>
                                                </div>
                                                <p className={cn(
                                                   "text-[9px] font-black tracking-[0.2em]",
                                                   match.full ? "text-zinc-500" : "text-white"
                                                )}>
                                                   {match.status}
                                                </p>
                                             </div>
                                          </div>
                                       </motion.div>
                                    ))}

                                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-center">
                                       <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
                                          <div className="flex gap-2">
                                             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                             <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                             <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                          </div>
                                          <span className="text-[10px] font-black uppercase tracking-widest text-white">4 PARTIDOS DISPONIBLES CERCA</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        </div>
                     </section>

                     {/* 🔵 THE PLAYER IDENTITY (MARKETING FOCUSED ON FIFA CARD - FULL GREEN AESTHETIC) */}
                     <section className="py-20 md:py-40 px-6 lg:px-12 bg-[#050505] relative border-y border-primary/20 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">
                           <h1 className="text-[6rem] sm:text-[15rem] md:text-[25rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-primary">
                              TU LEGADO
                           </h1>
                        </div>

                        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/15 blur-[180px] pointer-events-none z-0" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />

                        <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-20 lg:gap-16 md:gap-32 relative z-10">

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
                                 <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[8rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white">
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

                     {/* 🔵 NUEVA SECCIÓN: ESCALAMIENTO DE RANGOS (SISTEMA ELO) */}
                     <section className="py-20 md:py-56 px-6 lg:px-12 bg-[#020202] relative border-b border-primary/10 overflow-hidden">
                        <div className="max-w-[1400px] mx-auto text-center mb-24 space-y-8 relative z-10">
                           <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              className="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md"
                           >
                              <Trophy className="w-5 h-5 text-primary" />
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">EL CAMINO A LA CIMA</span>
                           </motion.div>
                           <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] text-white">
                              SÉ <span className="text-primary">LEYENDA.</span> <br />
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-600">SUBE DE NIVEL.</span>
                           </h2>
                           <p className="text-sm md:text-xl font-bold text-zinc-500 uppercase tracking-[0.2em] max-w-4xl mx-auto">
                              Tu ELO define tu prestigio. De Hierro a Maestro, cada victoria cuenta para tu legado global.
                           </p>
                        </div>

                        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 px-4">
                           {[
                              { name: 'HIERRO', color: 'from-zinc-900 to-black', level: '0', icon: Shield, desc: '"EL PUNTO DE PARTIDA DE TODO JUGADOR."', glow: 'group-hover:shadow-zinc-500/20' },
                              { name: 'BRONCE', color: 'from-orange-950 to-black', level: '1,000', icon: Zap, desc: '"YA NO SOS HORRIBLE. HAS DEMOSTRADO CONSISTENCIA EN LA CANCHA."', glow: 'group-hover:shadow-orange-500/20' },
                              { name: 'PLATA', color: 'from-[#1e293b] to-black', level: '3,000', icon: Medal, desc: '"UN JUGADOR RESPETADO QUE ENTIENDE LA DINÁMICA DEL JUEGO."', glow: 'group-hover:shadow-slate-400/20' },
                              { name: 'ORO', color: 'from-[#451a03] to-black', level: '6,000', icon: Trophy, desc: '"TALENTO PURO. ERES LA REFERENCIA DE TU EQUIPO."', glow: 'group-hover:shadow-yellow-500/20' },
                              { name: 'PLATINO', color: 'from-[#083344] to-black', level: '10,000', icon: Star, desc: '"DOMINIO TOTAL. POCOS PUEDEN SEGUIRTE EL RITMO CUANDO ACELERAS."', glow: 'group-hover:shadow-cyan-500/20' },
                              { name: 'DIAMANTE', color: 'from-[#1e3a8a] to-black', level: '16,000', icon: Hexagon, desc: '"LA JOYA DE LA CANCHA. TU NOMBRE YA SUENA EN CADA ESTADIO."', glow: 'group-hover:shadow-blue-500/20' },
                              { name: 'ELITE', color: 'from-[#3b0764] to-black', level: '25,000', icon: Flame, desc: '"SOLO PARA LOS PRIVILEGIADOS. EL 1% DE LA COMUNIDAD DE PELOTIFY."', glow: 'group-hover:shadow-purple-500/20' },
                              { name: 'LEYENDA', color: 'from-[#064e3b] to-black', level: '40,000', icon: Crown, desc: '"INMORTAL. TU ESTATUS TRASCIENDE LOS PARTIDOS. ERES HISTORIA PURA."', special: true, glow: 'group-hover:shadow-primary/30' },
                           ].map((rank, i) => (
                              <motion.div
                                 key={i}
                                 initial={{ opacity: 0, y: 30 }}
                                 whileInView={{ opacity: 1, y: 0 }}
                                 transition={{ delay: i * 0.05 }}
                                 className="group perspective-1000"
                              >
                                 <div className={cn(
                                    "aspect-[3/5] rounded-[2.5rem] p-6 flex flex-col items-center text-center border border-white/5 bg-gradient-to-b transition-all duration-700 group-hover:-translate-y-4 shadow-2xl relative overflow-hidden",
                                    rank.color,
                                    rank.glow,
                                    rank.special && "ring-2 ring-primary/40 shadow-primary/20"
                                 )}>
                                    {/* Icon Glow */}
                                    <div className="absolute top-10 w-24 h-24 bg-white/5 blur-[40px] rounded-full pointer-events-none" />

                                    <div className="space-y-8 flex-1 flex flex-col items-center w-full">
                                       {/* Icon Container */}
                                       <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                          <rank.icon className={cn(
                                             "w-8 h-8",
                                             i === 0 && "text-zinc-400",
                                             i === 1 && "text-orange-500",
                                             i === 2 && "text-slate-300",
                                             i === 3 && "text-yellow-500",
                                             i === 4 && "text-cyan-400",
                                             i === 5 && "text-blue-400",
                                             i === 6 && "text-emerald-400",
                                             i === 7 && "text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.8)]"
                                          )} />
                                       </div>

                                       <div className="space-y-4 w-full">
                                          <h5 className={cn(
                                             "text-2xl font-black italic font-kanit uppercase leading-none tracking-tighter",
                                             i === 0 && "text-white",
                                             i === 1 && "text-orange-500",
                                             i === 2 && "text-white",
                                             i === 3 && "text-yellow-500",
                                             i === 4 && "text-cyan-400",
                                             i === 5 && "text-blue-400",
                                             i === 6 && "text-emerald-400",
                                             i === 7 && "text-primary"
                                          )}>{rank.name}</h5>

                                          {/* XP Badge */}
                                          <div className="py-1.5 px-4 rounded-full bg-white/5 border border-white/10 inline-block">
                                             <p className="text-[8px] font-black tracking-widest text-zinc-500 uppercase">MÍNIMO <span className="text-white">{rank.level} XP</span></p>
                                          </div>
                                       </div>

                                       {/* Quote */}
                                       <p className="text-[9px] font-black italic text-zinc-400 leading-relaxed px-2 line-clamp-4">
                                          {rank.desc}
                                       </p>

                                       {/* Status Decoration */}
                                       <div className="w-full pt-6 space-y-4 mt-auto">
                                          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                          <p className="text-[7px] font-black tracking-[0.3em] text-zinc-600 uppercase">ESTATUS REGISTRADO</p>
                                       </div>
                                    </div>
                                 </div>
                              </motion.div>
                           ))}
                        </div>
                     </section>

                     {/* 🔵 SECCIÓN FUTTOK - EL ESCAPARATE DE TALENTO SEGURO */}
                     <section className="py-20 md:py-56 px-6 lg:px-12 bg-black relative border-b border-primary/10 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">
                           <h1 className="text-[5rem] sm:text-[15rem] md:text-[25rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-primary">
                              TENDENCIA
                           </h1>
                        </div>

                        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-32 relative z-10">
                           <motion.div
                              initial={{ opacity: 0, x: -50 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1 }}
                              className="flex-1 space-y-12"
                           >
                              <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-primary/10 border border-primary/30 shadow-[0_0_30px_rgba(44,252,125,0.2)]">
                                 <Video className="w-8 h-8 text-primary animate-pulse" />
                                 <span className="text-sm font-black uppercase tracking-[0.4em] text-primary">FUTTOK: TU MOMENTO DE GLORIA</span>
                              </div>

                              <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] text-white">
                                 DALE PLAY A <br />
                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white drop-shadow-[0_0_40px_rgba(44,252,125,0.5)]">TU TALENTO.</span>
                              </h2>

                              <p className="text-lg md:text-3xl font-bold text-zinc-400 leading-relaxed max-w-2xl italic uppercase tracking-widest">
                                 Sube tus mejores jugadas, compite por ser tendencia y deja que la comunidad te descubra. FutTok es el escaparate vertical definitivo para los que dominan el potrero.
                              </p>

                              <div className="flex flex-wrap gap-6 pt-6">
                                 <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(44,252,125,0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="h-20 px-12 bg-primary text-black font-black uppercase tracking-[0.3em] text-sm md:text-lg rounded-2xl transition-all duration-500"
                                 >
                                    EXPLORAR CLIPS
                                 </motion.button>
                                 <div className="flex flex-col justify-center">
                                    <span className="text-xl font-black text-white">+50K</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Vistas hoy</span>
                                 </div>
                              </div>
                           </motion.div>

                           <motion.div
                              initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
                              whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, type: "spring" }}
                              className="flex-1 flex justify-center relative perspective-1000"
                           >
                              <div className="absolute inset-x-0 top-0 h-full bg-primary/20 blur-[150px] rounded-full scale-110 -z-10 animate-pulse" />

                              <div className="w-72 h-[600px] md:w-80 md:h-[650px] rounded-[3.5rem] bg-zinc-900 border-[12px] border-zinc-800 shadow-[0_50px_100px_rgba(0,0,0,1)] relative overflow-hidden group transition-all duration-700 hover:rotate-0 hover:scale-110 shadow-2xl hover:shadow-primary/20">
                                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-80 group-hover:scale-110 transition-transform duration-2000" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                                 <div className="absolute top-10 left-6 right-6 flex justify-between text-white/40 font-black text-[10px] tracking-widest">
                                    <span>FUTTOK LIVE</span>
                                    <div className="flex gap-1 items-center">
                                       <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                                       <span>EN VIVO</span>
                                    </div>
                                 </div>

                                 <div className="absolute bottom-12 left-8 right-8 space-y-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black font-black text-xl shadow-lg">M</div>
                                       <div>
                                          <p className="text-sm font-black uppercase tracking-widest text-white italic">@maestro_fu</p>
                                          <div className="flex items-center gap-2">
                                             <span className="w-2 h-2 rounded-full bg-primary" />
                                             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Nivel 99</p>
                                          </div>
                                       </div>
                                    </div>
                                    <p className="text-xs font-bold text-white/90 leading-relaxed uppercase tracking-tighter line-clamp-3">
                                       Golazo de chilena en el último minuto para ganar la final del torneo elite. 🔥👑 #Pelotify #FutTok #Fútbol
                                    </p>
                                 </div>

                                 <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-10 text-white z-20">
                                    <div className="flex flex-col items-center gap-2">
                                       <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:bg-primary group-hover:text-black transition-all">
                                          <CheckCircle2 className="w-7 h-7" />
                                       </div>
                                       <span className="text-[10px] font-black uppercase tracking-widest">14.2K</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                       <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
                                          <Zap className="w-7 h-7 text-primary" />
                                       </div>
                                       <span className="text-[10px] font-black uppercase tracking-widest">4.8K</span>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        </div>
                     </section>

                     {/* 🔵 SECCIÓN TORNEOS - LA COMPETICIÓN DEFINITIVA */}
                     <section className="py-20 md:py-56 px-6 lg:px-12 bg-[#020202] relative border-b border-primary/20 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">
                           <h1 className="text-[5rem] sm:text-[15rem] md:text-[25rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-white">
                              GLORIA
                           </h1>
                        </div>

                        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row-reverse items-center gap-16 md:gap-32 relative z-10">
                           <motion.div
                              initial={{ opacity: 0, x: 50 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1 }}
                              className="flex-1 space-y-12"
                           >
                              <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-primary/10 border border-primary/30 shadow-[0_0_30px_rgba(44,252,125,0.2)]">
                                 <Trophy className="w-8 h-8 text-primary" />
                                 <span className="text-sm font-black uppercase tracking-[0.4em] text-primary">RECOMPENSAS Y LEGADO</span>
                              </div>

                              <h2 className="text-5xl md:text-8xl lg:text-[9.5rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] text-white">
                                 GLORIA Y <br />
                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white drop-shadow-[0_0_40px_rgba(44,252,125,0.5)]">RECOMPENSAS.</span>
                              </h2>

                              <p className="text-lg md:text-3xl font-bold text-zinc-400 leading-relaxed max-w-2xl italic uppercase tracking-widest">
                                 Inscribe a tu equipo, sube de división y compite por premios en efectivo en las sedes más exclusivas de la ciudad. El reconocimiento es para muchos, la gloria eterna solo para los campeones.
                              </p>

                              <div className="grid grid-cols-2 gap-8 py-10 border-y border-white/5">
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                       <DollarSign className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.6)]" />
                                       <h4 className="text-xl font-black uppercase tracking-widest text-white">CASH PRIZES</h4>
                                    </div>
                                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest leading-loose">Premios en efectivo directos por MercadoPago para los ganadores del podio.</p>
                                 </div>
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                       <Award className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.6)]" />
                                       <h4 className="text-xl font-black uppercase tracking-widest text-white">HALL OF FAME</h4>
                                    </div>
                                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest leading-loose">Tu equipo inmortalizado en la historia de la liga local para siempre.</p>
                                 </div>
                              </div>

                              <motion.button
                                 whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(44,252,125,0.4)' }}
                                 whileTap={{ scale: 0.95 }}
                                 className="h-20 px-12 bg-primary text-black font-black uppercase tracking-[0.3em] text-sm md:text-lg rounded-2xl transition-all duration-500"
                              >
                                 VER TORNEOS ACTIVOS
                              </motion.button>
                           </motion.div>

                           <motion.div
                              initial={{ opacity: 0, scale: 0.7, y: 50 }}
                              whileInView={{ opacity: 1, scale: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, type: "spring", stiffness: 40 }}
                              className="flex-1 flex justify-center relative perspective-1000"
                           >
                              <div className="absolute inset-x-0 top-0 h-full bg-primary/30 blur-[150px] rounded-full scale-110 -z-10 animate-pulse" />
                              <div className="relative group">
                                 <div className="absolute -inset-10 bg-gradient-to-tr from-primary/40 to-white/20 blur-[80px] rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
                                 <Trophy className="w-64 h-64 md:w-96 md:h-96 text-white drop-shadow-[0_0_80px_rgba(44,252,125,1)] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 relative z-10" />

                                 <motion.div
                                    animate={{
                                       opacity: [0.2, 0.5, 0.2],
                                       scale: [1, 1.1, 1],
                                       rotate: [0, 90, 180, 270, 360]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-4 border-dashed border-primary/40 rounded-full scale-125 -z-10"
                                 />
                              </div>
                           </motion.div>
                        </div>
                     </section>

                     {/* 🔴 FINAL CTA BLOCK JUGADOR */}
                     <section className="py-20 md:py-40 px-6 text-center border-b border-primary/20 relative bg-[#050505] overflow-hidden">
                        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 blur-[200px] pointer-events-none" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/15 blur-[250px] pointer-events-none" />

                        <motion.div
                           initial={{ opacity: 0, y: 50 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ duration: 1 }}
                           className="max-w-5xl mx-auto space-y-16 relative z-10"
                        >
                           <h2 className="text-5xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] drop-shadow-2xl text-white">
                              ENTRA A <br />
                              <span className="text-primary drop-shadow-[0_0_30px_rgba(44,252,125,0.3)]">LA CANCHA.</span>
                           </h2>
                           <p className="text-lg md:text-2xl font-bold text-zinc-400 uppercase tracking-widest max-w-3xl mx-auto leading-relaxed">
                              Únete a miles de jugadores que ya transformaron su manera de probar nivel. Demuestra tu jerarquía y conviértete en una leyenda local.
                           </p>
                           <div className="pt-10 flex flex-col items-center justify-center">
                              <Link href="/register" className="inline-block relative group">
                                 <div className="absolute -inset-2 bg-primary/40 blur-xl rounded-full group-hover:scale-110 group-hover:bg-primary/60 transition-all duration-500" />
                                 <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 sm:px-16 h-16 sm:h-24 bg-primary text-black font-black uppercase text-[11px] sm:text-base lg:text-xl tracking-[0.3em] rounded-full hover:bg-white transition-all duration-500 flex items-center gap-6 relative z-10 shadow-[0_0_50px_rgba(44,252,125,0.6)]"
                                 >
                                    <span>VER MI CARTA</span>
                                    <CheckCircle2 className="w-8 h-8" />
                                 </motion.button>
                              </Link>
                           </div>
                        </motion.div>
                     </section>
                  </>
               ) : (
                  <>
                     {/* 🔴 MARKETING PARA DUEÑOS (SELLING TO VENUE OWNERS) - TITANIC SCALE */}
                     <section className="py-20 md:py-40 px-6 lg:px-12 relative overflow-hidden bg-[#020202] border-y border-primary/10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.02]">
                           <h1 className="text-[5rem] sm:text-[12rem] md:text-[22rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-white pr-10">
                              CERO FRICCIÓN
                           </h1>
                        </div>

                        <div className="max-w-[1500px] mx-auto rounded-[4rem] bg-[#0A0A0A] border border-white/5 p-10 md:p-16 lg:p-24 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] hover:border-primary/30 hover:shadow-[0_40px_100px_rgba(44,252,125,0.1)] transition-all duration-1000 group">
                           <div className="absolute inset-0 bg-gradient-to-tr from-black/90 to-transparent pointer-events-none z-0" />
                           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.08] pointer-events-none" />
                           <div className="absolute -left-40 -top-40 w-[1200px] h-[1200px] bg-primary/15 blur-[250px] rounded-full pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-70" />

                           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center">
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
                                    <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] drop-shadow-2xl text-white">
                                       MÁXIMA <span className="text-zinc-500 pr-4 block lg:inline-block">OCUPACIÓN.</span><br />
                                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white whitespace-normal text-[13vw] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] mt-4 block drop-shadow-[0_0_20px_rgba(44,252,125,0.3)] pr-6 pb-2 leading-none max-w-full break-words">CERO FRICCIÓN.</span>
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
                     <section className="py-20 md:py-40 px-6 lg:px-12 bg-[#050505] relative border-y border-primary/20 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">
                           <h1 className="text-[5rem] sm:text-[12rem] md:text-[20rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-primary">
                              APARIENCIA
                           </h1>
                        </div>

                        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/15 blur-[180px] pointer-events-none z-0" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />

                        <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-20 lg:gap-16 md:gap-32 relative z-10">

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
                                 <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.85] text-white">
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

                                    <motion.button
                                       whileHover={{ scale: 1.05 }}
                                       whileTap={{ scale: 0.95 }}
                                       className="w-full mt-4 py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-sm transition-shadow shadow-[0_0_20px_rgba(44,252,125,0.4)] relative overflow-hidden group"
                                    >
                                       <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12" />
                                       RESERVAR TURNO
                                    </motion.button>
                                 </div>
                              </div>
                           </motion.div>
                        </div>
                     </section>

                     {/* 🔴 NUEVA SECCIÓN PARA DUEÑOS: GESTIÓN DE TORNEOS */}
                     <section className="py-20 md:py-40 px-6 lg:px-12 bg-[#020202] relative border-b border-primary/20 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.02]">
                           <h1 className="text-[5rem] sm:text-[12rem] md:text-[22rem] font-black italic font-kanit uppercase leading-none whitespace-nowrap text-white">
                              COMPETICIÓN
                           </h1>
                        </div>

                        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row-reverse items-center gap-16 md:gap-32 relative z-10">
                           <motion.div
                              initial={{ opacity: 0, x: 50 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1 }}
                              className="flex-1 space-y-12"
                           >
                              <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-primary/10 border border-primary/30 shadow-[0_0_30px_rgba(44,252,125,0.2)]">
                                 <Trophy className="w-8 h-8 text-primary" />
                                 <span className="text-sm font-black uppercase tracking-[0.4em] text-primary">NEGOCIO RECURRENTE</span>
                              </div>

                              <h2 className="text-5xl md:text-8xl lg:text-[8.5rem] font-black font-kanit italic uppercase tracking-tighter leading-[0.8] text-white">
                                 TU LIGA <br />
                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white drop-shadow-[0_0_40px_rgba(44,252,125,0.5)]">PROFESIONAL.</span>
                              </h2>

                              <p className="text-lg md:text-3xl font-bold text-zinc-400 leading-relaxed max-w-2xl italic uppercase tracking-widest">
                                 No solo alquiles canchas. Crea comunidades. Nuestra plataforma automatiza fixtures, tablas y pagos de inscripciones para que tú solo veas rodar la pelota.
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-10 border-y border-white/5 uppercase">
                                 <div className="space-y-3">
                                    <h4 className="text-xl font-black text-white">Fixtures Automáticos</h4>
                                    <p className="text-xs font-bold text-zinc-500 tracking-widest leading-relaxed">El sistema genera el calendario de todo el año en un segundo.</p>
                                 </div>
                                 <div className="space-y-3">
                                    <h4 className="text-xl font-black text-white">Tablas en Real-time</h4>
                                    <p className="text-xs font-bold text-zinc-500 tracking-widest leading-relaxed">Los resultados se actualizan al instante para que todos lo sigan.</p>
                                 </div>
                              </div>
                              <motion.div
                                 initial={{ opacity: 0, y: 20 }}
                                 whileInView={{ opacity: 1, y: 0 }}
                                 className="flex items-center gap-6 pt-6"
                              >

                              </motion.div>
                           </motion.div>

                           <motion.div
                              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, type: "spring" }}
                              className="flex-1 w-full bg-[#0A0A0A] border-4 border-primary/20 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group"
                           >
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                              <div className="space-y-10 relative z-10">
                                 <div className="flex items-center justify-between border-b border-white/10 pb-8">
                                    <div className="space-y-1">
                                       <h3 className="text-2xl font-black italic font-kanit text-white uppercase tracking-tighter">TABLA LIGA ELITE</h3>
                                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Temporada Apertura 2024</p>
                                    </div>
                                    <div className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary font-black text-[10px] animate-pulse">EN VIVO</div>
                                 </div>
                                 <div className="space-y-4">
                                    {[
                                       { pos: 1, team: "GALÁCTICOS FC", pts: 24, win: "8 PJ • 8 PG", color: "text-primary" },
                                       { pos: 2, team: "ROSARIO CENTRAL", pts: 21, win: "8 PJ • 7 PG", color: "text-white" },
                                       { pos: 3, team: "LA MÁQUINA", pts: 18, win: "8 PJ • 6 PG", color: "text-white" }
                                    ].map((team, i) => (
                                       <motion.div
                                          key={i}
                                          initial={{ opacity: 0, x: -20 }}
                                          whileInView={{ opacity: 1, x: 0 }}
                                          transition={{ delay: i * 0.1 }}
                                          className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-500 cursor-pointer"
                                       >
                                          <span className="text-3xl font-black text-primary/40 w-8 italic">{team.pos}</span>
                                          <div className="flex-1">
                                             <p className={cn("text-lg font-black uppercase tracking-tight", team.color)}>{team.team}</p>
                                             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{team.win}</p>
                                          </div>
                                          <div className="text-right">
                                             <p className="text-2xl font-black text-white italic leading-none">{team.pts}</p>
                                             <p className="text-[8px] font-black text-primary uppercase">PTS</p>
                                          </div>
                                       </motion.div>
                                    ))}
                                 </div>
                                 <div className="pt-4 flex justify-center">
                                    <Link href="/canchas/tournaments" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-white transition-colors">CONFIGURAR MI TORNEO →</Link>
                                 </div>
                              </div>
                           </motion.div>
                        </div>
                     </section>

                     {/* 🔴 FINAL CTA BLOCK DUEÑO */}
                     <section className="py-20 md:py-40 px-6 text-center border-b border-primary/20 relative bg-[#050505] overflow-hidden">
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
                              DIGITALIZA <br />
                              <span className="text-primary drop-shadow-[0_0_30px_rgba(44,252,125,0.3)]">TU PREDIO.</span>
                           </h2>
                           <p className="text-lg md:text-2xl font-bold text-zinc-400 uppercase tracking-widest max-w-3xl mx-auto leading-relaxed">
                              Accede al panel de control que empodera a las mejores ligas y sedes deportivas. Multiplica tu ocupación y protege tus cobros en automático.
                           </p>
                           <div className="pt-10 flex flex-col items-center justify-center">
                              <Link href="/canchas/register" className="inline-block relative group">
                                 <div className="absolute -inset-2 bg-primary/40 blur-xl rounded-full group-hover:scale-110 group-hover:bg-primary/60 transition-all duration-500" />
                                 <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 sm:px-16 h-16 sm:h-24 bg-primary text-black font-black uppercase text-[11px] sm:text-base lg:text-xl tracking-[0.3em] rounded-full hover:bg-white transition-all duration-500 flex items-center gap-6 relative z-10 shadow-[0_0_50px_rgba(44,252,125,0.6)]"
                                 >
                                    <span>SUMAR MI COMPLEJO</span>
                                    <CheckCircle2 className="w-8 h-8" />
                                 </motion.button>
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
