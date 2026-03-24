import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, User2, Play, Pause, Trash2, ChevronLeft } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { deleteHighlight, toggleLike, checkIfLiked } from '@/lib/highlights';
import CommentsModal from './CommentsModal';

interface VideoPlayerProps {
  id: string;
  url: string;
  userId: string;
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
  
  // Engagement States
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [localComments, setLocalComments] = useState(comments);

  const { ref: inViewRef, inView } = useInView({ threshold: 0.7 });

  const setRefs = (node: HTMLDivElement) => { inViewRef(node); };

  useEffect(() => {
    if (inView && isActive) {
      videoRef.current?.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [inView, isActive]);

  useEffect(() => {
    if (user && id) {
      checkIfLiked(id, user.id).then(setIsLiked);
    }
  }, [id, user]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLocalLikes(prev => newLiked ? prev + 1 : prev - 1);
    
    try {
      await toggleLike(id, user.id, isLiked);
    } catch (err) {
      console.error('Like error:', err);
      setIsLiked(!newLiked);
      setLocalLikes(prev => !newLiked ? prev + 1 : prev - 1);
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
    >
      {/* Background Blur (Desktop Aesthetics) */}
      <div className="absolute inset-0 hidden sm:block pointer-events-none">
        <video src={url} className="w-full h-full object-cover blur-3xl opacity-20" muted loop playsInline autoPlay />
      </div>

      {/* 9:16 Aspect Ratio Wrapper */}
      <div className="relative h-full aspect-[9/16] bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden z-10 border-x border-white/5">
        
        {/* Top Header Overlay (Para Ti / Clubes) */}
        <div className="absolute top-0 left-0 w-full p-8 z-30 flex justify-center items-center gap-6 pointer-events-none">
           <button className="text-white font-black text-xs tracking-[0.3em] uppercase opacity-100 relative pointer-events-auto shadow-sm">
             PARA TI
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-emerald-500 shadow-[0_0_10px_#10b981]" />
           </button>
           <button className="text-white/40 font-black text-xs tracking-[0.3em] uppercase hover:text-white/60 transition-colors pointer-events-auto">
             CLUBES
           </button>
        </div>

        {/* Click Area for Play/Pause */}
        <div className="absolute inset-0 z-10" onClick={togglePlay} />

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
        />

        {/* Visual Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-20" />

        {/* Play/Pause Icon */}
        <AnimatePresence>
          {showPlayIcon && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute z-30 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Pause className="w-16 h-16 text-white/40 fill-white/40" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Action Bar */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-30">
          <div className="flex flex-col items-center group/action">
            <motion.div 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`p-3.5 backdrop-blur-3xl rounded-full border transition-all duration-300 cursor-pointer ${
                isLiked 
                  ? 'bg-rose-500 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                  : 'bg-white/10 border-white/20 group-hover/action:border-rose-500/50 shadow-lg'
              }`}
            >
              <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'text-white fill-white' : 'text-white group-hover/action:text-rose-500'}`} />
            </motion.div>
            <span className="text-white text-[10px] mt-1.5 font-black tracking-widest font-outfit shadow-sm">{localLikes}</span>
          </div>

          <div className="flex flex-col items-center group/action">
            <motion.div 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
              className="p-3.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 shadow-lg cursor-pointer group-hover/action:bg-primary/20 group-hover/action:border-primary/40 transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6 text-white group-hover/action:text-primary transition-colors" />
            </motion.div>
            <span className="text-white text-[10px] mt-1.5 font-black tracking-widest font-outfit shadow-sm">{localComments}</span>
          </div>

          <motion.div 
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-3.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 shadow-lg cursor-pointer hover:bg-white/20 transition-all duration-300"
          >
            <Share2 className="w-6 h-6 text-white" />
          </motion.div>

          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-3.5 bg-rose-500/10 backdrop-blur-3xl rounded-full border border-rose-500/20 shadow-lg cursor-pointer hover:bg-rose-500 text-rose-500 hover:text-white transition-all duration-300 group/delete"
            >
              <Trash2 className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Bottom Info Section */}
        <div className="absolute left-6 bottom-12 right-20 z-30 space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative group/avatar">
              <div className="absolute -inset-1 bg-emerald-500/50 rounded-full blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              <div className="relative w-12 h-12 rounded-full border-2 border-emerald-500 overflow-hidden bg-emerald-100 flex items-center justify-center shadow-xl">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <User2 className="w-6 h-6 text-emerald-600" />
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl italic tracking-tight font-kanit drop-shadow-2xl leading-none">
                @{userName || 'crack_anonimo'}
              </span>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1 shadow-sm">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                DESTACADO
              </div>
            </div>
          </motion.div>
          
          <p className="text-white/90 text-sm font-medium leading-relaxed max-w-[280px] drop-shadow-lg font-outfit line-clamp-2">
            {description || '🔥 Mirá esta tremenda jugada en Pelotify! #FutbolAmateur'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5 z-40">
          <motion.div 
            className="h-full bg-emerald-400 shadow-[0_0_15px_#10b981]"
            initial={{ width: "0%" }}
            animate={{ width: isPlaying ? "100%" : "0%" }}
            transition={{ duration: 15, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>

      {/* Interactions (Modals) */}
      <AnimatePresence>
        {showComments && (
          <CommentsModal 
            highlightId={id} 
            onClose={() => setShowComments(false)}
            onCommentAdded={() => setLocalComments(prev => prev + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
