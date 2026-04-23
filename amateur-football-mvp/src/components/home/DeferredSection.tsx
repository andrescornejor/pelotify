'use client';

import { useEffect, useRef, useState, memo } from 'react';

interface DeferredSectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Root margin to trigger rendering earlier (e.g. '200px') */
  rootMargin?: string;
  className?: string;
}

/**
 * Defers rendering of children until the section scrolls into (or near) the viewport.
 * Uses IntersectionObserver for zero-cost while out of view.
 * Once rendered, stays rendered (no unmount on scroll away).
 */
export const DeferredSection = memo(function DeferredSection({
  children,
  fallback,
  rootMargin = '300px',
  className,
}: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <div className="min-h-[200px]" />)}
    </div>
  );
});
