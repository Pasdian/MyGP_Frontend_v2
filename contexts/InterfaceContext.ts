import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import React from 'react';
import { KeyedMutator } from 'swr';

export const InterfaceContext = React.createContext<{
  refsPendingCE: getRefsPendingCE[] | undefined;
  tabValue: 'errors' | 'pending' | 'sent' | undefined;
  setTabValue: React.Dispatch<React.SetStateAction<'errors' | 'pending' | 'sent'>> | undefined;
  mutateRefsPendingCE: KeyedMutator<getRefsPendingCE[]>;
  isRefsLoading: boolean | undefined;
}>({
  refsPendingCE: undefined,
  tabValue: undefined,
  setTabValue: undefined,
  mutateRefsPendingCE: async () => undefined,
  isRefsLoading: undefined,
});
