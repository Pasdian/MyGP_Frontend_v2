import { getCargues } from '@/types/transbel/getCargues';
import React from 'react';

export const CarguesContext = React.createContext<{
  cargues: getCargues[] | undefined;
  setCargues: React.Dispatch<React.SetStateAction<getCargues[]>>;
  isLoading: boolean | undefined;
  tabValue: 'paid' | 'pending' | undefined;
  setTabValue: React.Dispatch<React.SetStateAction<'paid' | 'pending'>> | undefined;
}>({
  cargues: undefined,
  setCargues: () => {},
  isLoading: undefined,
  tabValue: undefined,
  setTabValue: undefined,
});
