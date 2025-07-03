'use client';

import { axiosFetcher } from '@/axios-instance';
import AdminPanelAddUserButton from '@/components/buttons/admin-panel/users/AdminPanelAddUserButton';
import UsersDataTable from '@/components/datatables/admin-panel/UsersDataTable';
import { RolesContext } from '@/contexts/RolesContext';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLE } from '@/lib/roles/roles';
import { getRoles } from '@/types/roles/getRoles';
import React from 'react';
import useSWRImmutable from 'swr/immutable';

export default function AdminPanelUsers() {
  const { user, isUserLoading } = useAuth();
  const { data: roles, isLoading: isRolesLoading } = useSWRImmutable<getRoles[]>(
    '/api/roles',
    axiosFetcher
  );

  if (isUserLoading || isRolesLoading) return;
  if (!user) return;
  if (user.role != ADMIN_ROLE) return <p>No tienes permisos para ver este contenido.</p>;
  return (
    <RolesContext.Provider value={roles}>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo</h1>
      <h1 className="text-xl font-bold tracking-tight mb-4">Usuarios</h1>
      <AdminPanelAddUserButton />
      <UsersDataTable />
    </RolesContext.Provider>
  );
}
