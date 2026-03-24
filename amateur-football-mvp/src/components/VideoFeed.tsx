'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import { getHighlights, Highlight } from '@/lib/highlights';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VideoFeed() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      const data = await getHighlights();
      setHighlights(data);
      if (data.length > 0) setActiveId(data[0].id);
      setLoading(false);
    };

    fetchHighlights();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-medium">Cargando jugadas top...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] bg-black overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black opacity-50" />

      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 px-4 py-8 flex items-center justify-between">
        <Link href="/" className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex gap-4">
          <span className="text-white font-bold border-b-2 border-emerald-500 pb-1">Para ti</span>
          <span className="text-white/60 font-bold hover:text-white transition-colors cursor-pointer pb-1">Seguidos</span>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Vertical Feed with Snap Scroll */}
      <div className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-none">
        {highlights.length === 0 ? (
          <div className="h-full flex items-center justify-center px-8 text-center">
            <div>
              <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 inline-block mb-6">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 10 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  <span className="text-6xl">⚽</span>
                </motion.div>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Aún no hay jugadas destacadas</h2>
              <p className="text-white/50 max-w-xs mx-auto">
                Sé el primero en subir un clip de 15 segundos y domina el feed nacional.
              </p>
            </div>
          </div>
        ) : (
          highlights.map((h) => (
            <section 
              key={h.id} 
              className="h-full snap-start"
              onMouseEnter={() => setActiveId(h.id)}
            >
              <VideoPlayer
                id={h.id}
                url={h.video_url}
                thumbnail={h.thumbnail_url}
                description={h.description}
                userName={h.profiles?.username}
                userAvatar={h.profiles?.avatar_url}
                likes={h.likes_count}
                isActive={activeId === h.id}
              />
            </section>
          ))
        )}
      </div>
    </div>
  );
}
