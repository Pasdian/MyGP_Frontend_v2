'use client';
import React, { createContext, useContext, useState } from 'react';

type Ctx = {
  activeWindowId: number | null;
  setActiveWindowId: (id: number | null) => void;
};

const WindowManagerContext = createContext<Ctx | undefined>(undefined);

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);
  return (
    <WindowManagerContext.Provider value={{ activeWindowId, setActiveWindowId }}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within <WindowManagerProvider>');
  return ctx;
}
