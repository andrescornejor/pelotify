'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import VideoUploadModal from './VideoUploadModal';
import { getHighlights, Highlight, getFriendsHighlights } from '@/lib/highlights';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Plus, Play, Sparkles, Flame } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/home/EmptyState';
import { CameraIllustration } from '@/components/home/EmptyStateIllustrations';

export default function VideoFeed() {
  const searchParams = useSearchParams();
  const videoIdParam = searchParams.get('v');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'for-you' | 'friends'>('for-you');
  const { user } = useAuth();
  const feedRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToParam, setHasScrolledToParam] = useState(false);

  const fetchHighlights = async () => {
    setLoading(true);
    let data;
    if (activeTab === 'friends' && user) {
      data = await getFriendsHighlights(user.id);
    } else {
      data = await getHighlights();
    }
    setHighlights(data);
    
    if (data.length > 0) {
      // Deep link support: If 'v' param exists and is in the list, set it as active
      if (videoIdParam && data.find(h => h.id === videoIdParam)) {
        setActiveId(videoIdParam);
      } else {
        setActiveId(data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHighlights();
  }, [activeTab, user]);

  useEffect(() => {
    if (highlights.length > 0 && activeId && !hasScrolledToParam && videoIdParam) {
      const element = document.getElementById(`video-${activeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
        setHasScrolledToParam(true);
      }
    }
  }, [highlights, activeId, hasScrolledToParam, videoIdParam]);

  if (loading && highlights.length === 0) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_50%)] animate-pulse" />
        <div className="relative text-center z-10 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-2 border-r-2 border-emerald-400 rounded-full animate-spin direction-reverse" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-white font-black italic uppercase tracking-[0.3em] font-kanit text-lg drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Sincronizando FutTok</p>
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
      <div className="fixed top-0 left-0 right-0 z-[100] px-6 pt-6 sm:pt-8 pb-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none flex items-center justify-between">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/" className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-black/60 hover:scale-105 active:scale-95 transition-all shadow-xl">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>

        {/* Center Title / Tabs */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto pt-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 fill-emerald-500/20 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <h1 className="text-lg sm:text-xl font-black italic tracking-tighter text-white font-kanit drop-shadow-lg leading-none">
              FUTTOK
            </h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 mt-1.5">
            <button 
              onClick={() => setActiveTab('for-you')}
              className={cn(
                "font-black text-[9px] sm:text-[10px] tracking-[0.3em] uppercase relative shadow-sm transition-colors",
                activeTab === 'for-you' ? "text-white" : "text-white/40 hover:text-white/80"
              )}
            >
              PARA TI
              {activeTab === 'for-you' && (
                <div className="absolute -bottom-2 sm:-bottom-2.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-[2px] sm:h-[2.5px] bg-emerald-500 shadow-[0_0_10px_#10b981] rounded-full" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('friends')}
              className={cn(
                "font-black text-[9px] sm:text-[10px] tracking-[0.3em] uppercase relative shadow-sm transition-colors",
                activeTab === 'friends' ? "text-white" : "text-white/40 hover:text-white/80"
              )}
            >
              AMIGOS
              {activeTab === 'friends' && (
                <div className="absolute -bottom-2 sm:-bottom-2.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-[2px] sm:h-[2.5px] bg-emerald-500 shadow-[0_0_10px_#10b981] rounded-full" />
              )}
            </button>
          </div>
        </div>

        <div className="pointer-events-auto relative group">
          <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="relative p-3 sm:p-3.5 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl text-background shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all border border-emerald-300/30"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Vertical Feed with Snap Scroll */}
      <div 
        ref={feedRef}
        className="h-[100dvh] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col touch-pan-y antialiased overscroll-contain bg-black"
        style={{ scrollBehavior: 'smooth' }}
      >
        {highlights.length === 0 ? (
          <div className="h-full flex items-center justify-center px-6 text-center bg-black relative">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-sm">
              <EmptyState
                illustration={<CameraIllustration />}
                title="El escenario está vacío"
                description={activeTab === 'friends' 
                  ? "Tus amigos aún no han subido highlights. ¡Motívalos a mostrar su talento!"
                  : "Sé el primero en subir esa jugada maradoniana. 15 segundos bastan para ser leyenda."}
                actionText="SUBIR MI PRIMER CLIP"
                actionHref="#"
              />
            </div>
          </div>
        ) : (
          highlights.map((h) => (
            <div 
              id={`video-${h.id}`}
              key={h.id} 
              className="h-[100dvh] w-full flex-shrink-0 snap-start snap-always scroll-mt-0 relative"
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
                onInView={setActiveId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
