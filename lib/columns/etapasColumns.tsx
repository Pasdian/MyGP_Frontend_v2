import { ColumnDef } from "@tanstack/react-table";

import React from "react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { Phase } from "@/types/casa/Phase";
import { ModifyEtapa } from "@/components/datatables/transbel/ModifyEtapa";

const fuzzyFilter = createFuzzyFilter<Phase>();

export const etapasColumns: ColumnDef<Phase>[] = [
  {
    id: "actions",
    header: () => <div className="text-center w-full">Acciones</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <ModifyEtapa
            CVE_ETAP={row.original.CVE_ETAP || ""}
            FEC_ETAP={row.original.FEC_ETAP || ""}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "NUM_REFE",
    header: () => <div className="text-center w-full">Referencia</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.NUM_REFE) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.NUM_REFE}</p>;
    },
  },
  {
    accessorKey: "CVE_ETAP",
    header: () => <div className="text-center w-full">Etapa</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.CVE_ETAP) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.CVE_ETAP}</p>;
    },
  },
  {
    accessorKey: "OBS_ETAP",
    header: () => <div className="text-center w-full">Observaciones</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.OBS_ETAP) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.OBS_ETAP}</p>;
    },
  },
  {
    accessorKey: "FEC_ETAP",
    header: () => <div className="text-center w-full">Fecha</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      const FEC_ETAP = row.original.FEC_ETAP;
      if (!FEC_ETAP) {
        return <div className="text-center w-full">---</div>;
      }
      const formatted = new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "America/Mexico_City",
      }).format(new Date(FEC_ETAP));
      return <p className="text-center">{formatted}</p>;
    },
  },
  {
    accessorKey: "CVE_MODI",
    header: () => <div className="text-center w-full">Modificado por</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.CVE_MODI) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.CVE_MODI}</p>;
    },
  },
];
