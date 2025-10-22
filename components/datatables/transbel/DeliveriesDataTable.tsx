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
import { deliveriesColumns } from '@/lib/columns/deliveriesColumns';
import React from 'react';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import DeliveriesDataTableFilter from '../filters/DeliveriesDataTableFilter';
import TablePagination from '../pagination/TablePagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveriesContext } from '@/contexts/DeliveriesContext';

export default function DeliveriesDataTable() {
  const { deliveries, isLoading: isDeliveriesLoading } = React.useContext(DeliveriesContext);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [shouldFilterErrors, setShouldFilterErrors] = React.useState(true);

  const rowsForTable = React.useMemo(() => {
    if (!Array.isArray(deliveries)) return [];

    return deliveries.filter((r) => {
      const hasError =
        r?.has_entrega_cdp_error === true ||
        r?.has_guia_house_error === true ||
        r?.has_entrega_transporte_error === true;

      return shouldFilterErrors ? hasError : !hasError;
    });
  }, [deliveries, shouldFilterErrors]);

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

  if (isDeliveriesLoading) return <TailwindSpinner />;

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
