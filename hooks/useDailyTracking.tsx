'use client';

import type { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import useSWR from 'swr';
import { formatLocalDate } from '@/lib/utilityFunctions/formatLocalDate';

export function useDailyTracking(initialDate?: Date, finalDate?: Date) {
  const from = initialDate ? formatLocalDate(initialDate) : undefined;
  const to = finalDate ? formatLocalDate(finalDate) : undefined;

  // build key only when both dates exist
  const key = from && to ? `/api/daily-tracking?initialDate=${from}&finalDate=${to}` : null;
  const { data, error, isLoading } = useSWR<DailyTracking[]>(key, axiosFetcher);

  return {
    records: data ?? [],
    loading: isLoading,
    error,
  };
}
