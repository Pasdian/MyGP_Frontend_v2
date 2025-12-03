'use client';

export const dynamic = 'force-dynamic';

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
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
import TablePagination from '../pagination/TablePagination';
import { Button } from '@/components/ui/button';
import { Loader2, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import { dailyTrackingColumns } from '@/lib/columns/dailyTrackingColumns';
import DailyTrackingDataTableFilter from '../filters/DailyTrackingDataTableFilter';
import { useAuth } from '@/hooks/useAuth';
import { DailyTrackingContext } from '@/contexts/DailyTrackingContext';
import TablePageSize from '../pageSize/TablePageSize';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';

export function DailyTrackingDataTable({
  metaState,
}: {
  metaState: {
    kamValue: string;
    customValue: string;
    clientValue: string;
    currentPhaseValue: string;
    tabValue: string;
  };
}) {
  const { user } = useAuth();
  const { dailyTrackingData, isLoading: isDailyTrackingLoading } =
    React.useContext(DailyTrackingContext);

  // User info
  const userCasaUserName = user.complete_user.user.casa_user_name;
  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';
  const isTrafficAdmin = user?.complete_user?.role?.name === 'TRAFICO_ADMIN';
  const hasTrafficAdminPerm = user?.complete_user?.role?.permissions?.some(
    (p) => p.action === 'DASHBOARD_TRAFICO_ADMIN'
  );

  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isConvertingToCsv, setIsConvertingToCsv] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const filteredData = React.useMemo(() => {
    if (!Array.isArray(dailyTrackingData) || dailyTrackingData.length === 0) return [];

    const { tabValue, kamValue, customValue, currentPhaseValue, clientValue } = metaState ?? {};

    const result = dailyTrackingData.filter((item) => {
      if (currentPhaseValue && item.CURRENT_PHASE !== currentPhaseValue) return false;
      if (tabValue === 'open' && item.MSA) return false; // skip if MSA is not empty
      if (tabValue === 'closed' && !item.MSA) return false; // skip if MSA is empty
      if (kamValue && item.KAM !== kamValue) return false;
      if (customValue && item.CUSTOM !== customValue) return false;
      if (clientValue && item.CVE_IMPO !== clientValue) return false;

      if (!(isAdmin || isTrafficAdmin || hasTrafficAdminPerm)) {
        if (item.CASA_ID !== userCasaUserName) return false;
      }

      return true;
    });

    return result;
  }, [
    dailyTrackingData,
    metaState,
    isAdmin,
    isTrafficAdmin,
    hasTrafficAdminPerm,
    userCasaUserName,
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
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    sortDescFirst: true,
    state: { columnFilters, pagination, sorting },
  });

  async function convertToCsv() {
    setIsConvertingToCsv(true);

    try {
      // Format fields the same way you did before
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
        'Modificado en': item.MODIFIED_AT_FORMATTED,
      }));

      // Build CSV string
      const headers = Object.keys(formattedData[0] || {}).join(',');
      const rows = formattedData
        .map((row) =>
          Object.values(row)
            .map((value) => {
              if (value == null) return '';
              const v = String(value);
              if (v.includes(',') || v.includes('"') || v.includes('\n')) {
                return `"${v.replace(/"/g, '""')}"`;
              }
              return v;
            })
            .join(',')
        )
        .join('\n');

      const csvString = `${headers}\n${rows}`;

      // Create downloadable CSV file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);

      const filename = `seguimiento-diario-${Date.now()}.csv`;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('CSV generado correctamente');
    } catch {
      toast.error('Ocurrió un error al generar el CSV');
    } finally {
      setIsConvertingToCsv(false);
    }
  }
  if (isDailyTrackingLoading) return <MyGPSpinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Seguimiento Diario</h1>{' '}
      <div className="flex space-x-1 mb-4">
        {filteredData.length > 0 && (
          <Button
            className="bg-green-500 hover:bg-green-700 hover:text-white cursor-pointer text-white w-[200px]"
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
      </div>
    </div>
  );
}
