// src/providers/counter-store-provider.tsx
'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand';
import { createDEAStore, DEAStore, initDEAStore } from '../stores/dea-store';

export type DEAStoreAPI = ReturnType<typeof createDEAStore>;

export const DEAStoreContext = createContext<DEAStoreAPI | undefined>(undefined);

export interface DEAStoreProviderProps {
  children: ReactNode;
}

export const DEAStoreProvider = ({ children }: DEAStoreProviderProps) => {
  const storeRef = useRef<DEAStoreAPI | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createDEAStore(initDEAStore());
  }

  return <DEAStoreContext.Provider value={storeRef.current}>{children}</DEAStoreContext.Provider>;
};

export const useDEAStore = <T,>(selector: (store: DEAStore) => T): T => {
  const deaStoreContext = useContext(DEAStoreContext);

  if (!deaStoreContext) {
    throw new Error(`useDEAStore must be used within DEAStoreProvider`);
  }

  return useStore(deaStoreContext, selector);
};
