'use client';

import React, { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { Loader2, Instagram, MapPin, Clock, Calendar } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
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
          
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `¡Se viene un partidazo! ${teamAName} vs ${teamBName}`,
              text: 'Descargá Pelotify y sumate al partido ⚽🔥',
            });
          } else {
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = fileName;
             a.click();
             URL.revokeObjectURL(url);
          }
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
          {/* Background Colors diagonal */}
          <div className="absolute inset-0 bg-blue-600" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 55%)' }} />
          <div className="absolute inset-0 bg-red-600" style={{ clipPath: 'polygon(0 55%, 100% 45%, 100% 100%, 0 100%)' }} />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

          {/* VS Divider clash */}
          <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center">
            <div className="absolute w-[150%] h-8 bg-white shadow-[0_0_80px_rgba(255,255,255,0.8)] -rotate-6" />
            <div className="absolute z-20 bg-black text-white px-16 py-8 border-[6px] border-white transform -rotate-6 skew-x-12">
              <span className="text-9xl font-black italic uppercase tracking-tighter mix-blend-difference">VS</span>
            </div>
          </div>

          {/* Header */}
          <div className="w-full flex justify-between items-center p-16 relative z-30">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-xl">
              PELOTI<span className="text-primary">FY</span>
            </h1>
            <div className="px-10 py-5 bg-black/60 backdrop-blur-md border-4 border-primary text-primary font-black text-4xl uppercase tracking-[0.3em] rounded-3xl">
              {match.type}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-between py-24 relative z-20">
            {/* Team A */}
            <div className="flex flex-col items-center gap-12 w-full px-24 translate-y-[-100px] z-20">
              {teamALogo ? (
                <img src={teamALogo} className="w-[450px] h-[450px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]" alt="" />
              ) : (
                 <div className="w-[450px] h-[450px] rounded-[6rem] bg-blue-500 flex items-center justify-center border-[12px] border-white/20 shadow-2xl">
                   <span className="text-[12rem] font-black italic text-white text-center leading-none">{teamAName.substring(0, 2)}</span>
                 </div>
              )}
              <h2 className="text-[6rem] font-black italic uppercase tracking-tighter text-white text-center leading-[0.8] max-w-[800px] break-words drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                {teamAName}
              </h2>
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center gap-12 w-full px-24 translate-y-[100px] z-20">
              <h2 className="text-[6rem] font-black italic uppercase tracking-tighter text-white text-center leading-[0.8] max-w-[800px] break-words drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                {teamBName}
              </h2>
              {teamBLogo ? (
                <img src={teamBLogo} className="w-[450px] h-[450px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]" alt="" />
              ) : (
                 <div className="w-[450px] h-[450px] rounded-[6rem] bg-red-500 flex items-center justify-center border-[12px] border-white/20 shadow-2xl">
                   <span className="text-[12rem] font-black italic text-white text-center leading-none">{teamBName.substring(0, 2)}</span>
                 </div>
              )}
            </div>
          </div>

          {/* Footer Card */}
          <div className="w-full bg-black/95 backdrop-blur-3xl p-16 pb-24 relative z-30 border-t-8 border-primary flex flex-col items-center">
            <h3 className="text-6xl font-black uppercase text-primary tracking-[0.5em] mb-12 text-center italic drop-shadow-[0_0_20px_rgba(44,252,125,0.4)]">
              MATCH DAY
            </h3>
            
            <div className="flex items-center justify-between w-full px-8 opacity-90">
              <div className="flex flex-col items-center gap-4 text-center">
                <Calendar className="w-20 h-20 text-white" />
                <span className="text-4xl font-black text-white capitalize tracking-wide">{formatDisplayDate(match.date)}</span>
              </div>
              
              <div className="w-2 h-32 bg-white/20 rounded-full" />
              
              <div className="flex flex-col items-center gap-4 text-center">
                <Clock className="w-20 h-20 text-white" />
                <span className="text-4xl font-black text-white tracking-wide">{match.time} HS</span>
              </div>

              <div className="w-2 h-32 bg-white/20 rounded-full" />

              <div className="flex flex-col items-center gap-4 text-center max-w-[300px]">
                <MapPin className="w-20 h-20 text-white" />
                <span className="text-4xl font-black text-white leading-tight break-words">{match.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
