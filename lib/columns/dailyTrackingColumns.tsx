import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { DailyTracking } from "@/types/dashboard/tracking/dailyTracking";

import { Button } from "@/components/ui/button";
import DailyTrackingModifyStatus from "@/components/buttons/dashboard/DailyTrackingModifyStatus";
import React from "react";
import HoverPopover from "@/components/HoverPopover/HoverPopover";

const fuzzyFilter = createFuzzyFilter<DailyTracking>();

export const dailyTrackingColumns: ColumnDef<DailyTracking>[] = [
  {
    accessorKey: "NUM_REFE",
    header: "Referencia",
    meta: {
      label: "Referencia",
    },
    filterFn: fuzzyFilter,
    cell: ({ row }) => <DailyTrackingModifyStatus row={row} />,
  },
  {
    accessorKey: "CLIENT_NAME",
    header: "Cliente",
    meta: {
      label: "Cliente",
    },
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <HoverPopover
        text={row.original.CLIENT_NAME}
        className="text-center truncate overflow-hidden whitespace-nowrap"
        maxWidthClass="max-w-[150px]"
      />
    ),
  },
  {
    accessorKey: "ENTRY_DATE",
    meta: {
      label: "Fecha de Entrada",
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted(); // "asc" | "desc" | false

      const Icon =
        isSorted === "asc"
          ? ArrowUp
          : isSorted === "desc"
          ? ArrowDown
          : ArrowUpDown;
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(isSorted === "asc");
          }}
        >
          Fecha de Entrada
          <Icon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.ENTRY_DATE_FORMATTED || "--"}</p>
    ),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "MSA",
    meta: {
      label: "MSA",
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted(); // "asc" | "desc" | false

      const Icon =
        isSorted === "asc"
          ? ArrowUp
          : isSorted === "desc"
          ? ArrowDown
          : ArrowUpDown;
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(isSorted === "asc");
          }}
        >
          MSA
          <Icon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.MSA_FORMATTED || "--"}</p>
    ),
  },
  {
    accessorKey: "ULT_DOC_114_FORMATTED",
    meta: {
      label: "Último Documento",
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted(); // "asc" | "desc" | false

      const Icon =
        isSorted === "asc"
          ? ArrowUp
          : isSorted === "desc"
          ? ArrowDown
          : ArrowUpDown;
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(isSorted === "asc");
          }}
        >
          Último Documento
          <Icon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">
        {row.original.ULT_DOC_114_FORMATTED || "--"}
      </p>
    ),
  },
  {
    accessorKey: "PROVIDER",
    header: "Proveedor",
    meta: {
      label: "Proveedor",
    },
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <HoverPopover
        text={row.original.PROVIDER}
        className="text-center truncate overflow-hidden whitespace-nowrap"
        maxWidthClass="max-w-[200px]"
      />
    ),
  },
  {
    accessorKey: "CUSTOM_CLEARANCE_DAYS",
    meta: {
      label: "Días de Despacho",
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted(); // "asc" | "desc" | false

      const Icon =
        isSorted === "asc"
          ? ArrowUp
          : isSorted === "desc"
          ? ArrowDown
          : ArrowUpDown;
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(isSorted === "asc");
          }}
        >
          Días de Despacho
          <Icon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
    meta: {
      label: "Etapa Actual",
    },
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <HoverPopover
        text={row.original.CURRENT_PHASE}
        className="text-center truncate overflow-hidden whitespace-nowrap"
        maxWidthClass="max-w-[200px]"
      />
    ),
  },
  {
    accessorKey: "CUSTOM_FORMATTED",
    meta: {
      label: "Aduana",
    },
    header: "Aduana",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">{row.original.CUSTOM_FORMATTED || "--"}</p>
    ),
  },
  {
    accessorKey: "KAM_FORMATTED",
    header: "Ejecutivo",
    meta: {
      label: "Ejecutivo",
    },
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <HoverPopover
        text={row.original.KAM}
        className="text-center truncate overflow-hidden whitespace-nowrap"
        maxWidthClass="max-w-[150px]"
      />
    ),
  },
  {
    accessorKey: "STATUS",
    meta: {
      label: "Estatus",
    },
    header: "Estatus",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <HoverPopover
        text={row.original.STATUS}
        className="text-xs text-justify whitespace-normal break-words line-clamp-3"
        maxWidthClass="max-w-[350px]"
        contentClassName="text-xs"
      />
    ),
  },
  {
    accessorKey: "MODIFIED_AT_FORMATTED",
    meta: {
      label: "Modificado en",
    },
    header: "Modificado en",
    filterFn: fuzzyFilter,
    cell: ({ row }) => (
      <p className="text-center">
        {row.original.MODIFIED_AT_FORMATTED || "--"}
      </p>
    ),
  },
];
