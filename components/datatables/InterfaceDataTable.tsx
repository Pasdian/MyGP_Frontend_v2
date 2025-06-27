'use client';

export const dynamic = 'force-dynamic';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React from 'react';
import { axiosFetcher } from '@/axios-instance';
import useSWRImmutable from 'swr/immutable';
import TablePagination from './pagination/TablePagination';
import IntefaceDataTableFilter from './filters/InterfaceDataTableFilter';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import TailwindSpinner from '../ui/TailwindSpinner';
import { InterfaceContext } from '@/contexts/InterfaceContext';

const getFormattedDate = (d: Date | undefined) => {
  if (!d) return;
  const date = d;
  const formatted = date.toISOString().split('T')[0];
  return formatted;
};

export function InterfaceDataTable({ columns }: { columns: ColumnDef<getRefsPendingCE>[] }) {
  const { initialDate, finalDate } = React.useContext(InterfaceContext);
  const { data, isValidating } = useSWRImmutable<getRefsPendingCE[]>(
    initialDate && finalDate
      ? `/api/transbel/getRefsPendingCE?initialDate=${getFormattedDate(
          initialDate
        )}&finalDate=${getFormattedDate(finalDate)}`
      : '/api/transbel/getRefsPendingCE',
    axiosFetcher
  );

  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 12 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: data ? data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    onColumnFiltersChange: setColumnFilters, // Filtering
    onPaginationChange: setPagination, // Pagination
    state: {
      columnFilters, // Filtering
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
                          <IntefaceDataTableFilter column={header.column} />
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
            table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}{' '}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex justify-center">
                  <p>Sin resultados...</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination table={table} />
    </div>
  );
}
