import React from 'react';

export const CargueContext = React.createContext<{
  tabValue: 'paid' | 'pending' | undefined;
  setTabValue: React.Dispatch<React.SetStateAction<'paid' | 'pending'>> | undefined;
}>({ tabValue: undefined, setTabValue: undefined });
