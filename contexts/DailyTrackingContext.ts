import React from 'react';

export const DailyTrackingContext = React.createContext<{
  initialDate: Date | undefined;
  finalDate: Date | undefined;
}>({ initialDate: undefined, finalDate: undefined });
