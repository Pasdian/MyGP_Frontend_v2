'use client';

import DeliveriesDataTable from '@/components/datatables/transbel/DeliveriesDataTable';
import RoleGuard from '@/components/RoleGuard/RoleGuard';
import React from 'react';

export default function Deliveries() {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'STARS', 'AAP']}>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      <DeliveriesDataTable />
    </RoleGuard>
  );
}
