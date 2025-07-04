'use client';

import AdminPanelAddRoleButton from '@/components/buttons/admin-panel/roles/AdminPanelAddRoleButton';
import RolesDataTable from '@/components/datatables/admin-panel/RolesDataTable';

import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLE } from '@/lib/roles/roles';
import React from 'react';

export default function AdminPanelRoles() {
  const { user, isUserLoading } = useAuth();

  if (isUserLoading) return;
  if (!user) return;
  if (user.role != ADMIN_ROLE) return <p>No tienes permisos para ver este contenido.</p>;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Roles</h1>
      <AdminPanelAddRoleButton />
      <RolesDataTable />
    </div>
  );
}
