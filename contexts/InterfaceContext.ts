import React from 'react';

export const InterfaceContext = React.createContext<{
  initialDate: Date | undefined;
  finalDate: Date | undefined;
  tabValue: 'errors' | 'pending' | 'sent' | undefined;
  setTabValue: React.Dispatch<React.SetStateAction<'errors' | 'pending' | 'sent'>> | undefined;
}>({ initialDate: undefined, finalDate: undefined, tabValue: undefined, setTabValue: undefined });
