import { getDeliveries } from '@/types/transbel/getDeliveries';
import React from 'react';

export const DeliveriesContext = React.createContext<{
  deliveries: getDeliveries[] | undefined;
  setDeliveries: React.Dispatch<React.SetStateAction<getDeliveries[]>>;
  isLoading: boolean | undefined;
}>({
  deliveries: undefined,
  setDeliveries: () => {},
  isLoading: undefined,
});
