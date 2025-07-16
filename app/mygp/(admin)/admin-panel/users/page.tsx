'use client';

import AddUserButton from '@/components/buttons/admin-panel/users/AddUserButton';
import UsersDataTable from '@/components/datatables/admin-panel/UsersDataTable';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { RolesContext } from '@/contexts/RolesContext';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';
import React from 'react';

export default function AdminPanelUsers() {
  const { roles } = useAuth();

  return (
    <ProtectedRoute allowedRoles={[ADMIN_ROLE_UUID]}>
      <RolesContext.Provider value={roles}>
        <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Usuarios</h1>
        <AddUserButton />
        <UsersDataTable />
      </RolesContext.Provider>
    </ProtectedRoute>
  );
}
