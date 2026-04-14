import Link from 'next/link';
import { PlusCircle, Play, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Highlight } from '@/lib/highlights';

interface StoryCarouselProps {
  highlights: Highlight[];
}

export function StoryCarousel({ highlights }: StoryCarouselProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-black italic uppercase text-foreground/80 font-kanit">FutTok Moments</h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x px-1">
        {/* Adicionar Historia Button */}
        <Link href="/highlights/new" className="shrink-0 flex flex-col items-center gap-2 group snap-start">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center relative overflow-hidden group-hover:border-primary transition-colors">
             <div className="w-full h-full bg-surface-elevated/50 flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-primary" />
             </div>
          </div>
          <span className="text-[9px] font-bold text-foreground/50 tracking-wider">Tú</span>
        </Link>

        {/* Historias / FutToks */}
        {highlights.map((h) => (
          <Link key={h.id} href={`/highlights?v=${h.id}`} className="shrink-0 flex flex-col items-center gap-2 group snap-start">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary via-emerald-500 to-primary-dark">
              <div className="w-full h-full rounded-full border-2 border-background overflow-hidden relative">
                {h.profiles?.avatar_url ? (
                  <img src={h.profiles.avatar_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                    <User2 className="w-6 h-6 text-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white/80" fill="currentColor" />
                </div>
              </div>
            </div>
            <span className="text-[9px] font-bold text-foreground/80 tracking-wider max-w-[64px] truncate">
              {h.profiles?.name?.split(' ')[0] || 'User'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
