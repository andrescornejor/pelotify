'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, Video, Heart, Share2, Info, AlertCircle, Save, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SportsreelPlayerProps {
  url: string;
  className?: string;
}

export function SportsreelPlayer({ url, className }: SportsreelPlayerProps) {
  // Extract ID if possible for a more custom look, but for now we use the full URL
  const videoId = url.split('/video/')[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative group rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl",
        className
      )}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/10 opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
        <Video className="w-32 h-32" />
      </div>

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
        {/* Visual Preview / Icon */}
        <div className="relative shrink-0">
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
               <Play className="w-8 h-8 md:w-10 md:h-10 text-black fill-black ml-1" />
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
             <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
                  Highlights Oficiales
                </span>
             </div>
             <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
               Mirá lo mejor <br/> <span className="text-foreground/40">del encuentro</span>
             </h3>
          </div>

          <p className="text-sm font-medium text-white/40 max-w-md leading-relaxed">
            Reviví tus jugadas virales y compartí tu talento con la comunidad. Cortesía de <span className="text-primary/60 font-black">Sportsreel</span>.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              Ver en Sportsreel <ExternalLink className="w-4 h-4" />
            </a>
            
            <button className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all">
               <Share2 className="w-4 h-4" />
               Compartir
            </button>
          </div>

          {/* Persistence Options (Permanent Storage) */}
          <div className="pt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
               <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Aviso de Temporalidad</p>
                  <p className="text-[11px] text-white/60 font-medium">Los videos en Sportsreel suelen borrarse después de 30 días. Guardalo en Pelotify para que sea eterno.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                     <Youtube className="w-4 h-4 text-red-500" />
                     <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Opción YouTube (Gratis)</span>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium leading-relaxed">Subí el video como "No Listado" y pegá el link acá para guardarlo de por vida sin costo.</p>
               </div>
               <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                     <Save className="w-4 h-4 text-primary" />
                     <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Nube Pelotify (Supabase)</span>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium leading-relaxed">Usaremos tu espacio de 1GB en Supabase para guardar el clip original.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Community Stats Mock (Premium feel) */}
        <div className="hidden lg:flex flex-col gap-4 border-l border-white/5 pl-10">
           <div className="space-y-1">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Interacciones</p>
              <div className="flex items-center gap-2 text-primary">
                 <Heart className="w-4 h-4 fill-primary" />
                 <span className="text-xl font-black italic">124</span>
              </div>
           </div>
           <div className="space-y-1 text-white/20">
              <p className="text-[8px] font-black uppercase tracking-widest">Match ID</p>
              <span className="text-[10px] font-mono">{videoId?.slice(0, 8) || 'SP-9921'}</span>
           </div>
        </div>
      </div>
      
      {/* Footer disclaimer */}
      <div className="bg-white/[0.02] border-t border-white/5 p-4 px-10 flex items-center justify-between">
         <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
            <Info className="w-3 h-3" />
            External video player provided for best quality
         </div>
         <div className="text-[9px] font-black italic text-primary/30 uppercase tracking-tighter">
            Sportsreel x Pelotify
         </div>
      </div>
    </motion.div>
  );
}
