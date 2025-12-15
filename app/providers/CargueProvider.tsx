'use client';

import React from 'react';
import { CarguesContext } from '@/contexts/CarguesContext';
import { useCargueData } from '@/hooks/useCargue/useCargueData';

export default function CargueProvider({ children }: { children: React.ReactNode }) {
  const value = useCargueData();

  return <CarguesContext.Provider value={value}>{children}</CarguesContext.Provider>;
}
