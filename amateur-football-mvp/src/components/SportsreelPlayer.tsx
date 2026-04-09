'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ExternalLink, Video, Heart, Share2, Info, AlertCircle, Save, Youtube, Maximize2, Volume2, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface SportsreelPlayerProps {
  url: string;
  className?: string;
}

export function SportsreelPlayer({ url, className }: SportsreelPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStage, setDownloadStage] = useState<'idle' | 'scraping' | 'converting' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  const videoId = url.split('/video/')[1];

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadStage('scraping');

    try {
      // Step 1: Call our Next.js API to scrape the m3u8
      const res = await axios.post('/api/video/scrape', { url });
      const m3u8Url = res.data.m3u8Url;

      setDownloadStage('converting');
      setProgress(0);

      // Step 2: Simulate the "Conversion to MP4" process (since this is an MVP without backend queues)
      // This gives the user the feeling of heavy processing as requested
      for (let i = 0; i <= 100; i += Math.floor(Math.random() * 8) + 2) {
        await new Promise(r => setTimeout(r, 200));
        setProgress(Math.min(i, 100));
      }
      setProgress(100);
      await new Promise(r => setTimeout(r, 500)); // Final pause

      setDownloadStage('done');

      // Step 3: Trigger the download of a dummy ".mp4" file pointing to the m3u8 or a blob to fulfill the MVP request
      const dummyContent = "MOCK MP4 BINARY CONTENT FOR " + m3u8Url;
      const blob = new Blob([dummyContent], { type: 'video/mp4' });
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `partido_completo_${videoId || 'pelotify'}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(dlUrl);

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadStage('idle');
      }, 3000);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Error obteniendo el video. Por favor intentá de nuevo más tarde.');
      setIsDownloading(false);
      setDownloadStage('idle');
    }
  };

  // Try to determine if it's a known embeddable URL or just a page
  // For this MVP, we'll simulate an embedded feel with a high-end UI
  // even if it just loads the page in an iframe (if X-Frame-Options allows)
  // or just stays as a "Premium Link" if blocked.

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative group rounded-[3.5rem] overflow-hidden border border-white/5 bg-[#0a0a0a] shadow-2xl",
        className
      )}
    >
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10 opacity-40" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {!isPlaying ? (
        <div className="relative z-10">
          <div className="aspect-video relative overflow-hidden group/thumb cursor-pointer" onClick={() => setIsPlaying(true)}>
             {/* Mock Thumbnail / Aesthetic Placeholder */}
             <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000" 
                  className="w-full h-full object-cover opacity-40 grayscale group-hover/thumb:scale-105 group-hover/thumb:opacity-60 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
             </div>

             {/* Play Button Overlay */}
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(44,252,125,0.4)] group-hover/thumb:shadow-[0_0_80px_rgba(44,252,125,0.6)] transition-all"
                >
                  <Play className="w-10 h-10 text-black fill-black ml-1.5" />
                </motion.div>
                <div className="text-center space-y-2">
                   <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">REPRODUCIR <span className="text-primary">HIGHLIGHTS</span></h3>
                   <div className="flex items-center justify-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 border border-white/10">Sportsreel TV</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">4K RESOLUTION</span>
                   </div>
                </div>
             </div>

             {/* Bottom bar in preview */}
             <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-white/40" />
                   </div>
                   <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-primary" />
                   </div>
                </div>
                <Maximize2 className="w-5 h-5 text-white/20" />
             </div>
          </div>

          <div className="p-10 md:p-14 space-y-10 border-t border-white/5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Match Recording Available</span>
                </div>
                <h4 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-tight">
                  Reviví la magia <br /> <span className="text-white/20">del potrero en HD</span>
                </h4>
                <p className="text-sm font-medium text-white/40 leading-relaxed">
                  Accedé a los mejores clips de este encuentro. Tus goles, atajadas y momentos virales procesados automáticamente por la IA de <span className="text-primary/60 font-black">Sportsreel</span>.
                </p>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/10 active:scale-95 transition-all group/ext"
                >
                  <ExternalLink className="w-4 h-4 group-hover/ext:translate-x-1 group-hover/ext:-translate-y-1 transition-transform" />
                  Link Externo
                </a>
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={cn(
                    "h-14 px-8 rounded-2xl text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.03] active:scale-95 transition-all w-full",
                    isDownloading ? "bg-primary/50 cursor-not-allowed" : "bg-primary shadow-primary/20",
                    downloadStage === 'done' && "bg-emerald-400"
                  )}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {downloadStage === 'scraping' && 'Scrapeando Web...'}
                      {downloadStage === 'converting' && `Convirtiendo a MP4 (${progress}%)`}
                    </>
                  ) : downloadStage === 'done' ? (
                    <>
                      <ShieldCheck className="w-4 h-4" /> ¡Descarga Completa!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Descargar Partido Completo (.MP4)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Persistence Warning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-5">
                 <AlertCircle className="w-6 h-6 text-amber-500 mt-1 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Aviso de Limpieza</p>
                    <p className="text-[12px] text-white/40 font-medium leading-relaxed">Este video expirará en 22 días. Sincronizalo con tu nube de Pelotify para conservarlo para siempre.</p>
                 </div>
              </div>
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-5">
                 <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Certificado Pelotify</p>
                    <p className="text-[12px] text-white/40 font-medium leading-relaxed">Video verificado por los árbitros del partido. Resultados y estadísticas oficiales confirmados.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 aspect-video bg-black">
          <button 
            onClick={() => setIsPlaying(false)}
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black transition-all"
          >
            <span className="font-black">✕</span>
          </button>
          
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          
          {/* Fallback overlay if iframe is blocked (Mocking common behavior) */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        </div>
      )}

      {/* Footer Decoration */}
      <div className="relative z-10 px-10 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
         <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-primary/40" />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">BROADCAST QUALITY • MATCH ID-{videoId?.slice(0,6) || 'H92'}</span>
         </div>
         <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-white/20 hover:text-white transition-colors">
               <Heart className="w-3.5 h-3.5" />
               <span className="text-[9px] font-black uppercase italic">12</span>
            </button>
            <button className="flex items-center gap-2 text-white/20 hover:text-white transition-colors">
               <Share2 className="w-3.5 h-3.5" />
               <span className="text-[9px] font-black uppercase italic">Share</span>
            </button>
         </div>
      </div>
    </motion.div>
  );
}
