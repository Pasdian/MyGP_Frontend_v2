// hooks/useRefsByClient.ts
import useSWR from 'swr';
import axios from 'axios';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';

export type RefRecord = {
  NUM_REFE: string;
  ADU_DESP: string;
  FOLDER_HAS_CONTENT: boolean;
};

// Convert date to YYYY-MM-DD in local time
const toYMDLocal = (d: Date) => d.toISOString().slice(0, 10);

export function useRefsByClient(client: string | null, initialDate?: Date, finalDate?: Date) {
  const today = new Date();

  // Calculate last month → current month default range
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Fallbacks (cover last + current month if not provided)
  const startDate = initialDate ?? lastMonthStart;
  const endDate = finalDate ?? currentMonthEnd;

  const hasParams = Boolean(client);

  // Build query parameters safely
  const params = new URLSearchParams();
  params.set('client', client ?? '');
  params.set('initialDate', toYMDLocal(startDate));
  params.set('finalDate', toYMDLocal(endDate));

  if (process.env.NEXT_PUBLIC_PYTHON_API_KEY) {
    params.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY);
  }

  // SWR key — only fetch if client provided
  const key = hasParams ? `/dea/getRefsByClient?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ refs: RefRecord[] }>(key, axiosFetcher);

  return {
    refs: Array.isArray(data?.refs) ? data.refs : [],
    isLoading: Boolean(hasParams && isLoading),
    error,
    refresh: () => mutate(),
  };
}
