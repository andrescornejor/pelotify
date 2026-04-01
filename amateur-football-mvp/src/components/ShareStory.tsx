'use client';

import React, { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { Share2, Loader2, Trophy, Zap, MapPin, Calendar, Star, Goal, Users } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils';
import { FifaCard } from './FifaCard';
import { QRCodeCanvas } from 'qrcode.react';

interface ShareStoryProps {
  type: 'profile' | 'match' | 'join';
  data: any;
  trigger?: React.ReactNode;
  className?: string;
}

export function ShareStory({ type, data, trigger, className }: ShareStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (!containerRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Generate Blob from the hidden container
      const blob = await toBlob(containerRef.current, {
        quality: 0.95,
        cacheBust: true,
        pixelRatio: 1.5,
        skipFonts: true, 
        fontEmbedCSS: '',
      });

      if (!blob) throw new Error('Generation failed');

      const fileName = `pelotify-${type}-${Date.now()}.png`;

      // 2. Prepare file & SHARE via Capacitor (Native Android/iOS)
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        
        const fallbackWebShare = async () => {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                 files: [file],
                 title: type === 'profile' ? `Ficha de ${data.name}` : `Resultado: ${data.location}`,
                 text: 'Mirá mi progreso en Pelotify 🏟️',
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
            // Write to temporary file
            const result = await Filesystem.writeFile({
              path: fileName,
              data: base64data,
              directory: Directory.Cache,
            });

            // Share native file
            await Share.share({
              title: type === 'profile' ? `Ficha de ${data.name}` : `Resultado: ${data.location}`,
              text: 'Mirá mi progreso en Pelotify 🏟️',
              url: result.uri,
            });
          } catch (shareErr) {
            console.error('Native sharing failed, falling back to Web Share:', shareErr);
            await fallbackWebShare();
          }
        } else {
           // Direct web fallback without touching fake filesystem
           await fallbackWebShare();
        }
      };
    } catch (err: any) {
      console.error('Sharing error:', err);
      alert(`Error generando la imagen: ${err.message || 'Error técnico'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${data.match_id ? `/match?id=${data.match_id}` : '/register'}` : 'https://pelotify.app';

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className={cn(
          "flex items-center justify-center gap-2 px-6 h-14 rounded-2xl transition-all active:scale-95",
          "bg-primary text-black font-black uppercase tracking-widest text-[10px]",
          "shadow-xl shadow-primary/20 disabled:opacity-50",
          className
        )}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          trigger || (
            <>
              <Share2 className="w-4 h-4" />
              <span>Compartir Story</span>
            </>
          )
        )}
      </button>

      {/* Robust Rendering target (Absolute instead of fixed inset-0) */}
      <div className="absolute left-0 top-0 pointer-events-none opacity-0 z-[-100] overflow-hidden">
        <div
          ref={containerRef}
          className="w-[1080px] h-[1920px] bg-background relative flex flex-col items-center justify-between p-20 overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(44,252,125,0.15), transparent 70%)',
          }}
        >
          {/* Ambient Background */}
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-primary/10 blur-[200px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[50%] bg-blue-500/5 blur-[200px] rounded-full" />
          
          {/* Grid lines overlay */}
          <div className="absolute inset-0 opacity-[0.05]" 
               style={{ backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)', backgroundSize: '80px 80px' }} 
          />

          {/* Header */}
          <div className="w-full flex justify-between items-center text-white relative z-10 p-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-8xl font-black italic uppercase tracking-tighter leading-none">
                PELOTI<span className="text-primary">FY</span>
              </h1>
              <span className="text-2xl font-black uppercase tracking-[0.5em] text-white/40 italic">
                {type === 'profile' ? 'Identidad Digital' : type === 'join' ? 'Invitación Especial' : 'Reporte de Misión'}
              </span>
            </div>
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-12 h-12 text-primary fill-primary" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full flex flex-col items-center justify-center p-8 relative z-20">
            {type === 'profile' ? (
              <div className="scale-[2.4]">
                <FifaCard player={data} />
              </div>
            ) : type === 'match' ? (
              <div className="w-full flex flex-col items-center gap-16 scale-[1.5]">
                 {/* Match Result Card */}
                 <div className="glass-premium-dark p-12 rounded-[5rem] border border-primary/20 w-[600px] flex flex-col gap-10 text-center shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                    <Trophy className="w-24 h-24 text-primary mx-auto" />
                    <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">{data.location}</h2>
                    
                    <div className="flex justify-center items-center gap-10">
                       <div className="flex flex-col items-center gap-2">
                          <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-5xl font-black italic shadow-2xl">A</div>
                          <span className="text-9xl font-black text-white italic">{data.score_a}</span>
                       </div>
                       <div className="text-5xl font-black text-white/10 italic self-end pb-8">VS</div>
                       <div className="flex flex-col items-center gap-2">
                          <div className="w-24 h-24 rounded-3xl bg-red-600 flex items-center justify-center text-5xl font-black italic shadow-2xl">B</div>
                          <span className="text-9xl font-black text-white italic">{data.score_b}</span>
                       </div>
                    </div>
                 </div>

                 {/* MVP & Stats Mini Cards */}
                 <div className="flex gap-10 w-[650px]">
                    {data.mvp && (
                       <div className="flex-1 glass-premium-dark p-8 rounded-[3rem] border border-primary/30 flex flex-col items-center gap-4">
                          <Star className="w-12 h-12 text-primary fill-primary" />
                          <span className="text-xl font-black text-white/40 uppercase tracking-widest">MVP</span>
                          <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{data.mvp.name}</h4>
                       </div>
                    )}
                    {data.scorers && data.scorers.length > 0 && (
                       <div className="flex-1 glass-premium-dark p-8 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4">
                          <Goal className="w-12 h-12 text-blue-400" />
                          <span className="text-xl font-black text-white/40 uppercase tracking-widest">Top Scorer</span>
                          <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{data.scorers[0].name} ({data.scorers[0].goals})</h4>
                       </div>
                    )}
                 </div>
              </div>
            ) : (
               /* JOIN STORY */
               <div className="w-full flex flex-col items-center gap-16 scale-[1.5]">
                 <div className="glass-premium-dark p-16 rounded-[6rem] border border-primary/30 w-[600px] flex flex-col gap-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                    <Users className="w-24 h-24 text-primary mx-auto animate-pulse" />
                    <div className="space-y-4">
                       <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-[0.9]">TE ESTAMOS <br/> BUSCANDO</h2>
                       <p className="text-xl font-bold text-primary/80 uppercase tracking-[0.3em]">RECLUTAMIENTO ACTIVO</p>
                    </div>
                    
                    <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-4">
                       <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">{data.location}</h3>
                       <div className="flex justify-center gap-8">
                          <div className="flex items-center gap-3">
                             <Calendar className="w-6 h-6 text-primary" />
                             <span className="text-2xl font-black text-white/60">{data.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <Zap className="w-6 h-6 text-primary" />
                             <span className="text-2xl font-black text-white/60">{data.time} HS</span>
                          </div>
                       </div>
                    </div>
                 </div>
               </div>
            )}
          </div>

          {/* Footer Info with QR */}
          <div className="w-full space-y-12 relative z-10 pt-10 px-4">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="flex justify-between items-center bg-white/5 p-12 rounded-[4rem] border border-white/5">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                   <p className="text-3xl font-black text-white uppercase italic tracking-tighter">UNITE A LA ELITE</p>
                   <p className="text-xl font-bold text-white/30 uppercase tracking-[0.3em]">ESCANEÁ PARA VER MÁS</p>
                </div>
                <div className="flex gap-8">
                    <div className="flex flex-col items-center gap-2">
                       <Trophy className="w-12 h-12 text-primary" />
                       <span className="text-xl font-bold text-white uppercase tracking-widest">{type === 'profile' ? `${data.overall || 0} OVR` : 'PELOTIFY'}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <MapPin className="w-12 h-12 text-white/40" />
                       <span className="text-xl font-bold text-white/40 uppercase tracking-widest">{data.city || 'Rosario'}</span>
                    </div>
                </div>
              </div>

              {/* QR CODE DISPLAY */}
              <div className="p-6 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(255,255,255,0.2)]">
                 <QRCodeCanvas 
                    value={shareUrl} 
                    size={240} 
                    level="H" 
                    includeMargin={false}
                    imageSettings={{
                       src: "/icon.png",
                       x: undefined,
                       y: undefined,
                       height: 60,
                       width: 60,
                       excavate: true,
                    }}
                 />
              </div>
            </div>

            <p className="text-center text-3xl font-black uppercase tracking-[0.5em] text-white/20 pt-4 animate-pulse">
               www.pelotify.app
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
