import { ColumnDef } from "@tanstack/react-table";

import React from "react";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { getCargues } from "@/types/transbel/getCargues";
import { getFormattedDate } from "../utilityFunctions/getFormattedDate";

const fuzzyFilter = createFuzzyFilter<getCargues>();

export const carguesColumns: ColumnDef<getCargues>[] = [
  {
    accessorKey: "REFERENCIA",
    header: "Referencia",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.REFERENCIA) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe un número de referencia"
          />
        );
      }

      return <p className="text-center">{row.original.REFERENCIA}</p>;
    },
  },
  {
    accessorKey: "NUM_PEDIMENTO",
    header: "Número de Pedimento",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.NUM_PEDIMENTO) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe un número de pedimento"
          />
        );
      }

      return <p className="text-center">{row.original.NUM_PEDIMENTO}</p>;
    },
  },
  {
    accessorKey: "NUM_TRAFICO",
    header: "Número de Tráfico",
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
    accessorKey: "FEC_PAGO",
    header: "Fecha de Pago",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.FEC_PAGO) {
        return (
          <ErrorTooltip value="--" errorMessage="No existe una fecha de pago" />
        );
      }

      return (
        <p className="text-center">{getFormattedDate(row.original.FEC_PAGO)}</p>
      );
    },
  },
  {
    accessorKey: "FEC_ENVIO",
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

      return (
        <p className="text-center">
          {getFormattedDate(row.original.FEC_ENVIO)}
        </p>
      );
    },
  },
];
