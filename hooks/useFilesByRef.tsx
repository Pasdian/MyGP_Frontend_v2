import useSWR from 'swr';
import type { SWRResponse } from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';

type FolderFilesMap = Record<string, string[]>;

interface UseFilesByRefReturn {
  refs: FolderFilesMap;
  isLoading: boolean;
  error: any;
}

export default function useFilesByRef(
  reference: string | null,
  client: string | null,
  opts?: { token?: string }
): UseFilesByRefReturn {
  // build key only when both params exist
  const key =
    reference && client
      ? `/dea/getFilesByReference?reference=${reference}&client=${client}${
          opts?.token ? `&token=${opts.token}` : ''
        }`
      : null;

  // SWR handles caching + revalidation
  const { data, error, isLoading } = useSWR<{ files: FolderFilesMap }>(key, axiosFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10000, // 10s cache window in browser
  });

  return {
    refs: data?.files ?? {},
    isLoading,
    error,
  };
}
