import { useCallback } from 'react';

/**
 * A hook to trigger safe haptic feedback across the application.
 * It degrades gracefully on devices/browsers that do not support the Vibration API.
 */
export const useHaptic = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    // Check if the window and navigator are defined (for SSR), 
    // and if the vibrate API is supported
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore errors (e.g. user hasn't interacted with document yet)
        console.warn('Haptic vibration failed:', e);
      }
    }
  }, []);

  return {
    /** 
     * Light haptic, used for simple interactions like clicking a standard button,
     * toggling a switch, or marking a notification as read.
     */
    hapticLight: () => vibrate(10),
    /**
     * Medium haptic, used for more significant actions like giving a "like",
     * opening a bottom sheet, or sending a message.
     */
    hapticMedium: () => vibrate(20),
    /**
     * Heavy haptic, used for major confirmations like booking a match,
     * paying, or deleting something.
     */
    hapticHeavy: () => vibrate([30, 50, 30]),
    /**
     * Success haptic, used when a process is completed successfully.
     */
    hapticSuccess: () => vibrate([10, 50, 20]),
    /**
     * Error haptic, used when something goes wrong.
     */
    hapticError: () => vibrate([50, 50, 50]),
    // Raw function if custom patterns are needed
    vibrate,
  };
};
