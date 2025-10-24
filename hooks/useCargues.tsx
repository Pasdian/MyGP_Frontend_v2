import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import { getCargues } from '@/types/transbel/getCargues';
import { CarguesContext } from '@/contexts/CarguesContext';

export default function useCargues() {
  const ctx = React.useContext(CarguesContext);
  if (!ctx) throw new Error('CarguesContext used outside its Provider');

  const [cargues, setCargues] = React.useState<getCargues[]>([]);

  const carguesKey = '/api/transbel/getCargues';

  const { data, error, isLoading } = useSWR<getCargues[]>(carguesKey, axiosFetcher);

  React.useEffect(() => {
    if (data) {
      setCargues(data);
    }
  }, [data]);

  return {
    cargues,
    setCargues,
    isLoading,
    error,
  };
}
