'use client';

import React, { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { Share2, Loader2, Trophy, Zap, MapPin, Calendar } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { cn } from '@/lib/utils';
import { FifaCard } from './FifaCard';

interface ShareStoryProps {
  type: 'profile' | 'match';
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
        skipFonts: true, // Rule out font timeouts
        fontEmbedCSS: '',
      });

      if (!blob) throw new Error('Generation failed');

      const fileName = `pelotify-${type}-${Date.now()}.png`;

      // 2. Prepare file & SHARE via Capacitor (Native Android)
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
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
          
          // Fallback to Web Share or Download if Filesystem fails
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: type === 'profile' ? `Ficha de ${data.name}` : `Resultado: ${data.location}`,
              text: 'Mirá mi progreso en Pelotify 🏟️',
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
      alert(`Error generando la imagen: ${err.message || 'Error técnico'}`);
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
          className="w-[1080px] h-[1920px] bg-background relative flex flex-col items-center justify-between p-24 overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(44,252,125,0.15), transparent 70%)',
          }}
        >
          {/* Ambient Background */}
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-primary/10 blur-[200px] rounded-full" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

          {/* Header */}
          <div className="w-full flex justify-between items-center text-white relative z-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-8xl font-black italic uppercase tracking-tighter leading-none">
                PELOTI<span className="text-primary">FY</span>
              </h1>
              <span className="text-2xl font-black uppercase tracking-[0.5em] text-white/40 italic">
                {type === 'profile' ? 'Identidad Digital' : 'Reporte de Misión'}
              </span>
            </div>
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-12 h-12 text-primary fill-primary" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-16 scale-[2.2] relative z-20">
            {type === 'profile' ? (
              <FifaCard player={data} />
            ) : (
              <div className="glass-premium-dark p-12 rounded-[4rem] border border-primary/20 w-[400px] flex flex-col gap-8 text-center">
                 <Trophy className="w-20 h-20 text-primary mx-auto" />
                 <h2 className="text-4xl font-black italic text-white uppercase">{data.location}</h2>
                 <div className="flex justify-center items-baseline gap-4">
                    <span className="text-7xl font-black text-primary">{data.score_a}</span>
                    <span className="text-4xl font-black text-white/20 italic">VS</span>
                    <span className="text-7xl font-black text-primary">{data.score_b}</span>
                 </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="w-full space-y-8 relative z-10">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="flex justify-around items-center">
              <div className="flex flex-col items-center gap-2">
                 <Trophy className="w-10 h-10 text-primary" />
                 <span className="text-xl font-bold text-white uppercase tracking-widest">{type === 'profile' ? `${data.overall} OVR` : 'Victoria'}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                 <MapPin className="w-10 h-10 text-white/40" />
                 <span className="text-xl font-bold text-white/40 uppercase tracking-widest">Digital Field</span>
              </div>
            </div>

            <p className="text-center text-2xl font-black uppercase tracking-[0.4em] text-white/20 pt-8">
              Escanea para unirte a la elite
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
