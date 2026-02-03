'use client';

import { useContext } from 'react';
import { AllTransbelRefsContext } from '@/contexts/AllTransbelRefsContext';

export function useAllTransbelRefs() {
  const ctx = useContext(AllTransbelRefsContext);

  if (!ctx) {
    throw new Error('useAllTransbelRefs must be used inside <AllTransbelRefsProvider>');
  }

  return ctx;
}
