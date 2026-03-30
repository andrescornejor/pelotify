'use client';

import { useRef, useState, useEffect } from 'react';

interface LazyVideoProps {
  src: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  autoPlay?: boolean;
  /** Threshold for intersection observer (0 to 1) */
  threshold?: number;
  /** Root margin for preloading slightly before visible */
  rootMargin?: string;
}

/**
 * LazyVideo uses IntersectionObserver to defer loading video sources
 * until the element is near-visible in the viewport. This dramatically
 * reduces CPU and bandwidth on page load for feeds with many videos.
 */
export const LazyVideo = ({
  src,
  className = '',
  muted = true,
  loop = false,
  playsInline = true,
  autoPlay = false,
  threshold = 0.1,
  rootMargin = '200px 0px',
}: LazyVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVisible || hasLoaded) return;

    video.src = src;
    video.load();
    setHasLoaded(true);

    if (autoPlay) {
      video.play().catch(() => {
        // Autoplay may be blocked by browser policy; fail silently
      });
    }
  }, [isVisible, src, autoPlay, hasLoaded]);

  return (
    <video
      ref={videoRef}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload="none"
    />
  );
};
