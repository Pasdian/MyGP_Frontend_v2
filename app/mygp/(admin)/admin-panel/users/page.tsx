'use client';

import AddUserButton from '@/components/buttons/admin-panel/users/AddUserButton';
import UsersDataTable from '@/components/datatables/admin-panel/UsersDataTable';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { RolesContext } from '@/contexts/RolesContext';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getRoles } from '@/types/roles/getRoles';
import React from 'react';
import useSWRImmutable from 'swr/immutable';

export default function AdminPanelUsers() {
  const { data: roles, isLoading } = useSWRImmutable<getRoles[]>('/api/roles', axiosFetcher);
  if (isLoading) return;

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <RolesContext.Provider value={roles}>
        <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Usuarios</h1>
        <AddUserButton />
        <UsersDataTable />
      </RolesContext.Provider>
    </ProtectedRoute>
  );
}
