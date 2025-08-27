'use client';

import AccessGuard from '@/components/AccessGuard/AccessGuard';
import DeliveriesDataTable from '@/components/datatables/transbel/DeliveriesDataTable';
import React from 'react';

export default function Deliveries() {
  return (
    <AccessGuard
      allowedModules={['All Modules', 'Transbel Entregas']}
      allowedRoles={['ADMIN', 'AAP', 'STARS']}
    >
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      <DeliveriesDataTable />
    </AccessGuard>
  );
}
