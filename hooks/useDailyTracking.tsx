'use client';

import type { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import useSWR from 'swr';
import { formatLocalDate } from '@/lib/utilityFunctions/formatLocalDate';
import React from 'react';
import { DateRange } from 'react-day-picker';
import { dailyTrackingReducer, type DailyTrackingState } from '@/app/reducers/dailyTrackingReducer';

type UseDailyTrackingParams = {
  fechaEntradaRange?: DateRange;
  MSARange?: DateRange;
};

export function useDailyTracking(params?: UseDailyTrackingParams) {
  const { fechaEntradaRange, MSARange } = params ?? {};

  const today = new Date();
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const initialFecEntrada = fechaEntradaRange?.from ?? lastMonthStart;
  const finalFecEntrada = fechaEntradaRange?.to ?? currentMonthEnd;

  const queryParams = new URLSearchParams();

  queryParams.set('initialFecEntrada', formatLocalDate(initialFecEntrada) ?? '');
  queryParams.set('finalFecEntrada', formatLocalDate(finalFecEntrada) ?? '');

  if (MSARange?.from) {
    queryParams.set('initialMSA', formatLocalDate(MSARange.from) ?? '');
  }
  if (MSARange?.to) {
    queryParams.set('finalMSA', formatLocalDate(MSARange.to) ?? '');
  }

  const key = `/api/daily-tracking/get-daily-tracking?${queryParams.toString()}`;

  const { data, error, isLoading } = useSWR<DailyTracking[]>(key, axiosFetcher);

  const [records, dispatchRecords] = React.useReducer(
    dailyTrackingReducer,
    [] as DailyTrackingState
  );

  React.useEffect(() => {
    if (data) {
      dispatchRecords({ type: 'setAll', payload: data });
    }
  }, [data]);

  const setRecords = React.useCallback(
    (updater: React.SetStateAction<DailyTracking[]>) => {
      const next =
        typeof updater === 'function'
          ? (updater as (prev: DailyTracking[]) => DailyTracking[])(records)
          : updater;

      dispatchRecords({ type: 'setAll', payload: next });
    },
    [records]
  );

  return {
    records,
    setRecords,
    dispatchRecords,
    loading: isLoading,
    error,
  };
}
