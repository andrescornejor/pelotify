'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [performanceMode, setPerformanceMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('performance-mode');
    if (saved !== null) {
      const isEnabled = saved === 'true';
      setPerformanceMode(isEnabled);
      if (isEnabled) {
        document.documentElement.classList.add('perf-mode');
      }
    } else {
      // Default to performance mode (Lite Mode) on mobile if no preference is saved
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) {
        updatePerformanceMode(true);
      }
    }
  }, []);

  const updatePerformanceMode = (enabled: boolean) => {
    setPerformanceMode(enabled);
    localStorage.setItem('performance-mode', enabled.toString());

    if (enabled) {
      document.documentElement.classList.add('perf-mode');
    } else {
      document.documentElement.classList.remove('perf-mode');
    }
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
