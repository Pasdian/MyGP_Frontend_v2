import { ColumnDef } from "@tanstack/react-table";

import React from "react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { DailyTrackingRowFormatted } from "@/types/dashboard/tracking/dailyTracking";
import DailyTrackingModifyStatusBtn from "@/components/buttons/dashboard/DailyTrackingModifyStatusBtn";

const fuzzyFilter = createFuzzyFilter<DailyTrackingRowFormatted>();

export const dailyTrackingColumns: ColumnDef<DailyTrackingRowFormatted>[] = [
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      return <DailyTrackingModifyStatusBtn row={row} />;
    },
  },
  {
    accessorKey: "NUM_REFE",
    header: "Referencia",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.NUM_REFE ?? "--"}</p>
    ),
  },
  {
    accessorKey: "CLIENT_NAME",
    header: "Cliente",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.CLIENT_NAME ?? "--"}</p>
    ),
  },
  {
    accessorKey: "ENTRY_DATE_FORMATTED",
    header: "Fecha de Entrada",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.ENTRY_DATE_FORMATTED ?? "--"}</p>
    ),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "CUSTOM_CLEARANCE_DAYS",
    header: "Días de Despacho",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">
        {row.original.CUSTOM_CLEARANCE_DAYS ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "CURRENT_PHASE",
    header: "Etapa Actual",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center truncate max-w-[100px] overflow-hidden whitespace-nowrap">
        {row.original.CURRENT_PHASE ?? "--"}
      </p>
    ),
  },

  {
    accessorKey: "CUSTOM",
    header: "Aduana",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.CUSTOM ?? "--"}</p>
    ),
  },
  {
    accessorKey: "KAM",
    header: "Ejecutivo",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.KAM ?? "--"}</p>
    ),
  },
  {
    accessorKey: "STATUS",
    header: "Estatus",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.STATUS ?? "--"}</p>
    ),
  },
  {
    accessorKey: "MODIFIED_AT_FORMATTED",
    header: "Modificado en",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">
        {row.original.MODIFIED_AT_FORMATTED ?? "--"}
      </p>
    ),
  },
];
