'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Flame, User2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Highlight } from '@/lib/highlights';

export const FuttokHighlightVideo = ({ h }: { h: Highlight }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Load slightly before it comes into view
  });

  return (
    <div ref={ref} className="w-full h-full relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
      {inView && (
        <video 
          src={h.video_url} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
          muted
          playsInline
          autoPlay
          loop
        />
      )}
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 text-[6px] rounded-full font-black text-white italic z-20">LIVE</div>
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-surface border border-white/20 flex items-center justify-center overflow-hidden">
            {h.profiles?.avatar_url ? (
              <img src={h.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <User2 className="w-3 h-3 text-white/40" />
            )}
          </div>
          <span className="text-[7px] font-black text-white truncate">@{h.profiles?.name || 'user'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-2.5 h-2.5 text-orange-400" />
          <span className="text-[8px] font-black text-white">{h.likes_count}</span>
        </div>
      </div>
    </div>
  );
};

export const FuttokHighlightsList = ({ highlights }: { highlights: Highlight[] }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x h-[280px] sm:h-[380px]">
      {highlights.length > 0 ? (
        highlights.map((h) => (
          <Link key={h.id} href={`/highlights?v=${h.id}`} className="shrink-0 w-44 aspect-[9/16] h-full rounded-[2rem] overflow-hidden relative group snap-start border border-white/5 shadow-xl">
            <FuttokHighlightVideo h={h} />
          </Link>
        ))
      ) : (
        // Placeholder skeletons while loading or if empty
        [1, 2, 3].map((i) => (
          <div key={i} className="shrink-0 w-32 sm:w-44 h-full rounded-[2rem] bg-surface border border-white/5 animate-pulse" />
        ))
      )}
      
      <Link href="/highlights" className="shrink-0 w-44 aspect-[9/16] h-full rounded-[2rem] glass-premium border-dashed border-white/20 flex flex-col items-center justify-center gap-3 group hover:border-primary/40 transition-all text-foreground/30 snap-start">
         <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlusCircle className="w-5 h-5 text-emerald-500" />
         </div>
         <span className="text-[8px] font-black uppercase tracking-widest text-center px-4">Subir mi Jugada</span>
      </Link>
    </div>
  );
};
