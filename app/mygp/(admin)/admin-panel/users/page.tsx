'use client';

import AdminPanelAddUserButton from '@/components/buttons/admin-panel/users/AdminPanelAddUserButton';
import UsersDataTable from '@/components/datatables/admin-panel/UsersDataTable';
import { RolesContext } from '@/contexts/RolesContext';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';
import React from 'react';

export default function AdminPanelUsers() {
  const { user, isAuthLoading, userRoleUUID, roles } = useAuth();

  if (isAuthLoading || !user) return;
  if (userRoleUUID != ADMIN_ROLE_UUID) return <p>No tienes permisos para ver este contenido.</p>;

  return (
    <RolesContext.Provider value={roles}>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Usuarios</h1>
      <AdminPanelAddUserButton />
      <UsersDataTable />
    </RolesContext.Provider>
  );
}
