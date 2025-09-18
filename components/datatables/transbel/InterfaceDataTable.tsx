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
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { InterfaceContext } from '@/contexts/InterfaceContext';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import IntefaceDataTableFilter from '../filters/InterfaceDataTableFilter';
import TablePagination from '../pagination/TablePagination';
import { interfaceColumns } from '@/lib/columns/interfaceColumns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { IconSettings } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import axios from 'axios';

const isEmptyDate = (d: string | null | undefined): boolean => d == null || d === '';

function emptyDatesFirst<T>(
  arr: readonly T[],
  getDate: (item: T) => string | null | undefined
): T[] {
  const empty: T[] = [];
  const filled: T[] = [];
  for (const item of arr) {
    (isEmptyDate(getDate(item)) ? empty : filled).push(item);
  }
  return empty.concat(filled);
}

export function InterfaceDataTable() {
  const { initialDate, finalDate } = React.useContext(InterfaceContext);
  const pendingRefsKey =
    initialDate && finalDate
      ? `/api/transbel/getRefsPendingCE?initialDate=${
          initialDate.toISOString().split('T')[0]
        }&finalDate=${finalDate.toISOString().split('T')[0]}`
      : '/api/transbel/getRefsPendingCE';

  const { data, isLoading } = useSWRImmutable<getRefsPendingCE[]>(pendingRefsKey, axiosFetcher);

  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [shouldFilterErrors, setShouldFilterErrors] = React.useState(true);
  const [shouldFilterWorkatoStatus, setShouldFilterWorkatoStatus] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isSendingToWorkato, setIsSendingToWorkato] = React.useState(false);

  // Filtered rows based on switches
  const filtered = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!shouldFilterErrors && !shouldFilterWorkatoStatus) {
      return data.filter(Boolean);
    }
    return data.filter((r) => {
      if (!r) return false;
      if (shouldFilterErrors && !r.has_error) return false;
      if (shouldFilterWorkatoStatus && !r.was_send_to_workato) return false;
      if (shouldFilterErrors && !shouldFilterWorkatoStatus && r.was_send_to_workato) return false;
      return true;
    });
  }, [data, shouldFilterErrors, shouldFilterWorkatoStatus]);

  const rowsForTable = React.useMemo(
    () => emptyDatesFirst(filtered, (r) => r.workato_last_modified ?? null),
    [filtered]
  );

  // Selection column (TanStack selection state, not the data field)
  const selectionWorkatoColumn = React.useMemo<ColumnDef<getRefsPendingCE>>(
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
        const sent = row.original.was_send_to_workato;
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
  const columns = React.useMemo<ColumnDef<getRefsPendingCE>[]>(() => {
    return [selectionWorkatoColumn, ...interfaceColumns];
  }, [selectionWorkatoColumn]);

  // Table instance
  const table = useReactTable({
    data: rowsForTable ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    enableRowSelection: (row) => !row.original.was_send_to_workato,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.REFERENCIA),
    state: { columnFilters, pagination, rowSelection },
  });

  // Preselect only when data changes (don’t wipe user clicks on every toggle)
  React.useEffect(() => {
    if (!Array.isArray(data)) return;
    const initial: Record<string, boolean> = {};
    data.forEach((r) => {
      if (r?.was_send_to_workato) initial[String(r.REFERENCIA)] = true;
    });
    setRowSelection(initial);
  }, [data]);

  const selectedWorkatoRows = table
    .getSelectedRowModel()
    .rows.filter((r) => r.getCanSelect())
    .map((r) => r.original);

  async function sendToWorkato() {
    setIsSendingToWorkato(true);
    try {
      const res = await GPClient.post('/api/transbel/sendToTransbelAPI', {
        payload: selectedWorkatoRows,
      });

      toast.success(res.data.message || 'Enviado a Workato correctamente');
      setIsSendingToWorkato(false);
      mutate(pendingRefsKey);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Ocurrió un error';
        toast.error(message);
        setIsSendingToWorkato(false);
      } else {
        toast.error('Ocurrió un error inesperado');
        setIsSendingToWorkato(false);
      }
      setIsSendingToWorkato(false);
    }
  }

  if (isLoading) return <TailwindSpinner />;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center">
          <Switch
            id="only-errors"
            checked={shouldFilterErrors}
            onCheckedChange={() => setShouldFilterErrors((prev) => !prev)}
            className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300 focus-visible:ring-emerald-600 mr-2"
          />
          <Label htmlFor="only-errors">Mostrar solo errores</Label>
        </div>

        <div className="flex items-center">
          <Switch
            id="workato-status"
            checked={shouldFilterWorkatoStatus}
            onCheckedChange={() => setShouldFilterWorkatoStatus((prev) => !prev)}
            className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300 focus-visible:ring-emerald-600 mr-2"
          />
          <Label htmlFor="workato-status">Estatus del Envío</Label>
        </div>
        {selectedWorkatoRows.length > 0 && (
          <div>
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={sendToWorkato}
              disabled={isSendingToWorkato} // optional: disable while loading
            >
              <div className="flex items-center">
                {isSendingToWorkato ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    <p>Enviando</p>
                  </>
                ) : (
                  <>
                    <IconSettings className="mr-2 h-4 w-4" />
                    <p>Enviar {selectedWorkatoRows.length} referencias a Workato</p>
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
                          <IntefaceDataTableFilter column={header.column} />
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
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
