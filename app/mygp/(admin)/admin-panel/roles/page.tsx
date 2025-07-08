'use client';

import AddRoleButton from '@/components/buttons/admin-panel/roles/AddRoleButton';
import RolesDataTable from '@/components/datatables/admin-panel/RolesDataTable';

import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';
import React from 'react';

export default function AdminPanelRoles() {
  const { user, isAuthLoading, userRoleUUID } = useAuth();

  if (isAuthLoading || !user) return;
  if (userRoleUUID != ADMIN_ROLE_UUID) return <p>No tienes permisos para ver este contenido.</p>;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Roles</h1>
      <AddRoleButton />
      <RolesDataTable />
    </div>
  );
}
