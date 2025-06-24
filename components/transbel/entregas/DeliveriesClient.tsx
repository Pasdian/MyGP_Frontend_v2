'use client';

import React from 'react';
import AddPhase from './AddPhase';
import Deliveries from './Deliveries';
import { axiosFetcher, GPClient } from '@/axios-instance';
import { getDeliveries } from '@/app/api/transbel/getDeliveries/route';
import useSWR from 'swr';
import TailwindSpinner from '@/components/TailwindSpinner';
import { getTransbelRefs } from '@/app/api/transbel/getTransbelRefs/route';

export const DeliveriesContext = React.createContext<{
  setShouldFetch: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export default function DeliveriesClient() {
  return (
    <div>
      <AddPhase />
      <Deliveries />
    </div>
  );
}
