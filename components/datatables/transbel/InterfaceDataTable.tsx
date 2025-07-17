'use client';

export const dynamic = 'force-dynamic';

import {
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
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import useSWRImmutable from 'swr/immutable';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { InterfaceContext } from '@/contexts/InterfaceContext';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import IntefaceDataTableFilter from '../filters/InterfaceDataTableFilter';
import TablePagination from '../pagination/TablePagination';
import { interfaceColumns } from '@/lib/columns/interfaceColumns';

export function InterfaceDataTable() {
  const { initialDate, finalDate } = React.useContext(InterfaceContext);
  const { data, isValidating } = useSWRImmutable<getRefsPendingCE[]>(
    initialDate && finalDate
      ? `/api/transbel/getRefsPendingCE?initialDate=${
          initialDate.toISOString().split('T')[0]
        }&finalDate=${finalDate.toISOString().split('T')[0]}`
      : '/api/transbel/getRefsPendingCE',
    axiosFetcher
  );

  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 12 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: data ? data : [],
    columns: interfaceColumns,
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

  React.useEffect(() => {
    if (!data) return;
    data.map((item) => {
      item.REVALIDACION_073 = item.REVALIDACION_073 ? item.REVALIDACION_073.split(' ')[0] : '';
      item.ULTIMO_DOCUMENTO_114 = item.ULTIMO_DOCUMENTO_114
        ? item.ULTIMO_DOCUMENTO_114.split(' ')[0]
        : '';
      item.MSA_130 = item.MSA_130 ? item.MSA_130.split(' ')[0] : '';
      item.ENTREGA_TRANSPORTE_138 = item.ENTREGA_TRANSPORTE_138
        ? item.ENTREGA_TRANSPORTE_138.split(' ')[0]
        : '';
    });
  }, [data]);

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
              <TableCell colSpan={interfaceColumns.length} className="h-24 text-center">
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
