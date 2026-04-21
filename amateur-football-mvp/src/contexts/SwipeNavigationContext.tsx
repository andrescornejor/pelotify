'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

type SwipeDirection = 'left' | 'right' | null;

interface SwipeNavigationContextType {
  /** Direction the user swiped — used by template.tsx to animate entry from the correct side */
  direction: SwipeDirection;
  /** Set by the swipe hook right before navigating */
  setDirection: (d: SwipeDirection) => void;
  /** Clears direction after the entry animation plays */
  clearDirection: () => void;
}

const SwipeNavigationContext = createContext<SwipeNavigationContextType>({
  direction: null,
  setDirection: () => {},
  clearDirection: () => {},
});

export function SwipeNavigationProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirectionState] = useState<SwipeDirection>(null);

  const setDirection = useCallback((d: SwipeDirection) => {
    setDirectionState(d);
  }, []);

  const clearDirection = useCallback(() => {
    setDirectionState(null);
  }, []);

  return (
    <SwipeNavigationContext.Provider value={{ direction, setDirection, clearDirection }}>
      {children}
    </SwipeNavigationContext.Provider>
  );
}

export function useSwipeDirection() {
  return useContext(SwipeNavigationContext);
}
