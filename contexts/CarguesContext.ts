'use client';

import React from 'react';
import { getCargues } from '@/types/transbel/getCargues';
import { UpdateFolioInput } from '@/hooks/useCargue/useCargueData';

export type TabValue = 'pending' | 'paid';

export type CarguesContextValue = {
  cargues: getCargues[] | undefined;
  updateFolio: (input: UpdateFolioInput) => Promise<void>;
  isLoading: boolean | undefined;
  tabValue: TabValue;
  setTabValue: React.Dispatch<React.SetStateAction<TabValue>>;
  isTabValue: (v: string) => v is TabValue;
};

export const CarguesContext = React.createContext<CarguesContextValue | null>(null);
