'use client';

import DeliveriesDataTable from '@/components/datatables/transbel/DeliveriesDataTable';
import React from 'react';

export default function Deliveries() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      <DeliveriesDataTable />
    </div>
  );
}
