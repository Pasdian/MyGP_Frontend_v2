'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import TablePageSize from '../pageSize/TablePageSize';
import TablePagination from '../pagination/TablePagination';
import { embarqueColumns } from '@/lib/columns/embarqueColumns';
import { useEmbarque } from '@/hooks/useEmbarque/useEmbarque';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';
import EmbarqueDataTableFilter from '../filters/EmbarqueDataTableFilter';

export default function EmbarqueDataTable() {
  const { embarque, isLoading } = useEmbarque();
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: embarque || [],
    columns: embarqueColumns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { columnFilters, pagination },
    autoResetPageIndex: false,
  });

  if (isLoading) return <MyGPSpinner />;

  return (
    <div className="overflow-hidden rounded-md border">
      <Table className="mb-4">
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
                          <EmbarqueDataTableFilter column={header.column} />
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
              <TableCell colSpan={embarqueColumns.length} className="h-24 text-center">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mb-4 w-full flex justify-end items-center gap-2">
        <TablePageSize pagination={pagination} setPagination={setPagination} />
        <TablePagination table={table} />
      </div>
    </div>
  );
}
