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
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import TablePagination from '../pagination/TablePagination';
import { Button } from '@/components/ui/button';
import CarguesDataTableFilter from '../filters/CarguesDataTableFilter';
import { IconSettings } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useCarguesColumns } from '@/lib/columns/carguesColumns';
import { CarguesContext } from '@/contexts/CarguesContext';

export function CarguesDataTable() {
  const { cargues, tabValue, isLoading: isCarguesLoading } = React.useContext(CarguesContext);
  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isSendingToDB, setIsSendingToDB] = React.useState(false);

  const carguesColumns = useCarguesColumns();
  // Ensure each row has a stable id and USE it in the table

  const filtered = React.useMemo(() => {
    const rows = Array.isArray(cargues) ? cargues : [];

    switch (tabValue) {
      case 'paid':
        // either flag (errors or has_errors) qualifies
        return rows.filter((r) => r?.paid === true);

      case 'pending':
        return rows.filter((r) => r?.pending === true);

      default:
        return rows;
    }
  }, [cargues, tabValue]);

  // Table instance
  const table = useReactTable({
    data: filtered,
    columns: carguesColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    state: { columnFilters, pagination, rowSelection },
    enableRowSelection: true,
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.filter((r) => r.getCanSelect())
    .map((r) => r.original);

  async function sendToDB() {
    setIsSendingToDB(true);
    try {
      const res = await GPClient.post('/api/transbel/missingCargue', {
        payload: selectedRows,
      });

      toast.success(res.data.message || 'Se actualizó el estado de los pedimentos');
      setIsSendingToDB(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Ocurrió un error';
        toast.error(message);
        setIsSendingToDB(false);
      } else {
        toast.error('Ocurrió un error inesperado');
        setIsSendingToDB(false);
      }
      setIsSendingToDB(false);
    }
  }

  if (isCarguesLoading) return <TailwindSpinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Cargues de Transbel</h1>
      <div className="flex items-center space-x-2 mb-4">
        {selectedRows.length > 0 && (
          <div>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
              onClick={sendToDB}
              disabled={isSendingToDB}
            >
              <div className="flex items-center">
                {isSendingToDB ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    <p>Enviando</p>
                  </>
                ) : (
                  <>
                    <IconSettings className="mr-2 h-4 w-4" />
                    <p>Enviar {selectedRows.length} pedimentos</p>
                  </>
                )}
              </div>
            </Button>
          </div>
        )}
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
                          <CarguesDataTableFilter column={header.column} />
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
              <TableCell colSpan={carguesColumns.length} className="h-24 text-center">
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
