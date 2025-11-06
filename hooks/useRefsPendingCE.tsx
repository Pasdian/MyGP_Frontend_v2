'use client';

import * as React from 'react';
import useSWR from 'swr';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { InterfaceContext } from '@/contexts/InterfaceContext';
import { formatLocalDate } from '@/lib/utilityFunctions/formatLocalDate';
import { getLastMonthRange } from '@/lib/utilityFunctions/getLastMonthRange';

export function useRefsPendingCE(initialDate?: Date, finalDate?: Date) {
  const ctx = React.useContext(InterfaceContext);
  if (!ctx) throw new Error('InterfaceContext used outside its Provider');

  // 🗓 Default range → last month start → current month end
  const today = new Date();
  const { start: lastMonthStart } = getLastMonthRange();
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const startDate = initialDate ?? lastMonthStart;
  const endDate = finalDate ?? currentMonthEnd;

  // Build query params safely
  const params = new URLSearchParams();

  // Always include base range (fallback handled above)
  params.set('initialDate', formatLocalDate(startDate) ?? '');
  params.set('finalDate', formatLocalDate(endDate) ?? '');

  // Create SWR key
  const key = `/api/transbel/getRefsPendingCE?${params.toString()}`;

  // Fetch with SWR
  const { data, error, isLoading } = useSWR<getRefsPendingCE[]>(key, axiosFetcher);

  // Local editable state
  const [refsPendingCE, setRefsPendingCE] = React.useState<getRefsPendingCE[]>([]);

  React.useEffect(() => {
    if (data) setRefsPendingCE(data);
  }, [data]);

  return {
    refsPendingCE,
    setRefsPendingCE,
    loading: isLoading,
    error,
  };
}
