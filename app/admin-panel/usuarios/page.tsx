'use client';

import { axiosFetcher } from '@/axios-instance';
import TablePagination from '@/components/datatables/pagination/TablePagination';
import UsersDataTable from '@/components/datatables/UsersDataTable';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { usersColumns } from '@/lib/columns/usersColumns';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';
import useSWRImmutable from 'swr/immutable';

export default function AdminPanelUsers() {
  const { data, isValidating } = useSWRImmutable<getAllUsers[]>(
    '/api/users/getAllUsers',
    axiosFetcher
  );
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: data ? data : [],
    columns: usersColumns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });

  if (isValidating || !data) return <TailwindSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Administrar Usuarios</h1>
      {isValidating ? <TailwindSpinner /> : <UsersDataTable table={table} />}
      <TablePagination table={table} />
    </div>
  );
}
