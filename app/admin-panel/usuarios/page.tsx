'use client';

import AdminPanelAddUserButton from '@/components/buttons/user/AdminPanelAddUserButton';
import UsersDataTable from '@/components/datatables/UsersDataTable';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLE } from '@/lib/roles/roles';
import React from 'react';

export default function AdminPanelUsers() {
  const user = useAuth();
  if (user.role != ADMIN_ROLE) return <p>No tienes permisos para ver este contenido.</p>;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Administrar Usuarios</h1>
      <AdminPanelAddUserButton />
      <UsersDataTable />
    </div>
  );
}
