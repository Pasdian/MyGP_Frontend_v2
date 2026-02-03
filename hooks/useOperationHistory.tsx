import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import type { OperationHistory } from '@/types/dashboard/tracking/operationHistory';

export function useOperationHistory(reference?: string) {
  // Build the SWR key only when the dialog is open AND reference exists
  const historyKey = reference
    ? `/api/daily-tracking/operation-history?reference=${reference}`
    : null;

  const { data, error, isLoading } = useSWR<OperationHistory[]>(historyKey, axiosFetcher, {
    revalidateOnFocus: false, // prevent background re-fetches when switching tabs
    revalidateOnReconnect: false,
  });

  return {
    history: data ?? [],
    loading: isLoading,
    error,
    key: historyKey, // expose key in case you need to mutate globally elsewhere
  };
}
