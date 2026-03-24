'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import VideoUploadModal from './VideoUploadModal';
import { getHighlights, Highlight } from '@/lib/highlights';
import { Loader2, ArrowLeft, Plus, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function VideoFeed() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchHighlights = async () => {
    setLoading(true);
    const data = await getHighlights();
    setHighlights(data);
    if (data.length > 0) setActiveId(data[0].id);
    setLoading(false);
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  if (loading && highlights.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative text-center">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin mx-auto mb-6" />
            <p className="text-white font-black italic uppercase tracking-[0.3em] font-kanit">Sincronizando FutTok</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] bg-black overflow-hidden">
      <AnimatePresence>
        {isUploadOpen && (
          <VideoUploadModal 
            onClose={() => setIsUploadOpen(false)} 
            onSuccess={() => {
              setIsUploadOpen(false);
              fetchHighlights();
            }}
          />
        )}
      </AnimatePresence>

      {/* Global Navigation Controls */}
      <div className="fixed top-6 left-6 z-[100] flex items-center gap-4">
        <Link href="/" className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-black/60 transition-all shadow-xl">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="fixed top-6 right-6 z-[100]">
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="p-3 bg-emerald-500 rounded-2xl text-background shadow-[0_10px_30px_rgba(44,252,125,0.4)] hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Vertical Feed with Snap Scroll */}
      <div className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-none">
        {highlights.length === 0 ? (
          <div className="h-full flex items-center justify-center px-8 text-center bg-zinc-950">
            <div className="relative space-y-8">
              <div className="absolute inset-x-0 top-0 h-64 bg-emerald-500/10 blur-[100px] -z-10 rounded-full" />
              
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-zinc-900 rounded-[2.5rem] border border-white/5 flex items-center justify-center shadow-2xl">
                  <Play className="w-12 h-12 text-emerald-500 fill-emerald-500/20" />
                </div>
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 p-3 bg-emerald-500 rounded-2xl shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-background" />
                </motion.div>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter font-kanit">Sin Clips en FutTok</h2>
                <p className="text-white/40 font-medium max-w-xs mx-auto text-sm font-outfit leading-relaxed">
                  Sé el primero en subir un clip de 15 segundos y conviértete en la leyenda de FutTok.
                </p>
              </div>

              <button 
                onClick={() => setIsUploadOpen(true)}
                className="px-10 h-14 bg-white text-background font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-emerald-500 transition-all shadow-xl hover:shadow-emerald-500/20"
              >
                SUBIR MI PRIMER CLIP
              </button>
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
                userId={h.user_id}
                thumbnail={h.thumbnail_url}
                description={h.description}
                userName={h.profiles?.name}
                userAvatar={h.profiles?.avatar_url}
                likes={h.likes_count}
                comments={h.comments_count}
                isActive={activeId === h.id}
                onDelete={fetchHighlights}
              />
            </section>
          ))
        )}
      </div>
    </div>
  );
}
