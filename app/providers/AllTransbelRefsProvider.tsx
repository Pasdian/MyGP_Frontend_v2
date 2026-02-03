// app/providers/AllTransbelRefsProvider.tsx
'use client';

import React from 'react';
import useSWR from 'swr';
import { AllTransbelRefsContext } from '@/contexts/AllTransbelRefsContext';

import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { TransbelRef } from '@/types/transbel/TransbelRef';

type State = {
  items: TransbelRef[];
  isLoading: boolean;
  error: string | null;
};

export function AllTransbelRefsProvider({ children }: { children: React.ReactNode }) {
  const {
    data: refsFromApi,
    isLoading: swrLoading,
    error: swrError,
    mutate,
  } = useSWR<TransbelRef[]>('/api/transbel/getAllRefs', axiosFetcher);

  const [state, setState] = React.useState<State>({
    items: [],
    isLoading: true,
    error: null,
  });

  // Sync SWR → local state
  React.useEffect(() => {
    if (Array.isArray(refsFromApi)) {
      setState((prev) => ({
        ...prev,
        items: refsFromApi,
        isLoading: false,
        error: null,
      }));
    }
  }, [refsFromApi]);

  React.useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: swrLoading }));
  }, [swrLoading]);

  React.useEffect(() => {
    setState((prev) => ({
      ...prev,
      error: swrError ? 'Error loading refs' : null,
    }));
  }, [swrError]);

  const refresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  const contextValue = React.useMemo(
    () => ({
      refs: state.items,
      isLoading: state.isLoading,
      error: state.error,
      refresh,
    }),
    [state.items, state.isLoading, state.error, refresh]
  );

  return (
    <AllTransbelRefsContext.Provider value={contextValue}>
      {children}
    </AllTransbelRefsContext.Provider>
  );
}
