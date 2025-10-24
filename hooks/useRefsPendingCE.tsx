import * as React from 'react';
import useSWR from 'swr';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { InterfaceContext } from '@/contexts/InterfaceContext';

export function useRefsPendingCE(initialDate?: Date, finalDate?: Date) {
  const ctx = React.useContext(InterfaceContext);
  if (!ctx) throw new Error('InterfaceContext used outside its Provider');
  const key =
    initialDate && finalDate
      ? `/api/transbel/getRefsPendingCE?initialDate=${
          initialDate.toISOString().split('T')[0]
        }&finalDate=${finalDate.toISOString().split('T')[0]}`
      : '/api/transbel/getRefsPendingCE';

  const { data, error, isLoading } = useSWR<getRefsPendingCE[]>(key, axiosFetcher);

  // Local state to allow UI-level modifications without re-fetching
  const [refsPendingCE, setRefsPendingCE] = React.useState<getRefsPendingCE[]>([]);

  // Sync SWR data to local state when fetched
  React.useEffect(() => {
    if (data) setRefsPendingCE(data);
  }, [data]);

  return {
    refsPendingCE,
    setRefsPendingCE, // Expose setter to update locally
    loading: isLoading,
    error,
  };
}
