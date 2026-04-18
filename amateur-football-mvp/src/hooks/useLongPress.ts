'use client';

import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  threshold?: number;
  onLongPress?: (e: any) => void;
  onClick?: (e: any) => void;
}

/**
 * A hook to handle long-press gestures on mobile.
 */
export function useLongPress({
  threshold = 500,
  onLongPress,
  onClick,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const start = useCallback((e: any) => {
    isLongPressActive.current = false;
    timerRef.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(e);
        isLongPressActive.current = true;
      }
    }, threshold);
  }, [onLongPress, threshold]);

  const stop = useCallback((e: any) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (!isLongPressActive.current && onClick) {
      onClick(e);
    }
  }, [onClick]);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}
