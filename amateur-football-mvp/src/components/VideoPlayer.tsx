import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, User2, Play, Pause, Trash2, AlertTriangle } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { deleteHighlight } from '@/lib/highlights';

interface VideoPlayerProps {
  id: string;
  url: string;
  userId: string; // The owner of the highlight
  thumbnail?: string;
  description?: string;
  userName?: string;
  userAvatar?: string;
  likes?: number;
  comments?: number;
  isActive: boolean;
  onDelete?: () => void;
}

export default function VideoPlayer({
  id,
  url,
  userId,
  thumbnail,
  description,
  userName,
  userAvatar,
  likes = 0,
  comments = 0,
  isActive,
  onDelete
}: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.7,
  });

  const setRefs = (node: HTMLDivElement) => {
    inViewRef(node);
  };

  useEffect(() => {
    if (inView && isActive) {
      videoRef.current?.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [inView, isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta jugada?')) return;
    
    setIsDeleting(true);
    try {
      await deleteHighlight(id, url);
      onDelete?.();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error al eliminar la jugada.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user?.id === userId;

  return (
    <div 
      ref={setRefs}
      className="relative w-full h-[100dvh] bg-black snap-start overflow-hidden flex items-center justify-center overscroll-none"
      onClick={togglePlay}
    >
      {/* 9:16 Aspect Ratio Wrapper for Desktop */}
      <div className="relative h-full aspect-[9/16] bg-zinc-950 shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={url}
          poster={thumbnail}
          loop
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
          preload="metadata"
          onError={(e) => console.error('Video error:', e)}
          onLoadedData={() => console.log('Video loaded:', url)}
        />

        {/* Visual Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

        {/* Play/Pause Icon */}
        <AnimatePresence>
          {showPlayIcon && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute z-20 pointer-events-none"
            >
              {isPlaying ? (
                <Play className="w-16 h-16 text-white/50 fill-white/50" />
              ) : (
                <Pause className="w-16 h-16 text-white/50 fill-white/50" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Action Bar */}
        <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center z-10">
          <div className="flex flex-col items-center group/action">
            <motion.div 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="p-3.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-lg cursor-pointer group-hover/action:bg-rose-500/20 group-hover/action:border-rose-500/40 transition-all duration-300"
            >
              <Heart className="w-6 h-6 text-white group-hover/action:text-rose-500 group-hover/action:fill-rose-500 transition-colors" />
            </motion.div>
            <span className="text-white text-[10px] mt-1.5 font-black uppercase tracking-widest font-outfit opacity-80">{likes}</span>
          </div>

          <div className="flex flex-col items-center group/action">
            <motion.div 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="p-3.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-lg cursor-pointer group-hover/action:bg-primary/20 group-hover/action:border-primary/40 transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6 text-white group-hover/action:text-primary transition-colors" />
            </motion.div>
            <span className="text-white text-[10px] mt-1.5 font-black uppercase tracking-widest font-outfit opacity-80">{comments}</span>
          </div>

          <motion.div 
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-3.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-lg cursor-pointer hover:bg-white/20 transition-all duration-300"
          >
            <Share2 className="w-6 h-6 text-white" />
          </motion.div>

          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-3.5 bg-rose-500/10 backdrop-blur-xl rounded-full border border-rose-500/20 shadow-lg cursor-pointer hover:bg-rose-500 text-rose-500 hover:text-white transition-all duration-300 group/delete"
            >
              <Trash2 className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Bottom Info Section */}
        <div className="absolute left-6 bottom-10 right-20 z-10 space-y-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative group/avatar">
              <div className="absolute -inset-1 bg-emerald-500/50 rounded-full blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              <div className="relative w-11 h-11 rounded-full border-2 border-emerald-500 overflow-hidden bg-emerald-100 flex items-center justify-center shadow-lg">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <User2 className="w-6 h-6 text-emerald-600" />
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg italic tracking-tight font-kanit drop-shadow-lg leading-tight">
                @{userName || 'crack_anonimo'}
              </span>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                VERIFICADO
              </div>
            </div>
          </motion.div>
          
          <p className="text-white/90 text-sm font-medium leading-relaxed max-w-sm drop-shadow-sm font-outfit">
            {description || '🔥 Tremenda jugada de mi equipo! #Pelotify #FutbolAmateur'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/10">
          <motion.div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(44,252,125,0.6)]"
            initial={{ width: "0%" }}
            animate={{ width: isPlaying ? "100%" : "0%" }}
            transition={{ 
              duration: 15,
              ease: "linear",
              repeat: Infinity
            }}
          />
        </div>
      </div>
    </div>
  );
}
