import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { deliveriesColumns } from '@/lib/columns/deliveriesColumns';
import React from 'react';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import DeliveriesDataTableFilter from '../filters/DeliveriesDataTableFilter';
import TablePagination from '../pagination/TablePagination';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function DeliveriesDataTable() {
  const { data, isLoading } = useSWRImmutable<getDeliveries[]>(
    '/api/transbel/getDeliveries',
    axiosFetcher
  );
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [shouldFilterErrors, setShouldFilterErrors] = React.useState(true);

  const rowsForTable = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return shouldFilterErrors
      ? data.filter((r) => r?.has_error === true) // solo errores
      : data; // todo
  }, [data, shouldFilterErrors]);

  const table = useReactTable({
    data: rowsForTable ?? [],
    columns: deliveriesColumns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });

  if (isLoading) return <TailwindSpinner />;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="only-errors"
          checked={shouldFilterErrors}
          onCheckedChange={() => setShouldFilterErrors((prev) => !prev)}
          className="
            data-[state=checked]:bg-emerald-600
            data-[state=unchecked]:bg-slate-300
            focus-visible:ring-emerald-600
          "
        />
        <Label htmlFor="only-errors">Mostrar solo errores</Label>
      </div>
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
                            <DeliveriesDataTableFilter column={header.column} />
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
