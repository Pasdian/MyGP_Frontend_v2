'use client';

export const dynamic = 'force-dynamic';

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
import React from 'react';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import useSWRImmutable from 'swr/immutable';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import TablePagination from '../pagination/TablePagination';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getCargues } from '@/types/transbel/getCargues';
import CarguesDataTableFilter from '../filters/CarguesDataTableFilter';
import { Checkbox } from '@/components/ui/checkbox';
import { carguesColumns } from '@/lib/columns/carguesColumns';
import { IconSettings } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import axios from 'axios';

export function CarguesDataTable() {
  const carguesKey = '/api/transbel/getCargues';

  const { data, isLoading } = useSWRImmutable<getCargues[]>(carguesKey, axiosFetcher);

  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [shouldFilterValidated, setShouldFilterValidated] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isSendingToDB, setIsSendingToDB] = React.useState(false);

  // Filtered rows based on switches
  const rowsForTable = React.useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((r) => {
      if (!r) return false;

      // If the switch is OFF, return all rows
      if (!shouldFilterValidated) return true;

      // If the switch is ON, only keep validated ones
      return r.IS_MISSING;
    });
  }, [data, shouldFilterValidated]);

  const validadoColumn = React.useMemo<ColumnDef<getCargues>>(
    () => ({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const sent = row.original.IS_MISSING;
        return (
          <Checkbox
            checked={sent ? true : row.getIsSelected()}
            disabled={sent ? true : !row.getCanSelect()}
            onCheckedChange={(v) => !sent && row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 36,
    }),
    []
  );

  // Merge selection column with your domain columns
  const columns = React.useMemo<ColumnDef<getCargues>[]>(() => {
    return [validadoColumn, ...carguesColumns];
  }, [validadoColumn]);

  // Table instance
  const table = useReactTable({
    data: rowsForTable ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    enableRowSelection: (row) => !row.original.IS_MISSING,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.REFERENCIA),
    state: { columnFilters, pagination, rowSelection },
  });

  // Preselect only when data changes (don’t wipe user clicks on every toggle)
  React.useEffect(() => {
    if (!Array.isArray(data)) return;
    const initial: Record<string, boolean> = {};
    data.forEach((r) => {
      if (r?.IS_MISSING) initial[String(r.REFERENCIA)] = true;
    });
    setRowSelection(initial);
  }, [data]);

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
      mutate(carguesKey);
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

  if (isLoading) return <TailwindSpinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Cargues de Transbel</h1>
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center">
          <Switch
            id="only-errors"
            checked={shouldFilterValidated}
            onCheckedChange={() => setShouldFilterValidated((prev) => !prev)}
            className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300 focus-visible:ring-emerald-600 mr-2"
          />
          <Label htmlFor="only-errors">Mostrar faltantes</Label>
        </div>

        {selectedRows.length > 0 && (
          <div>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
              onClick={sendToDB}
              disabled={isSendingToDB} // optional: disable while loading
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
                    <p>Seleccionar {selectedRows.length} pedimentos como faltantes</p>
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
