'use client';

import TablePagination from '@/components/datatables/pagination/TablePagination';
import UsersDataTable from '@/components/datatables/UsersDataTable';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import React from 'react';

export default function AdminPanelUsers() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Administrar Usuarios</h1>
      <UsersDataTable />
    </div>
  );
}
