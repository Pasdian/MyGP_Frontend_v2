'use client';

import useSWR from 'swr';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';

export function useRefsPendingCE() {
  const key = '/api/transbel/getRefsPendingCE';
  const { data, error, isLoading, mutate } = useSWR<getRefsPendingCE[]>(key, axiosFetcher);

  return {
    refsPendingCE: data ?? [],
    mutateRefsPendingCE: mutate,
    loading: isLoading,
    error,
  };
}
