import { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import React from 'react';
import { DateRange } from 'react-day-picker';
import { boolean } from 'zod/v4';

type DailyTrackingContextType = {
  dates: {
    fechaEntradaRange: DateRange | undefined;
    MSARange: DateRange | undefined;
  };
  dailyTrackingData: DailyTracking[];
  isLoading: boolean;
  setDailyTrackingData: React.Dispatch<React.SetStateAction<DailyTracking[]>>;
};

export const DailyTrackingContext = React.createContext<DailyTrackingContextType>({
  dates: {
    fechaEntradaRange: undefined,
    MSARange: undefined,
  },
  dailyTrackingData: [],
  isLoading: false,
  setDailyTrackingData: () => {}, // no-op default to prevent undefined errors
});
