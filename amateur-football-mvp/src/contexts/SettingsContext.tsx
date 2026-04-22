'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [performanceMode, setPerformanceMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    const saved = window.localStorage.getItem('performance-mode');
    if (saved !== null) return saved === 'true';

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return isMobile || prefersReducedMotion;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('perf-mode', performanceMode);
    window.localStorage.setItem('performance-mode', performanceMode.toString());
  }, [performanceMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saved = window.localStorage.getItem('performance-mode');
    if (saved !== null) return;

    const handleChange = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      setPerformanceMode(isMobile || mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updatePerformanceMode = (enabled: boolean) => {
    setPerformanceMode(enabled);
  };

  return (
    <SettingsContext.Provider
      value={{ performanceMode, setPerformanceMode: updatePerformanceMode }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
