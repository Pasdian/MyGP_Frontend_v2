import React from 'react';
import AdminDataTable from '../datatables/admin-panel/AdminDataTable';
import { ColumnDef } from '@tanstack/react-table';

type AdminCRUDProps<T> = {
  addButton: React.ReactNode;
  dataTableUrl: string;
  title: string;
  columns: ColumnDef<T>[];
};

export default function AdminCrud<T>({
  addButton,
  dataTableUrl,
  title,
  columns,
}: AdminCRUDProps<T>) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / {title}</h1>
      {addButton}
      <AdminDataTable<T> dataTableUrl={dataTableUrl} columns={columns} />
    </div>
  );
}
