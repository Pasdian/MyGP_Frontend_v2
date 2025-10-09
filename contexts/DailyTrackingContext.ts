import React from 'react';

export const DailyTrackingContext = React.createContext<{
  dailyTrackingKey: string | undefined;
}>({ dailyTrackingKey: undefined });
