import { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import React from 'react';

type DailyTrackingContextType = {
  initialDate?: Date;
  finalDate?: Date;
  dailyTrackingData: DailyTracking[];
  setDailyTrackingData: React.Dispatch<React.SetStateAction<DailyTracking[]>>;
};

export const DailyTrackingContext = React.createContext<DailyTrackingContextType>({
  initialDate: undefined,
  finalDate: undefined,
  dailyTrackingData: [],
  setDailyTrackingData: () => {}, // no-op default to prevent undefined errors
});
