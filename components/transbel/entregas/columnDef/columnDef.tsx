import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import UpdatePhase from '../UpdatePhase';
import { Delivery } from '@/app/transbel/entregas/page';

export const columnDef: ColumnDef<Delivery>[] = [
  {
    accessorKey: 'ACCIONES',
    header: 'Acciones',
    cell: ({ row }) => {
      if (row) {
        return <UpdatePhase row={row} />;
      } else {
        return '-';
      }
    },
  },
  {
    accessorKey: 'NUM_REFE',
    header: 'Referencia',
  },
  {
    accessorKey: 'FEC_ETAP',
    header: 'Fecha',
    cell: ({ row }) => {
      if (!row.original.FEC_ETAP) return '-';
      const dateStr = row.original.FEC_ETAP.split('-');
      const year = dateStr[0];
      const month = dateStr[1];
      const day = dateStr[2];
      // es-ES format

      return `${day}/${month}/${year}`;
    },
  },
  {
    accessorKey: 'HOR_ETAP',
    header: 'Hora',
    cell: ({ row }) => {
      if (!row.original.HOR_ETAP) return '-';
      return row.original.HOR_ETAP;
    },
  },
  {
    accessorKey: 'OBS_ETAP',
    header: 'Código de Excepción',
    cell: ({ row }) => {
      if (!row.original.OBS_ETAP) return '-';
      return row.original.OBS_ETAP;
    },
  },
  {
    accessorKey: 'CVE_MODI',
    header: 'Usuario',
    cell: ({ row }) => {
      if (!row.original.CVE_MODI) return '-';
      return row.original.CVE_MODI;
    },
  },
];
