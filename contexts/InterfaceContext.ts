import React from 'react';

export const InterfaceContext = React.createContext<{
  initialDate: Date | undefined;
  finalDate: Date | undefined;
}>({ initialDate: undefined, finalDate: undefined });
