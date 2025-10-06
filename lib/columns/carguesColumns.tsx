import { ColumnDef } from "@tanstack/react-table";

import React from "react";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { getCarguesFormat } from "@/types/transbel/getCargues";

const fuzzyFilter = createFuzzyFilter<getCarguesFormat>();

export const carguesColumns: ColumnDef<getCarguesFormat>[] = [
  {
    accessorKey: "NUM_REFE",
    header: "Referencia",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.NUM_REFE) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe un número de referencia"
          />
        );
      }

      return <p className="text-center">{row.original.NUM_REFE}</p>;
    },
  },
  {
    accessorKey: "NUM_PEDI",
    header: "Número de Pedimento",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.NUM_PEDI) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe un número de pedimento"
          />
        );
      }

      return <p className="text-center">{row.original.NUM_PEDI}</p>;
    },
  },
  {
    accessorKey: "NUM_TRAFICO",
    header: "Folio EE/GE",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.NUM_TRAFICO) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe un número de tráfico"
          />
        );
      }

      return <p className="text-center">{row.original.NUM_TRAFICO}</p>;
    },
  },
  {
    accessorKey: "FEC_PAGO_FORMATTED",
    header: "Fecha de Pago",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.FEC_PAGO) {
        return (
          <ErrorTooltip value="--" errorMessage="No existe una fecha de pago" />
        );
      }

      return <p className="text-center">{row.original.FEC_PAGO_FORMATTED}</p>;
    },
  },
  {
    accessorKey: "FEC_ENVIO_FORMATTED",
    header: "Fecha de Envío",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.FEC_ENVIO) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe una fecha de envío"
          />
        );
      }

      return <p className="text-center">{row.original.FEC_ENVIO_FORMATTED}</p>;
    },
  },
];
