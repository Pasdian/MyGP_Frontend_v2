'use client';

import DeliveriesDataTable from '@/components/datatables/transbel/DeliveriesDataTable';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import {
  ADMIN_ROLE_UUID,
  OPERACIONES_AAP_UUID,
  OPERACIONES_STARS_LOGISTICS_UUID,
} from '@/lib/roles/roles';
import React from 'react';

export default function Deliveries() {
  return (
    <ProtectedRoute
      allowedRoles={[ADMIN_ROLE_UUID, OPERACIONES_STARS_LOGISTICS_UUID, OPERACIONES_AAP_UUID]}
    >
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      <DeliveriesDataTable />
    </ProtectedRoute>
  );
}
