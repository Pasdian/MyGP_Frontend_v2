// hooks/useRefsByClient.ts
import useSWR from 'swr';
import axios from 'axios';

export type RefRecord = {
  NUM_REFE: string;
  ADU_DESP: string;
  FOLDER_HAS_CONTENT: boolean;
};

const axiosFetcher = (url: string) => axios.get(url).then((r) => r.data);

const toYMDLocal = (d?: Date) => (d ? d.toISOString().slice(0, 10) : '');

export function useRefsByClient(client: string | null, initialDate?: Date, finalDate?: Date) {
  const hasParams = !!(client && initialDate && finalDate);

  const params = hasParams
    ? new URLSearchParams({
        client: String(client),
        initialDate: toYMDLocal(initialDate),
        finalDate: toYMDLocal(finalDate),
        api_key: process.env.NEXT_PUBLIC_PYTHON_API_KEY || '',
      }).toString()
    : '';

  // ✅ useSWR is *always called* — same order every render
  const key = hasParams ? `/dea/getRefsByClient?${params}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ refs: RefRecord[] }>(key, axiosFetcher);

  return {
    refs: Array.isArray(data?.refs) ? data!.refs : [],
    isLoading: !!(hasParams && isLoading),
    error,
    refresh: () => mutate(),
  };
}
