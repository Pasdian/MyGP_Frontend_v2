import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { useEffect } from 'react';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';

export default function useFilesByRef(
  reference: string | null,
  client: string | null,
  opts?: { token?: string }
) {
  const { setFilesByReference } = useDEAStore((state) => state);

  const key =
    reference && client
      ? `/dea/getFilesByReference?reference=${reference}&client=${client}${
          opts?.token ? `&token=${opts.token}` : ''
        }`
      : null;

  const { data, error, isLoading } = useSWR<getFilesByReference>(key, axiosFetcher);
  // Store files in global state when data changes
  useEffect(() => {
    if (data?.files) {
      setFilesByReference(data);
    }
  }, [data, setFilesByReference]);

  return {
    refs: data?.files,
    isLoading,
    error,
  };
}
