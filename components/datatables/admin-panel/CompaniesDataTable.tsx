import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { flexRender } from '@tanstack/react-table';
import { deliveriesColumns } from '@/lib/columns/deliveriesColumns';
import TablePagination from '../pagination/TablePagination';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import TailwindSpinner from '../../ui/TailwindSpinner';
import { getRoles } from '@/types/roles/getRoles';
import { rolesColumns } from '@/lib/columns/rolesColumns';
import RolesDataTableFilter from '../filters/RolesDataTableFilter';

export default function CompaniesDataTable() {
  const { data, isValidating } = useSWRImmutable<getRoles[]>('/api/roles', axiosFetcher);

  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: data ? data : [],
    columns: rolesColumns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });

  if (isValidating) return <TailwindSpinner />;

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanFilter() ? (
                          <div>
                            <RolesDataTableFilter column={header.column} />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={deliveriesColumns.length} className="h-24 text-center">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination table={table} />
    </div>
  );
}
