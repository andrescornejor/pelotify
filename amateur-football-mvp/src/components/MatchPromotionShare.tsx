'use client';

import React, { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { Loader2, Instagram, MapPin, Clock, Calendar } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils';
import { Match } from '@/lib/matches';

interface MatchPromotionShareProps {
  match: Match;
  teamALogo?: string | null;
  teamBLogo?: string | null;
  className?: string;
}

export function MatchPromotionShare({ match, teamALogo, teamBLogo, className }: MatchPromotionShareProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const teamAName = match.team_a_name || 'Local';
  const teamBName = match.team_b_name || 'Visitante';

  const formatDisplayDate = (dString: string) => {
    if (!dString) return '';
    const [year, month, day] = dString.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const handleShare = async () => {
    if (!containerRef.current) return;
    setIsGenerating(true);

    try {
      const blob = await toBlob(containerRef.current, {
        quality: 0.95,
        cacheBust: true,
        pixelRatio: 1.5,
      });

      if (!blob) throw new Error('Generation failed');

      const fileName = `pelotify-poster-${Date.now()}.png`;

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const fallbackWebShare = async () => {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                 files: [file],
                 title: `¡Se viene un partidazo! ${teamAName} vs ${teamBName}`,
                 text: 'Descargá Pelotify y sumate al partido ⚽🔥',
              });
            } catch (e) {
              console.log('Web share cancelled or failed', e);
            }
          } else {
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = fileName;
             a.click();
             URL.revokeObjectURL(url);
          }
        };

        if (Capacitor.isNativePlatform()) {
          const base64data = (reader.result as string).split(',')[1];
          try {
            const result = await Filesystem.writeFile({
              path: fileName,
              data: base64data,
              directory: Directory.Cache,
            });

            await Share.share({
              title: `¡Se viene un partidazo! ${teamAName} vs ${teamBName}`,
              text: 'Descargá Pelotify y sumate al partido ⚽🔥',
              url: result.uri,
            });
          } catch (shareErr) {
            console.error('Native sharing failed, falling back to Web:', shareErr);
            await fallbackWebShare();
          }
        } else {
          // On Web, skip fake Capacitor Filesystem write and directly use Web Share API or download
          await fallbackWebShare();
        }
      };
    } catch (err: any) {
      console.error('Sharing error:', err);
      alert(`Error generando poster: ${err.message || 'Error técnico'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className={cn(
          "px-4 py-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-[0_5px_20px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all text-white",
          className
        )}
      >
        {isGenerating ? (
          <Loader2 className="w-3 h-3 text-white animate-spin" />
        ) : (
          <Instagram className="w-3.5 h-3.5 text-white" />
        )}
        <span className="font-black text-[9px] uppercase tracking-[0.2em] italic">
          Hypear
        </span>
      </button>

      {/* Hidden Render Target for Poster (1080x1920) */}
      <div className="absolute left-0 top-0 pointer-events-none opacity-0 z-[-100] overflow-hidden">
        <div
          ref={containerRef}
          className="w-[1080px] h-[1920px] bg-zinc-950 relative flex flex-col justify-between overflow-hidden"
        >
          {/* Background Design */}
          <div className="absolute inset-0 bg-[#050505]" />
          
          {/* Main split background with mesh effect */}
          <div className="absolute inset-0 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[60%] bg-blue-600 skew-y-[-12deg] origin-top-left shadow-[0_30px_100px_rgba(37,99,235,0.4)]" />
             <div className="absolute bottom-0 left-0 w-full h-[55%] bg-rose-600 skew-y-[-12deg] origin-bottom-right shadow-[0_-30px_100px_rgba(225,29,72,0.4)]" />
             
             {/* Gradient Overlays */}
             <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
             <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.2] mix-blend-overlay" />
          </div>

          {/* VS Typography background layer */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none overflow-hidden">
             <span className="text-[120rem] font-black italic text-white leading-none tracking-tighter -rotate-12 translate-x-[-10%]">VS</span>
          </div>

          {/* Header */}
          <div className="w-full flex justify-between items-start p-20 relative z-30">
            <div className="flex flex-col">
              <h1 className="text-8xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-2xl">
                PELOTI<span className="text-primary italic">FY</span>
              </h1>
              <div className="w-full h-2 bg-primary mt-4 shadow-[0_0_20px_rgba(44,252,125,0.5)]" />
            </div>
            
            <div className="flex flex-col items-end gap-3 mt-4">
              <div className="px-10 py-4 bg-white text-black font-black text-4xl uppercase tracking-[0.2em] italic transform skew-x-[-12deg]">
                 {match.type}
              </div>
              <span className="text-2xl font-black text-white/50 uppercase tracking-[0.4em] italic leading-none">OFICIAL</span>
            </div>
          </div>

          {/* Team Clash Section */}
          <div className="flex-1 flex flex-col items-center justify-center py-20 relative z-20">
            
            {/* Team A - High impact layout */}
            <div className="flex flex-col items-center gap-14 w-full px-20 transform -translate-y-16 group">
               <div className="relative">
                  {/* Decorative rings behind logo */}
                  <div className="absolute inset-[-40px] border-[1px] border-white/10 rounded-full animate-pulse" />
                  <div className="absolute inset-[-80px] border-[1px] border-white/5 rounded-full animate-pulse delay-700" />
                  
                  {teamALogo ? (
                    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
                       <div className="absolute inset-[-20px] bg-white/5 blur-3xl rounded-full" />
                       <img src={teamALogo} className="w-[480px] h-[480px] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative z-10" alt="" />
                    </div>
                  ) : (
                     <div className="w-[500px] h-[500px] rounded-[5rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-[14px] border-white shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden transform group-hover:scale-105 transition-transform">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                        <span className="text-[14rem] font-black italic text-white text-center leading-none drop-shadow-2xl">{teamAName.substring(0, 2).toUpperCase()}</span>
                     </div>
                  )}
               </div>
               
               <div className="flex flex-col items-center text-center max-w-[900px]">
                  <h2 className="text-[7rem] font-black italic uppercase tracking-tighter text-white leading-[0.85] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                    {teamAName}
                  </h2>
                  <div className="h-1.5 w-40 bg-white/20 mt-6 rounded-full" />
               </div>
            </div>

            {/* VS CENTER CLASH */}
            <div className="relative z-30 h-0 flex items-center justify-center pointer-events-none">
               <div className="absolute w-[180%] h-32 bg-white shadow-[0_0_120px_rgba(255,255,255,0.4)] -rotate-6 transform skew-x-[-12deg]" />
               <div className="absolute z-40 bg-black text-white px-24 py-12 border-[8px] border-white transform -rotate-6 skew-x-12 shadow-[0_30px_80px_rgba(0,0,0,0.9)] scale-150">
                 <span className="text-[10rem] font-black italic uppercase tracking-tighter">VS</span>
               </div>
            </div>

            {/* Team B - High impact layout */}
            <div className="flex flex-col items-center gap-14 w-full px-20 transform translate-y-16">
               <div className="flex flex-col items-center text-center max-w-[900px]">
                  <div className="h-1.5 w-40 bg-white/20 mb-6 rounded-full" />
                  <h2 className="text-[7rem] font-black italic uppercase tracking-tighter text-white leading-[0.85] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                    {teamBName}
                  </h2>
               </div>

               <div className="relative">
                   {/* Decorative rings behind logo */}
                  <div className="absolute inset-[-40px] border-[1px] border-white/10 rounded-full animate-pulse delay-500" />
                  <div className="absolute inset-[-80px] border-[1px] border-white/5 rounded-full animate-pulse delay-1000" />

                  {teamBLogo ? (
                    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
                       <div className="absolute inset-[-20px] bg-white/5 blur-3xl rounded-full" />
                       <img src={teamBLogo} className="w-[480px] h-[480px] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative z-10" alt="" />
                    </div>
                  ) : (
                     <div className="w-[500px] h-[500px] rounded-[5rem] bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center border-[14px] border-white shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                        <span className="text-[14rem] font-black italic text-white text-center leading-none drop-shadow-2xl">{teamBName.substring(0, 2).toUpperCase()}</span>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* Footer Card - Dynamic Info Section */}
          <div className="w-full bg-black flex flex-col relative z-30">
             {/* Diagonal stripe transition */}
             <div className="absolute top-[-80px] left-0 w-full h-20 bg-black skew-y-[-4deg] origin-bottom-left" />
             
             <div className="p-20 pb-32 flex flex-col items-center relative gap-16">
                 {/* Match Day Title */}
                <div className="flex items-center gap-8 group">
                   <div className="w-12 h-1 bg-primary group-hover:w-32 transition-all duration-700" />
                   <h3 className="text-7xl font-black uppercase text-primary tracking-[0.4em] italic drop-shadow-[0_0_20px_rgba(44,252,125,0.4)]">
                     MATCH DAY
                   </h3>
                   <div className="w-12 h-1 bg-primary group-hover:w-32 transition-all duration-700" />
                </div>
                
                <div className="grid grid-cols-2 gap-x-20 gap-y-16 w-full max-w-[900px]">
                   <div className="flex items-center gap-10">
                      <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                         <Calendar className="w-12 h-12 text-primary" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-2xl font-black text-white/30 uppercase tracking-[0.2em] italic">FECHA</span>
                         <span className="text-5xl font-black text-white uppercase italic truncate">{(match.date)}</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-10">
                      <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                         <Clock className="w-12 h-12 text-primary" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-2xl font-black text-white/30 uppercase tracking-[0.2em] italic">HORARIO</span>
                         <span className="text-5xl font-black text-white italic tracking-widest">{match.time} HS</span>
                      </div>
                   </div>

                   <div className="col-span-full flex items-center gap-10 bg-white/5 p-12 rounded-[3.5rem] border border-white/10">
                      <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center">
                         <MapPin className="w-12 h-12 text-black" />
                      </div>
                      <div className="flex flex-col flex-1">
                         <span className="text-2xl font-black text-white/30 uppercase tracking-[0.2em] italic">ESTADIO / SEDE</span>
                         <span className="text-5xl font-black text-white uppercase italic leading-tight">{match.location}</span>
                      </div>
                   </div>
                </div>

                {/* Pelotify Watermark / Download */}
                <div className="flex flex-col items-center gap-4 mt-8 opacity-40">
                   <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-primary" />
                      <span className="text-2xl font-black text-white uppercase tracking-[1em] italic">PELOTIFY APP</span>
                   </div>
                   <span className="text-xl font-black text-white/50 uppercase tracking-[0.4em] italic">COMPETÍ COMO UN PRO</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
