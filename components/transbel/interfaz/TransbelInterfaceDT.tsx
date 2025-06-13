'use client';

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Table as TTable,
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
import { Label } from '../../ui/label';
import { TTransbelData } from './TransbelClientInterface';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Deliveries } from '../entregas/TransbelDeliveries';

const transbelCols: { accessorKey: string; placeholder: string }[] = [
  {
    accessorKey: 'REFERENCIA',
    placeholder: 'Filtrar por Referencia:',
  },
  {
    accessorKey: 'EE__GE',
    placeholder: 'Filtrar por EE/GE:',
  },
  {
    accessorKey: 'ADU_DESP',
    placeholder: 'Filtrar por Aduana:',
  },
  {
    accessorKey: 'REVALIDACION_073',
    placeholder: 'Filtrar por Revalidación:',
  },
  {
    accessorKey: 'ULTIMO_DOCUMENTO_114',
    placeholder: 'Filtrar por Último Documento:',
  },
  {
    accessorKey: 'ENTREGA_TRANSPORTE_138',
    placeholder: 'Filtrar por Entrega de Transporte:',
  },
  {
    accessorKey: 'CE_138',
    placeholder: 'Filtrar por CE 138:',
  },
  {
    accessorKey: 'MSA_130',
    placeholder: 'Filtrar por MSA:',
  },
  {
    accessorKey: 'ENTREGA_CDP_140',
    placeholder: 'Filtrar por Entrega CDP:',
  },
  {
    accessorKey: 'CE_140',
    placeholder: 'Filtrar por CE 140:',
  },
];

{
  /* This datatable is only for displaying transbel interface data */
  /* Before modyfing, go to shadcn datatable documentation*/
}

export function TransbelInterfaceDT({
  columns,
  data,
}: {
  columns: ColumnDef<TTransbelData>[];
  data: TTransbelData[];
}) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
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
    <div>
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
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter column={header.column} table={table} />
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex justify-center">
                  <p>Sin resultados...</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
  );
}

function Filter({ column, table }: { column: Column<any, any>; table: TTable<any> }) {
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
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Buscar...`}
      className="w-36 border shadow rounded"
    />
  );
}
