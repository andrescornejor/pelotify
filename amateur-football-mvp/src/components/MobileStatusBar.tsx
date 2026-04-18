'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';

/**
 * MobileStatusBar manages the browser's theme-color meta tag
 * to provide a seamless status bar experience on mobile devices.
 */
export function MobileStatusBar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    // Get the base background color from CSS variables
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim();

    // Specific colors for certain pages if needed
    let statusBarColor = bgColor || (theme === 'dark' ? '#020205' : '#f8fafc');

    // For the highlights page (vids), we might want a pure black status bar
    if (pathname === '/highlights') {
      statusBarColor = '#000000';
    }

    // Update or create meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', statusBarColor);
    
    // Also update Apple Specific meta tags
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMeta) {
      appleMeta = document.createElement('meta');
      appleMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(appleMeta);
    }
    appleMeta.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');

  }, [theme, pathname]);

  return null;
}
