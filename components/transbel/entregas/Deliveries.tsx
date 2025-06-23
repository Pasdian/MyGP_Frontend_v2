'use client';

import {
  Column,
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
import { Input } from '@/components/ui/input';
import { Delivery } from '@/app/transbel/entregas/page';
import { columnDef } from './columnDef/columnDef';

export default function Deliveries({ data }: { data: Delivery[] }) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns: columnDef,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });

  return (
    <div>
      {/*Here starts the data table*/}
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
                              {/* <Filter column={header.column} table={table} /> */}
                              <Filter column={header.column} />
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
                <TableCell colSpan={columnDef.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/*Here starts pagination*/}
      <div className="flex items-center justify-end space-x-2 py-4">
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

function Filter({
  column,
}: // table, // Debug purposes
{
  column: Column<Delivery, unknown>;
  // table: TTable<Deliveries>;
}) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      type={column.id == 'FEC_ETAP' ? 'date' : column.id == 'ACCIONES' ? '' : 'text'}
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => {
        column.setFilterValue(e.target.value.trim());
      }}
      placeholder={`Buscar...`}
      className={column.id == 'ACCIONES' ? 'hidden' : 'mb-4 rounded'}
    />
  );
}
