import useSWR from 'swr';
import React, { useState, useEffect } from 'react';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { DeliveriesContext } from '@/contexts/DeliveriesContext';

export function useDeliveries() {
  const ctx = React.useContext(DeliveriesContext);
  if (!ctx) throw new Error('DeliveriesContext used outside its Provider');
  const { data, error, isLoading, mutate } = useSWR<getDeliveries[]>(
    '/api/transbel/getDeliveries',
    axiosFetcher
  );

  // Local state copy (editable in your components)
  const [deliveries, setDeliveries] = useState<getDeliveries[]>([]);

  // Keep local state synced with SWR data
  useEffect(() => {
    if (data) setDeliveries(data);
  }, [data]);

  return {
    deliveries,
    setDeliveries,
    isLoading,
    error,
    refresh: mutate, // revalidate or refresh data
  };
}
