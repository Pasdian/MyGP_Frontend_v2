'use client';

import AdminPanelAddUserButton from '@/components/buttons/user/AdminPanelAddUserButton';
import UsersDataTable from '@/components/datatables/UsersDataTable';
import React from 'react';

export default function AdminPanelUsers() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Administrar Usuarios</h1>
      <AdminPanelAddUserButton />
      <UsersDataTable />
    </div>
  );
}
