import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, User2, Play, Pause, Trash2, ChevronLeft, Check, Volume2, VolumeX } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { deleteHighlight, toggleLike, checkIfLiked } from '@/lib/highlights';
import Link from 'next/link';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';

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
  onInView?: (id: string) => void;
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
  onDelete,
  onInView
}: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [doubleTapPosition, setDoubleTapPosition] = useState({ x: 0, y: 0 });
  
  // Engagement States
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [localComments, setLocalComments] = useState(comments);
  const [showCopied, setShowCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { ref: inViewRef, inView } = useInView({ threshold: 0.5 });

  const setRefs = (node: HTMLDivElement) => { inViewRef(node); };

  useEffect(() => {
    if (inView && isActive) {
      videoRef.current?.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else if (!inView && isActive) {
      // If active id is this but not in view, we shouldn't play
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [inView, isActive]);

  useEffect(() => {
    if (inView) {
      onInView?.(id);
    }
  }, [inView, id, onInView]);

  useEffect(() => {
    if (user && id) {
      checkIfLiked(id, user.id).then(setIsLiked);
    }
  }, [id, user]);

  const togglePlay = (e?: React.MouseEvent) => {
    // If standard click, just toggle play
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  let lastTap = 0;
  const handleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // It's a double tap
      handleDoubleTap(e);
    } else {
      // It's a single tap (will wait a bit before toggling perhaps, but directly toggling play is fine)
      togglePlay(e);
    }
    lastTap = now;
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    // Calculate position for the heart animation relative to the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDoubleTapPosition({ x, y });
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 1000); // hide after animation
    
    // Auto-like if not liked
    if (!isLiked && user) {
      const newLiked = true;
      setIsLiked(newLiked);
      setLocalLikes(prev => prev + 1);
      toggleLike(id, user.id, newLiked).catch(err => {
        console.error('Like error:', err);
        setIsLiked(false);
        setLocalLikes(prev => prev - 1);
      });
    }
    
    // Important: if we double tapped, it also fired a single tap before.
    // TikTok keeps playing on double tap, so let's make sure it's playing
    if (!isPlaying && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
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
  
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const isOwner = user?.id === userId;

  return (
    <div 
      ref={setRefs}
      className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center"
    >
      {/* Background Blur (Desktop Aesthetics) */}
      <div className="absolute inset-0 hidden sm:block pointer-events-none">
        <video src={url} className="w-full h-full object-cover blur-3xl opacity-20" muted loop playsInline autoPlay />
      </div>

      {/* 9:16 Aspect Ratio Wrapper */}
      <div className="relative h-full aspect-[9/16] bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden z-10 border-x border-white/5">
        
        {/* Click Area for Play/Pause and Double Tap */}
        <div className="absolute inset-0 z-10" onClick={handleTap} />

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
          onTimeUpdate={handleTimeUpdate}
          onError={(e) => console.error('Video error:', e)}
        />

        {/* Visual Overlays */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        {/* Persistent Play Icon or Temporary Pause/Play */}
        <AnimatePresence>
          {(!isPlaying || showPlayIcon) && !showDoubleTapHeart && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: isPlaying ? 1.5 : 1, opacity: isPlaying ? 0 : 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute z-30 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl"
            >
              <Play className="w-20 h-20 text-white/50 fill-white/50" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Double Tap Heart Animation */}
        <AnimatePresence>
          {showDoubleTapHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -15 }}
              animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="absolute z-40 pointer-events-none"
              style={{ left: doubleTapPosition.x - 50, top: doubleTapPosition.y - 50 }}
            >
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]" />
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
              className={`p-3.5 md: rounded-full border transition-all duration-300 cursor-pointer ${
                isLiked 
                  ? 'bg-rose-500 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                  : 'bg-white/10 border-white/20 group-hover/action:border-rose-500/50 shadow-lg'
              }`}
            >
              <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'text-white fill-white' : 'text-white group-hover/action:text-rose-500'}`} />
            </motion.div>
            <span className="text-white text-[10px] mt-1.5 font-black tracking-widest font-kanit shadow-sm">{localLikes}</span>
          </div>

          <div className="flex flex-col items-center group/action">
            <motion.div 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
              className="p-3.5 bg-white/10 md: rounded-full border border-white/20 shadow-lg cursor-pointer group-hover/action:bg-primary/20 group-hover/action:border-primary/40 transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6 text-white group-hover/action:text-primary transition-colors" />
            </motion.div>
            <span className="text-white text-[10px] mt-1.5 font-black tracking-widest font-kanit shadow-sm">{localComments}</span>
          </div>

          <motion.div 
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className={`p-3.5 md: rounded-full border shadow-lg cursor-pointer transition-all duration-300 ${
              showCopied ? 'bg-emerald-500 border-emerald-400' : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}
          >
            {showCopied ? (
              <Check className="w-6 h-6 text-white" />
            ) : (
              <Share2 className="w-6 h-6 text-white" />
            )}
            
            <AnimatePresence>
              {showCopied && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black py-1 px-3 rounded-full shadow-xl whitespace-nowrap"
                >
                  ¡COPIADO!
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-3.5 bg-rose-500/10 md: rounded-full border border-rose-500/20 shadow-lg cursor-pointer hover:bg-rose-500 text-rose-500 hover:text-white transition-all duration-300 group/delete"
            >
              <Trash2 className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Bottom Info Section */}
        <div className="absolute left-6 bottom-12 right-20 z-30 space-y-4">
          <Link href={`/profile?id=${userId}`} className="inline-block block">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative group/avatar">
                <div className="absolute -inset-1 bg-emerald-500/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 rounded-full border-2 border-emerald-500 overflow-hidden bg-emerald-100 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <User2 className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl italic tracking-tight font-kanit drop-shadow-2xl leading-none group-hover:text-emerald-400 transition-colors">
                  @{userName || 'crack_anonimo'}
                </span>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1 shadow-sm">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  DESTACADO
                </div>
              </div>
            </motion.div>
          </Link>
          
          <p className="text-white/90 text-sm font-medium leading-relaxed max-w-[280px] drop-shadow-lg font-kanit line-clamp-2">
            {description || '🔥 Mirá esta tremenda jugada en Pelotify! #FutbolAmateur'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/[0.08] z-40 overflow-hidden">
          <motion.div 
            className="h-full rounded-full relative"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #10b981, #5dfd9d)',
              boxShadow: '0 0 12px rgba(16,185,129,0.6)',
            }}
            transition={{ duration: 0.1, ease: 'linear' }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </motion.div>
        </div>

        {/* Volume Toggle */}
        <motion.div 
          onClick={toggleMute}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-6 bottom-36 z-30 p-2.5 bg-black/20 md: rounded-full border border-white/10 shadow-lg cursor-pointer hover:bg-black/40 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white/80" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          )}
        </motion.div>
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

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/highlights?v=${id}`}
        title={`FutTok de @${userName || 'crack_anonimo'} en Pelotify`}
        text={description || '🔥 ¡Mirá esta tremenda jugada en Pelotify! #FutbolAmateur'}
        type="futtok"
        authorName={`@${userName || 'crack_anonimo'}`}
        authorAvatar={userAvatar}
        contentPreview={description}
        imagePreview={thumbnail}
      />
    </div>
  );
}
