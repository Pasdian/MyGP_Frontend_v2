import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import UpdatePhase from '../UpdatePhase';
import { getDeliveries } from '@/app/api/transbel/getDeliveries/route';

export const columnDef: ColumnDef<getDeliveries>[] = [
  {
    accessorKey: 'ACCIONES',
    header: 'Acciones',
    cell: ({ row }) => {
      if (!row) return '-';
      return <UpdatePhase row={row} />;
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
      const date = row.original.FEC_ETAP.split('T')[0];
      return date;
    },
  },
  {
    accessorKey: 'HOR_ETAP',
    header: 'Hora',
    cell: ({ row }) => {
      if (!row.original.HOR_ETAP) return '-';
      console.log(row.original.HOR_ETAP);
      const time = row.original.HOR_ETAP.split('T')[1].substring(0, 5);
      return time;
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
