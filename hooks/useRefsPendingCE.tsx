'use client';

import * as React from 'react';
import useSWR from 'swr';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { InterfaceContext } from '@/contexts/InterfaceContext';

export function useRefsPendingCE() {
  const ctx = React.useContext(InterfaceContext);
  if (!ctx) throw new Error('InterfaceContext used outside its Provider');

  // SWR key without any query params
  const key = '/api/transbel/getRefsPendingCE';

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
