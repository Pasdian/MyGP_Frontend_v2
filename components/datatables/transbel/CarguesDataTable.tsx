'use client';

export const dynamic = 'force-dynamic';

import {
  Column,
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
import TablePagination from '../pagination/TablePagination';
import { Button } from '@/components/ui/button';
import CarguesDataTableFilter from '../filters/CarguesDataTableFilter';
import { IconSettings } from '@tabler/icons-react';
import { Loader2, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useCarguesColumns } from '@/lib/columns/carguesColumns';
import TablePageSize from '../pageSize/TablePageSize';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';
import { useCargue } from '@/hooks/useCargue/useCargue';

export function CarguesDataTable() {
  const { cargues, tabValue, isLoading: isCarguesLoading } = useCargue();
  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isSendingToDB, setIsSendingToDB] = React.useState(false);
  const [isConvertingToCsv, setIsConvertingToCsv] = React.useState(false);

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
    autoResetPageIndex: false,
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

  function convertToCsv() {
    setIsConvertingToCsv(true);

    try {
      // Export ALL filtered rows (not just current page):
      // - table.getFilteredRowModel() respects ColumnFiltersState
      // - it does not depend on pagination
      const filteredRows = table.getFilteredRowModel().rows;

      const leafCols = table.getAllLeafColumns();

      // Remove non-data/UI columns if you have them (adjust ids if needed)
      const exportCols = leafCols.filter((c) => c.id !== 'select' && c.id !== 'ACCIONES');

      if (!filteredRows.length || !exportCols.length) {
        toast.error('No hay datos para exportar');
        return;
      }

      const getHeaderLabel = <TData,>(col: Column<TData, unknown>) => {
        const h = col.columnDef.header;
        return typeof h === 'string' ? h : col.id;
      };

      const escapeCsv = (value: unknown) => {
        if (value === null || value === undefined) return '';
        const s = String(value);
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const headers = exportCols.map((c) => escapeCsv(getHeaderLabel(c))).join(',');

      const lines = filteredRows.map((row) => {
        return exportCols
          .map((col) => {
            // Use TanStack's computed value for this row/column
            const v = row.getValue(col.id);
            return escapeCsv(v);
          })
          .join(',');
      });

      const csv = [headers, ...lines].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');

      const filename = `cargues_${tabValue}_${yyyy}-${mm}-${dd}.csv`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      toast.success('CSV generado correctamente');
    } catch {
      toast.error('No se pudo generar el CSV');
    } finally {
      setIsConvertingToCsv(false);
    }
  }

  if (isCarguesLoading) return <MyGPSpinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Cargues de Transbel</h1>
      {filtered.length > 0 && (
        <Button
          className="bg-green-500 hover:bg-green-700 font-bold hover:text-white cursor-pointer text-white w-[200px]"
          onClick={() => convertToCsv()}
        >
          <div>
            {isConvertingToCsv ? (
              <div className="flex space-x-2 items-center">
                <Loader2 className="animate-spin" />
                <p>Cargando...</p>
              </div>
            ) : (
              <div className="flex space-x-2 items-center">
                <Sheet className="mr-2 h-4 w-4" />
                <p> Exportar Tabla a CSV</p>
              </div>
            )}
          </div>
        </Button>
      )}
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
      <div className="w-full flex justify-end items-center gap-2">
        <TablePageSize pagination={pagination} setPagination={setPagination} />
        <TablePagination table={table} />
      </div>{' '}
    </div>
  );
}
