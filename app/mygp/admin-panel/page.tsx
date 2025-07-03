'use client';

import AdminPanelAddRoleButton from '@/components/buttons/admin-panel/AdminPanelAddRoleButton';
import AdminPanelAddUserButton from '@/components/buttons/admin-panel/AdminPanelAddUserButton';
import UsersDataTable from '@/components/datatables/UsersDataTable';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLE } from '@/lib/roles/roles';
import React from 'react';

export default function AdminPanelUsers() {
  const { user, isUserLoading } = useAuth();
  if (isUserLoading) return;
  if (!user) return;
  if (user.role != ADMIN_ROLE) return <p>No tienes permisos para ver este contenido.</p>;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo</h1>
      <div className="flex">
        <div className="mr-4">
          <AdminPanelAddUserButton />
        </div>
        <AdminPanelAddRoleButton />
      </div>
      <UsersDataTable />
    </div>
  );
}
