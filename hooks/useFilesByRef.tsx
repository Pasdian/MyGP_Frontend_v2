import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import useSWR from 'swr';

export default function useFilesByRef(reference: string | null, client: string | null) {
  const key =
    reference && client
      ? `/dea/getFilesByReference?reference=${reference}&client=${client}&token=${process.env.NEXT_PUBLIC_PYTHON_API_KEY}`
      : null;

  const { data, error, isLoading } = useSWR<getFilesByReference>(key, axiosFetcher);

  return {
    // return the WHOLE object so it matches FileState.filesByReference type
    refs: data, // <-- not data?.files
    isLoading,
    error,
  };
}
