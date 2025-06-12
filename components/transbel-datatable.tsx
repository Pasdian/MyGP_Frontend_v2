'use client';

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
import { Button } from '@/components/ui/button';
import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { TTransbelData } from './transbel/interfaz/TransbelClientInterface';
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

const transbelCols: { accessorKey: string; placeholder: string }[] = [
  {
    accessorKey: 'REFERENCIA',
    placeholder: 'Filtrar por referencia:',
  },
  {
    accessorKey: 'EE__GE',
    placeholder: 'Filtrar por EE/GE:',
  },
  {
    accessorKey: 'ADU_DESP',
    placeholder: 'Filtrar por aduana:',
  },
  {
    accessorKey: 'REVALIDACION_073',
    placeholder: 'Filtrar por revalidación:',
  },
  {
    accessorKey: 'ULTIMO_DOCUMENTO_114',
    placeholder: 'Filtrar por último Documento:',
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

export function TransbelDataTable<TData, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TTransbelData>[];
  data: TTransbelData[];
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    onColumnFiltersChange: setColumnFilters, // Filtering
    state: {
      pagination, // Pagination
      columnFilters, // Filtering
    },
  });

  return (
    <div>
      {/* Filter dialog starts here*/}
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-48 mb-3 rounded-md bg-indigo-500 hover:bg-indigo-600">
              Filtrar Datos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-dvh max-h-dvh overflow-y-auto rounded-none border-none sm:border sm:rounded-md sm:max-h-[95%]">
            <DialogHeader>
              <DialogTitle>Filtrar por columna</DialogTitle>
              <DialogDescription>Aqui podrás filtrar por columna.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 md:grid-cols-2 bg-white">
              {transbelCols.map((col) => {
                return (
                  <div key={col.accessorKey} className="mb-2">
                    <Label className="mb-2" htmlFor={col.accessorKey}>
                      {col.placeholder}
                    </Label>
                    <Input
                      placeholder={col.placeholder}
                      id={col.accessorKey}
                      value={(table.getColumn(col.accessorKey)?.getFilterValue() as string) ?? ''}
                      onChange={(event) => {
                        console.log(event.target.value);
                        table.getColumn(col.accessorKey)?.setFilterValue(event.target.value);
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="bg-indigo-500 hover:bg-indigo-600">Cerrar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* DataTable starts here*/}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
      </div>
      {/* Pagination starts here*/}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm">
          {`${pagination.pageIndex} / ${table.getPageCount()}`}
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
