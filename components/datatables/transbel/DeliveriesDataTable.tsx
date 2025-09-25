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
import { getDeliveriesFormat } from '@/types/transbel/getDeliveries';
import { deliveriesColumns } from '@/lib/columns/deliveriesColumns';
import React from 'react';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import DeliveriesDataTableFilter from '../filters/DeliveriesDataTableFilter';
import TablePagination from '../pagination/TablePagination';
import { getFormattedDate } from '@/lib/utilityFunctions/getFormattedDate';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DeliveriesDataTable() {
  const { data, isLoading } = useSWRImmutable<getDeliveriesFormat[]>(
    '/api/transbel/getDeliveries',
    axiosFetcher
  );
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [shouldFilterErrors, setShouldFilterErrors] = React.useState(true);

  const modifiedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [] as getDeliveriesFormat[];
    return data.map((item) => ({
      ...item,
      ENTREGA_TRANSPORTE_138_FORMATTED:
        item.ENTREGA_TRANSPORTE_138 && getFormattedDate(item.ENTREGA_TRANSPORTE_138),
      ENTREGA_CDP_140_FORMATTED: item.ENTREGA_CDP_140 && getFormattedDate(item.ENTREGA_CDP_140),
    }));
  }, [data]);

  const rowsForTable = React.useMemo(() => {
    if (!Array.isArray(modifiedData)) return [];

    return modifiedData.filter((r) =>
      shouldFilterErrors ? r?.has_error === true : r?.has_error === false
    );
  }, [modifiedData, shouldFilterErrors]);

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
        <div className="flex items-center">
          <Tabs
            value={shouldFilterErrors ? 'errors' : 'not_errors'}
            onValueChange={(value) => setShouldFilterErrors(value === 'errors')}
          >
            <TabsList>
              <TabsTrigger value="errors">Referencias con Error</TabsTrigger>
              <TabsTrigger value="not_errors">Referencias sin Error</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
