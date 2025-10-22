'use client';

import type { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import useSWR from 'swr';
import { formatLocalDate } from '@/lib/utilityFunctions/formatLocalDate';
import React from 'react';

export function useDailyTracking(initialDate?: Date, finalDate?: Date) {
  const from = initialDate ? formatLocalDate(initialDate) : undefined;
  const to = finalDate ? formatLocalDate(finalDate) : undefined;

  const key =
    from && to
      ? `/api/daily-tracking/get-daily-tracking?initialDate=${from}&finalDate=${to}`
      : null;
  const { data, error, isLoading } = useSWR<DailyTracking[]>(key, axiosFetcher);

  // Local state to allow UI updates after edits
  const [dailyTrackingData, setDailyTrackingData] = React.useState<DailyTracking[]>([]);

  // When SWR fetches new data, update local state
  React.useEffect(() => {
    if (data) setDailyTrackingData(data);
  }, [data]);

  return {
    records: dailyTrackingData,
    setRecords: setDailyTrackingData, // exposed for updates
    loading: isLoading,
    error,
  };
}
