'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User2, Image as ImageIcon, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function CreatePostQuickInput() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="glass-premium p-4 md:p-5 rounded-[2rem] border-foreground/10 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/profile/me" className="shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User2 className="w-5 h-5 text-primary/50" />
            )}
          </div>
        </Link>
        
        <Link href="/feed?create=true" className="flex-1">
          <div className="w-full h-11 bg-surface/50 hover:bg-surface border border-foreground/5 rounded-full px-4 flex items-center text-sm font-medium text-foreground/40 transition-colors shadow-inner">
            ¿Qué pasó en la cancha, {user.name?.split(' ')[0] || 'Jugador'}?
          </div>
        </Link>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      <div className="flex items-center justify-around gap-2 px-2">
        <Link href="/create" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-foreground/[0.03] transition-colors flex-1 justify-center group/btn">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/btn:scale-110 transition-transform">
            <span className="text-sm font-black">+</span>
          </div>
          <span className="text-[10px] font-black uppercase text-foreground/60 tracking-wider">Partido</span>
        </Link>
        
        <Link href="/feed?create=true&type=image" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-foreground/[0.03] transition-colors flex-1 justify-center group/btn">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover/btn:scale-110 transition-transform">
            <ImageIcon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase text-foreground/60 tracking-wider">Foto</span>
        </Link>
        
        <Link href="/search" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-foreground/[0.03] transition-colors flex-1 justify-center group/btn">
           <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/btn:scale-110 transition-transform">
            <Search className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase text-foreground/60 tracking-wider">Explorar</span>
        </Link>
      </div>
    </div>
  );
}
