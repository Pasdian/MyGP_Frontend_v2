'use client';

import { createContext, useContext } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type RefContextType = {
  NUM_REFE: string | null;
  ADU_DESP: string | null;
  PAT_AGEN: string | null;
};

const RefContext = createContext<RefContextType | undefined>(undefined);

export function NumRefeParamsProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ NUM_REFE: string }>();
  const searchParams = useSearchParams();

  const NUM_REFE = params?.NUM_REFE ?? null;
  const ADU_DESP = searchParams.get('ADU_DESP');
  const PAT_AGEN = searchParams.get('PAT_AGEN');

  return (
    <RefContext.Provider value={{ NUM_REFE, ADU_DESP, PAT_AGEN }}>{children}</RefContext.Provider>
  );
}

export function useNumRefeParams() {
  const context = useContext(RefContext);
  if (!context) {
    throw new Error('useRefData must be used inside <RefProvider>');
  }
  return context;
}
