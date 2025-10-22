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
import TablePagination from '../pagination/TablePagination';
import { Button } from '@/components/ui/button';
import { Loader2, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { dailyTrackingColumns } from '@/lib/columns/dailyTrackingColumns';
import DailyTrackingDataTableFilter from '../filters/DailyTrackingDataTableFilter';
import { useAuth } from '@/hooks/useAuth';
import { DailyTrackingContext } from '@/contexts/DailyTrackingContext';

export function DailyTrackingDataTable({
  filterValues,
}: {
  filterValues: {
    kam?: string | undefined;
    custom?: string | undefined;
    phase?: string | undefined;
    client?: string | undefined;
    tab?: string | undefined;
  };
}) {
  const { user } = useAuth();
  const { dailyTrackingData } = React.useContext(DailyTrackingContext);
  const userCasaUserName = user.complete_user.user.casa_user_name;
  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';
  const isTrafficAdmin = user?.complete_user?.role?.name === 'TRAFICO_ADMIN';
  const hasTrafficAdminPerm = user?.complete_user?.role?.permissions?.some(
    (p) => p.action === 'DASHBOARD_TRAFICO_ADMIN'
  );

  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isConvertingToCsv, setIsConvertingToCsv] = React.useState(false);

  const filteredData = React.useMemo(() => {
    if (!dailyTrackingData) return [];

    const normalize = (val?: string | null) => val?.toLowerCase().trim() ?? '';

    const { kam, custom, phase, client, tab } = filterValues;

    const tabVal = normalize(tab);
    const kamVal = normalize(kam);
    const customVal = normalize(custom);
    const phaseVal = normalize(phase);
    const clientVal = normalize(client);

    return dailyTrackingData.filter((item) => {
      const itemMSA = normalize(item.MSA);
      const itemKam = normalize(item.KAM);
      const itemCustom = normalize(item.CUSTOM);
      const itemPhase = normalize(item.CURRENT_PHASE_CODE);
      const itemClient = normalize(item.CLIENT_NAME);

      // tab logic
      let matchMSA = true;
      if (tabVal === 'open') {
        matchMSA = itemMSA === ''; // MSA is empty
      } else if (tabVal === 'closed') {
        matchMSA = itemMSA !== ''; // MSA has a value
      }

      // each filter only matters if it has a value
      const matchKam = !kamVal || itemKam === kamVal;
      const matchCustom = !customVal || itemCustom === customVal;
      const matchPhase = !phaseVal || itemPhase === phaseVal;
      const matchClient = !clientVal || itemClient === clientVal;
      const matchCasaId = item.CASA_ID == userCasaUserName;

      if (isAdmin || isTrafficAdmin || hasTrafficAdminPerm) {
        return matchMSA && matchKam && matchCustom && matchPhase && matchClient;
      } else {
        return matchMSA && matchKam && matchCustom && matchPhase && matchClient && matchCasaId;
      }

      // must satisfy all active filters and tab rule
    });
  }, [
    dailyTrackingData,
    filterValues,
    isAdmin,
    userCasaUserName,
    hasTrafficAdminPerm,
    isTrafficAdmin,
  ]);

  // Table instance
  const table = useReactTable({
    data: filteredData || [],
    columns: dailyTrackingColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: { columnFilters, pagination },
  });

  async function convertToCsv() {
    setIsConvertingToCsv(true);
    try {
      const formattedData = filteredData.map((item) => ({
        Referencia: item.NUM_REFE,
        Cliente: item.CLIENT_NAME,
        'Fecha de Entrada': item.ENTRY_DATE_FORMATTED || item.ENTRY_DATE,
        MSA: item.MSA_FORMATTED,
        'Dias de Despacho': item.CUSTOM_CLEARANCE_DAYS,
        'Etapa Actual': item.CURRENT_PHASE,
        Aduana: item.CUSTOM_FORMATTED,
        Ejecutivo: item.KAM,
        Estatus: item.STATUS,
        'Modificado en': item.MODIFIED_AT,
      }));

      const res = await GPClient.post(
        '/api/csv-converter',
        { payload: formattedData },
        { responseType: 'blob' }
      );

      // Try to use filename from server headers, otherwise fallback
      const dispo = res.headers['content-disposition'] || '';
      const match = dispo.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
      const filename = match?.[1] || `daily-tracking-${Date.now()}.csv`;

      // Create a download
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('CSV generado correctamente');
      setIsConvertingToCsv(false);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) && (err.response?.data?.message || err.message)) ||
        'Ocurrió un error';
      toast.error(message);
      setIsConvertingToCsv(false);
    } finally {
      setIsConvertingToCsv(false);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Seguimiento Diario</h1>
      <div className="flex space-x-1 mb-4">
        {filteredData.length > 0 && (
          <Button
            variant="outline"
            className="bg-green-500 hover:bg-green-600 hover:text-white cursor-pointer text-white w-[200px]"
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
                          <DailyTrackingDataTableFilter column={header.column} />
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
              <TableCell colSpan={dailyTrackingColumns.length} className="h-24 text-center">
                <div className="flex justify-center">
                  <p>Cargando...</p>
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
