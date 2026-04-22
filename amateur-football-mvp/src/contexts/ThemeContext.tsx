'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'dark';
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const root = window.document.documentElement;
    const applyTheme = () => {
      const nextResolvedTheme: ResolvedTheme =
        theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;

      const updateDOM = () => {
        root.classList.remove('light', 'dark');
        root.classList.add(nextResolvedTheme);
        root.dataset.theme = nextResolvedTheme;
        root.style.colorScheme = nextResolvedTheme;
        setResolvedTheme(nextResolvedTheme);
      };

      // Utilizar View Transitions API para un cambio instantáneo y ultra fluido
      if (document.startViewTransition) {
        document.startViewTransition(updateDOM);
      } else {
        root.classList.add('theme-transition');
        updateDOM();
        setTimeout(() => root.classList.remove('theme-transition'), 300);
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme !== 'system') return;

    const handleSystemThemeChange = () => applyTheme();
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Hydration mismatch is prevented by defaulting to 'dark' which matches the HTML class
  // We MUST render the provider during SSR so children don't crash when calling useTheme

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
