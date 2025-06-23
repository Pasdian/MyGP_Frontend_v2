'use client';

import {
  Column,
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
import { Button } from '@/components/ui/button';
import React from 'react';
import { Input } from '../../ui/input';
import { InterfaceData } from './types/Interface';
import { InterfaceContext } from './InterfaceClient';

{
  /* This datatable is only for displaying transbel interface data */
  /* Before modyfing, go to shadcn datatable documentation*/
}

export function DataTable({
  columns,
  data,
}: {
  columns: ColumnDef<InterfaceData>[];
  data: InterfaceData[];
}) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 12 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
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

  return (
    <>
      {/* DataTable starts here*/}
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
                        {header.column.getCanFilter() ? <Filter column={header.column} /> : null}
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
      <div>
        {/* Pagination starts here*/}
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

function Filter({ column }: { column: Column<InterfaceData, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      type={
        column.id == 'ENTREGA_TRANSPORTE_138' ||
        column.id == 'MSA_130' ||
        column.id == 'REVALIDACION_073' ||
        column.id == 'ULTIMO_DOCUMENTO_114'
          ? 'date'
          : 'text'
      }
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value.trim())}
      placeholder={`Buscar...`}
      className={column.id == 'ACCIONES' ? 'hidden' : 'mb-2 rounded'}
    />
  );
}
