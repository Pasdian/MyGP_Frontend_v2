import { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import React from 'react';
import { boolean } from 'zod/v4';

type DailyTrackingContextType = {
  initialDate?: Date;
  finalDate?: Date;
  dailyTrackingData: DailyTracking[];
  isLoading: boolean;
  setDailyTrackingData: React.Dispatch<React.SetStateAction<DailyTracking[]>>;
};

export const DailyTrackingContext = React.createContext<DailyTrackingContextType>({
  initialDate: undefined,
  finalDate: undefined,
  dailyTrackingData: [],
  isLoading: false,
  setDailyTrackingData: () => {}, // no-op default to prevent undefined errors
});
