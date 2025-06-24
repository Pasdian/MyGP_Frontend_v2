'use client';

import React from 'react';
import AddPhase from './AddPhase';
import Deliveries from './Deliveries';
import { GPClient } from '@/axios-instance';
import { getDeliveries } from '@/app/api/transbel/getDeliveries/route';
import TailwindSpinner from '@/components/TailwindSpinner';

export const DeliveriesContext = React.createContext<{
  setShouldFetch: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export default function DeliveriesClient() {
  const [deliveries, setDeliveries] = React.useState<getDeliveries[]>([]);
  const [refs, setRefs] = React.useState<{ NUM_REFE: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [shouldFetch, setShouldFetch] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      const [deliveriesRes, transbelRefs] = await Promise.all([
        GPClient.get(`/api/transbel/getDeliveries`),
        GPClient.get(`/api/transbel/getTransbelRefs`),
      ]);

      setIsLoading((old) => !old);

      const deliveries: getDeliveries[] = await deliveriesRes.data;
      const refs: { NUM_REFE: string }[] = await transbelRefs.data;

      deliveries.map((item) => {
        if (item.FEC_ETAP) {
          const date = new Date(item.FEC_ETAP);
          const formatDate = date.toLocaleDateString('es-pa').split('/'); // Get date as mm-dd-yyyy
          const month = formatDate[0];
          const day = formatDate[1];
          const year = formatDate[2];
          // ISO format
          item.FEC_ETAP = `${year}-${month}-${day}`;
        }

        if (item.HOR_ETAP) {
          item.HOR_ETAP = item.HOR_ETAP = new Date(item.HOR_ETAP).toLocaleTimeString('es-MX', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
          });
        }
      });
      setRefs(() => refs);
      setDeliveries(() => deliveries);
    }
    fetchData();
  }, [shouldFetch]);

  return (
    <DeliveriesContext.Provider value={{ setShouldFetch }}>
      {isLoading ? (
        <TailwindSpinner />
      ) : (
        <div>
          <AddPhase refs={refs} />
          <Deliveries data={deliveries} />
        </div>
      )}
    </DeliveriesContext.Provider>
  );
}
