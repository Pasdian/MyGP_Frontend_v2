'use client';

import DeliveriesDataTable from '@/components/datatables/transbel/DeliveriesDataTable';
import { useAuth } from '@/hooks/useAuth';
import {
  ADMIN_ROLE_UUID,
  OPERACIONES_AAP_UUID,
  OPERACIONES_STARS_LOGISTICS_UUID,
} from '@/lib/roles/roles';
import React from 'react';

export default function Deliveries() {
  const allowedRoles = [ADMIN_ROLE_UUID, OPERACIONES_STARS_LOGISTICS_UUID, OPERACIONES_AAP_UUID];

  const { user, isAuthLoading, userRoleUUID } = useAuth();

  if (isAuthLoading || !user) return;
  if (!allowedRoles.includes(userRoleUUID))
    return <p>No tienes permisos para ver este contenido.</p>;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      <DeliveriesDataTable />
    </div>
  );
}
