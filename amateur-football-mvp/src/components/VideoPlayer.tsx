'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, User2, Play, Pause } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface VideoPlayerProps {
  id: string;
  url: string;
  thumbnail?: string;
  description?: string;
  userName?: string;
  userAvatar?: string;
  likes?: number;
  comments?: number;
  isActive: boolean;
}

export default function VideoPlayer({
  url,
  thumbnail,
  description,
  userName,
  userAvatar,
  likes = 0,
  comments = 0,
  isActive
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.7, // Trigger when 70% of the video is visible
  });

  // Dual refs for Intersection Observer and Video DOM
  const setRefs = (node: HTMLDivElement) => {
    inViewRef(node);
  };

  useEffect(() => {
    if (inView && isActive) {
      videoRef.current?.play().catch(() => {
        // Handle auto-play restriction by staying paused or requiring user interaction
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [inView, isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    }
  };

  return (
    <div 
      ref={setRefs}
      className="relative w-full h-[100dvh] bg-black snap-start overflow-hidden flex items-center justify-center"
      onClick={togglePlay}
    >
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
      />

      {/* Visual Overlays (Premium Look) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Play/Pause Large Icon Overlay */}
      <AnimatePresence>
        {showPlayIcon && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute z-20"
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
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-medium">{likes}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-medium">{comments}</span>
        </div>

        <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer">
          <Share2 className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="absolute left-4 bottom-8 right-16 z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden bg-emerald-100 flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <User2 className="w-6 h-6 text-emerald-600" />
            )}
          </div>
          <span className="text-white font-bold text-lg drop-shadow-md">
            @{userName || 'crack_anonimo'}
          </span>
        </div>
        <p className="text-white/90 text-sm line-clamp-2 max-w-sm drop-shadow-sm">
          {description || '🔥 Tremenda jugada! #Pelotify #FutbolAmateur'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/20">
        <motion.div 
          className="h-full bg-emerald-500"
          initial={{ width: "0%" }}
          animate={{ width: isPlaying ? "100%" : "0%" }}
          transition={{ 
            duration: 15, // Max length assumed for progress bar visual
            ease: "linear",
            repeat: Infinity
          }}
        />
      </div>
    </div>
  );
}
