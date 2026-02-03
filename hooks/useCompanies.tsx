'use client';

import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance'; // or your fetcher of choice

type Company = {
  CVE_IMP: string;
  NOM_IMP: string;
};

const DEFAULT_URL = '/api/companies/getAllCompanies';

export function useCompanies(enabled = true) {
  // Only fetch when enabled
  const key = enabled ? DEFAULT_URL : null;

  const { data, error, isLoading } = useSWR<Company[]>(key, axiosFetcher);

  return {
    rows: data ?? [],
    loading: isLoading,
    error,
  };
}
