'use client';

import AddRoleButton from '@/components/buttons/admin-panel/roles/AddRoleButton';
import RolesDataTable from '@/components/datatables/admin-panel/RolesDataTable';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import React from 'react';

export default function AdminPanelRoles() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Roles</h1>
      <AddRoleButton />
      <RolesDataTable />
    </ProtectedRoute>
  );
}
