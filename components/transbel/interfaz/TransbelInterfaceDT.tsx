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
import { RefsPending } from '@/app/transbel/interfaz/page';

{
  /* This datatable is only for displaying transbel interface data */
  /* Before modyfing, go to shadcn datatable documentation*/
}

export function TransbelInterfaceDT({
  columns,
  data,
}: {
  columns: ColumnDef<RefsPending>[];
  data: RefsPending[];
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
            table.getRowModel().rows.map((row) => {
              // if (!row) return;
              // const curRow = row.original;
              // const rowErrorClassName = 'bg-red-300 hover:bg-red-300/80';
              // const rowErrors: {
              //   rowIdx: number;
              //   errorMsg: string;
              // }[] = [];

              // const tests: { test: boolean; errorMsg: string }[] = [
              //   {
              //     test: !curRow.REVALIDACION_073,
              //     errorMsg: 'No existe una fecha de revalidación',
              //   },
              //   {
              //     test: !curRow.ULTIMO_DOCUMENTO_114,
              //     errorMsg: 'No existe una fecha de último documento',
              //   },
              //   {
              //     test: !curRow.ENTREGA_TRANSPORTE_138,
              //     errorMsg: 'No existe una fecha de transporte',
              //   },
              //   {
              //     test: !curRow.MSA_130,
              //     errorMsg: 'No existe una fecha de MSA',
              //   },
              //   {
              //     test:
              //       curRow.REVALIDACION_073 &&
              //       curRow.ULTIMO_DOCUMENTO_114 &&
              //       curRow.REVALIDACION_073 > curRow.ULTIMO_DOCUMENTO_114
              //         ? true
              //         : false,
              //     errorMsg:
              //       'La fecha de revalidación es mayor igual a la fecha de último documento',
              //   },
              //   {
              //     test:
              //       curRow.ULTIMO_DOCUMENTO_114 &&
              //       curRow.MSA_130 &&
              //       curRow.ULTIMO_DOCUMENTO_114 > curRow.MSA_130
              //         ? true
              //         : false,
              //     errorMsg: 'La fecha de último documento es mayor igual a MSA',
              //   },
              //   {
              //     test: curRow.MSA_130 !== curRow.ENTREGA_TRANSPORTE_138,
              //     errorMsg: 'MSA no es igual a la fecha de entrega de transporte',
              //   },
              //   {
              //     test:
              //       curRow.ENTREGA_TRANSPORTE_138 &&
              //       curRow.ENTREGA_CDP_140 &&
              //       curRow.ENTREGA_TRANSPORTE_138 > curRow.ENTREGA_CDP_140
              //         ? true
              //         : false,
              //     errorMsg:
              //       'La fecha de entrega de transporte es mayor igual a la fecha de entrega CDP',
              //   },
              // ];

              // tests.map(({ test, errorMsg }) => {
              //   if (test) {
              //     rowErrors.push({
              //       rowIdx: row.index,
              //       errorMsg: errorMsg,
              //     });
              //   }
              // });

              return (
                <TableRow
                  className={
                    // rowErrors.some((val) => val.rowIdx == row.index) ? rowErrorClassName : ''
                    ''
                  }
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
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
    </div>
  );
}

function Filter({ column }: { column: Column<RefsPending, unknown> }) {
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
      className="w-36 border shadow rounded"
    />
  );
}
