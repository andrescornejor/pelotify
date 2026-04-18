'use client';

import { useCallback } from 'react';
import { Share } from '@capacitor/share';
import { useHaptic } from './useHaptic';

/**
 * A hook to trigger native sharing on mobile devices.
 * Uses Capacitor Share if available, otherwise falls back to Web Share API.
 */
export function useMobileShare() {
  const { hapticLight } = useHaptic();

  const shareContent = useCallback(async (options: {
    title: string;
    text: string;
    url?: string;
    dialogTitle?: string;
  }) => {
    hapticLight();
    
    try {
      // Try Capacitor first if we are in a native app
      if (typeof window !== 'undefined' && 'Capacitor' in window) {
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle || 'Compartir',
        });
        return true;
      }
      
      // Fallback to Web Share API
      if (navigator.share) {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      }
      
      // Final fallback - copy to clipboard
      if (options.url) {
        await navigator.clipboard.writeText(options.url);
        // You could trigger a toast here
        return false;
      }
      
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing content:', error);
      }
    }
    
    return false;
  }, [hapticLight]);

  return { shareContent };
}
