'use client';

import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';

type RefRecord = {
  NUM_REFE: string;
  ADU_DESP: string;
  FOLDER_HAS_CONTENT: boolean;
};

// Helper: format a Date as local YYYY-MM-DD (avoids UTC shift)
function toYMDLocal(d?: Date) {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useRefsByClient(
  client: string | null,
  initialDate: Date | undefined,
  finalDate: Date | undefined
) {
  // build query parameters safely
  const initialStr = toYMDLocal(initialDate);
  const finalStr = toYMDLocal(finalDate);

  // only build key when all required params exist
  const key =
    client && initialStr && finalStr
      ? `/dea/getRefsByClient?client=${client}&initialDate=${initialStr}&finalDate=${finalStr}`
      : null;

  const { data, error, isLoading } = useSWR<{ refs: RefRecord[] }>(key, axiosFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 15_000, // 15 seconds cache window
  });

  return {
    refs: data?.refs ?? [],
    isLoading,
    error,
  };
}
