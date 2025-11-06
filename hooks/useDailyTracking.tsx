'use client';

import type { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import useSWR from 'swr';
import { formatLocalDate } from '@/lib/utilityFunctions/formatLocalDate';
import React from 'react';
import { DateRange } from 'react-day-picker';

export function useDailyTracking({
  fechaEntradaRange,
  MSARange,
}: {
  fechaEntradaRange: DateRange | undefined;
  MSARange: DateRange | undefined;
}) {
  // 🗓 Define default date range → last month start to current month end
  const today = new Date();
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Apply defaults when no date selected
  const initialFecEntrada = fechaEntradaRange?.from ?? lastMonthStart;
  const finalFecEntrada = fechaEntradaRange?.to ?? currentMonthEnd;

  const params = new URLSearchParams();

  params.set('initialFecEntrada', formatLocalDate(initialFecEntrada) ?? '');
  params.set('finalFecEntrada', formatLocalDate(finalFecEntrada) ?? '');

  if (MSARange?.from) {
    params.set('initialMSA', formatLocalDate(MSARange.from) ?? '');
  }
  if (MSARange?.to) {
    params.set('finalMSA', formatLocalDate(MSARange.to) ?? '');
  }

  const key = `/api/daily-tracking/get-daily-tracking?${params.toString()}`;

  const { data, error, isLoading } = useSWR<DailyTracking[]>(key, axiosFetcher);

  // Local state to allow UI updates after edits
  const [dailyTrackingData, setDailyTrackingData] = React.useState<DailyTracking[]>([]);

  React.useEffect(() => {
    if (data) setDailyTrackingData(data);
  }, [data]);

  return {
    records: dailyTrackingData,
    setRecords: setDailyTrackingData,
    loading: isLoading,
    error,
  };
}
