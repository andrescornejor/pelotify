'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  monochromeMode: boolean;
  setMonochromeMode: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [performanceMode, setPerformanceMode] = useState<boolean>(false);
  const [monochromeMode, setMonochromeMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Performance Mode
    const savedPerf = localStorage.getItem('performance-mode');
    if (savedPerf !== null) {
      const isEnabled = savedPerf === 'true';
      setPerformanceMode(isEnabled);
      if (isEnabled) {
        document.documentElement.classList.add('perf-mode');
      }
    }

    // Monochrome Mode
    const savedMono = localStorage.getItem('monochrome-mode');
    if (savedMono !== null) {
      const isEnabled = savedMono === 'true';
      setMonochromeMode(isEnabled);
      if (isEnabled) {
        document.documentElement.classList.add('monochrome');
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

  const updateMonochromeMode = (enabled: boolean) => {
    setMonochromeMode(enabled);
    localStorage.setItem('monochrome-mode', enabled.toString());

    if (enabled) {
      document.documentElement.classList.add('monochrome');
    } else {
      document.documentElement.classList.remove('monochrome');
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        performanceMode,
        setPerformanceMode: updatePerformanceMode,
        monochromeMode,
        setMonochromeMode: updateMonochromeMode,
      }}
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
