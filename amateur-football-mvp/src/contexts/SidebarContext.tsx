'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  isNavMenuOpen: boolean;
  setNavMenuOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);
  const setNotificationsOpen = useCallback((open: boolean) => setIsNotificationsOpen(open), []);
  const setNavMenuOpen = useCallback((open: boolean) => setIsNavMenuOpen(open), []);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
        isNotificationsOpen,
        setNotificationsOpen,
        isNavMenuOpen,
        setNavMenuOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
