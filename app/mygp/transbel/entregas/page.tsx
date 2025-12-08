'use client';

import AccessGuard from '@/components/AccessGuard/AccessGuard';
import DeliveriesDataTable from '@/components/datatables/transbel/DeliveriesDataTable';
import { DeliveriesContext } from '@/contexts/DeliveriesContext';
import { useDeliveries } from '@/hooks/useDeliveries';
import React from 'react';

export default function Deliveries() {
  const { deliveries, setDeliveries, isLoading } = useDeliveries();
  return (
    <AccessGuard allowedRoles={['ADMIN', 'TRANSBEL', 'STARS', "TRANSBEL_ADMIN"]}>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      <DeliveriesContext.Provider value={{ deliveries, setDeliveries, isLoading }}>
        <DeliveriesDataTable />
      </DeliveriesContext.Provider>
    </AccessGuard>
  );
}
