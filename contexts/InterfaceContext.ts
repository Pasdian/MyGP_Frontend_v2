import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import React from 'react';

export const InterfaceContext = React.createContext<{
  refsPendingCE: getRefsPendingCE[] | undefined;
  tabValue: 'errors' | 'pending' | 'sent' | undefined;
  setTabValue: React.Dispatch<React.SetStateAction<'errors' | 'pending' | 'sent'>> | undefined;
  setRefsPendingCE: React.Dispatch<React.SetStateAction<getRefsPendingCE[]>>;
  isRefsLoading: boolean | undefined;
}>({
  refsPendingCE: undefined,
  tabValue: undefined,
  setTabValue: undefined,
  setRefsPendingCE: () => {},
  isRefsLoading: undefined,
});
