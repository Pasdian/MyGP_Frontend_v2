import { ColumnDef } from "@tanstack/react-table";

import React from "react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { DailyTrackingFormatted } from "@/types/dashboard/tracking/dailyTracking";
import DailyTrackingModifyStatusBtn from "@/components/buttons/dashboard/DailyTrackingModifyStatusBtn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

const fuzzyFilter = createFuzzyFilter<DailyTrackingFormatted>();

export const dailyTrackingColumns: ColumnDef<DailyTrackingFormatted>[] = [
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
      <p className="text-center">{row.original.NUM_REFE || "--"}</p>
    ),
  },
  {
    accessorKey: "CLIENT_NAME",
    header: "Cliente",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center truncate max-w-[150px] overflow-hidden whitespace-nowrap">
        {row.original.CLIENT_NAME || "--"}
      </p>
    ),
  },
  {
    accessorKey: "ENTRY_DATE_FORMATTED",
    header: "Fecha de Entrada",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.ENTRY_DATE_FORMATTED || "--"}</p>
    ),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "MSA_FORMATTED",
    header: "MSA",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.MSA_FORMATTED || "--"}</p>
    ),
  },
  {
    accessorKey: "CUSTOM_CLEARANCE_DAYS",
    header: "Días de Despacho",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">
        {row.original.CUSTOM_CLEARANCE_DAYS || "--"}
      </p>
    ),
  },
  {
    accessorKey: "CURRENT_PHASE",
    header: "Etapa Actual",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center truncate max-w-[200px] overflow-hidden whitespace-nowrap">
        {row.original.CURRENT_PHASE || "--"}
      </p>
    ),
  },

  {
    accessorKey: "CUSTOM_FORMATTED",
    header: "Aduana",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.CUSTOM_FORMATTED || "--"}</p>
    ),
  },
  {
    accessorKey: "KAM_FORMATTED",
    header: "Ejecutivo",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.KAM_FORMATTED || "--"}</p>
    ),
  },
  {
    accessorKey: "STATUS",
    header: "Estatus",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.STATUS) {
        return <p className="text-center">{row.original.STATUS || "--"}</p>;
      }
      return (
        <Popover>
          <PopoverTrigger className="w-full">
            <div className="flex items-center gap-1 max-w-[350px]">
              <p className="text-xs text-center flex items-center justify-center flex-1 min-w-0 whitespace-normal break-words line-clamp-3 text-justify">
                {row.original.STATUS || "--"}
              </p>

              <ChevronDown className="opacity-50 w-4 flex-shrink-0 mt-0.5" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="text-xs">
            {row.original.STATUS || "--"}
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    accessorKey: "MODIFIED_AT_FORMATTED",
    header: "Modificado en",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">
        {row.original.MODIFIED_AT_FORMATTED || "--"}
      </p>
    ),
  },
];
