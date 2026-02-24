'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { GestorRefInfo } from '@/types/gestor/GestorRefInfo';

type GestorContextType = {
  searchRefData: GestorRefInfo[];
  setSearchRefData: React.Dispatch<React.SetStateAction<GestorRefInfo[]>>;

  refCuenta: any;

  fileCategories: any; // replace with FileCategory[] if you have a type
};

const GestorContext = createContext<GestorContextType | undefined>(undefined);

export function GestorProvider({ children }: { children: React.ReactNode }) {
  const [searchRefData, setSearchRefData] = useState<GestorRefInfo[]>([]);

  const ref = searchRefData?.[0]?.NUM_REFE;

  const { data: refCuenta } = useSWR(
    ref ? `/gestor/refCuenta?ref=${ref}` : null,
    axiosFetcher
  );

  const { data: fileCategories } = useSWR(
    '/gestor/fileCategories',
    axiosFetcher
  );

  const value = useMemo(
    () => ({
      searchRefData,
      setSearchRefData,
      refCuenta,
      fileCategories,
    }),
    [searchRefData, refCuenta, fileCategories]
  );

  return (
    <GestorContext.Provider value={value}>
      {children}
    </GestorContext.Provider>
  );
}

export function useGestor() {
  const context = useContext(GestorContext);

  if (!context) {
    throw new Error('useGestor must be used within a GestorProvider');
  }

  return context;
}