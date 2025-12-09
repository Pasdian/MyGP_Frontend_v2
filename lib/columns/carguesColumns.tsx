import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { getCargues } from "@/types/transbel/getCargues";
import { CarguesContext } from "@/contexts/CarguesContext";

const fuzzyFilter = createFuzzyFilter<getCargues>();
type TabValue = "errors" | "pending" | "sent";

export const useCarguesColumns = (): ColumnDef<getCargues>[] => {
  const { tabValue } = React.useContext(CarguesContext) as {
    tabValue: TabValue;
  };

  const baseCols = React.useMemo<ColumnDef<getCargues>[]>(
    () => [
      {
        accessorKey: "NUM_REFE",
        header: "Referencia",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.NUM_REFE ? (
            <p className="text-center">{row.original.NUM_REFE}</p>
          ) : (
            <ErrorTooltip
              value="--"
              errorMessage="No existe un número de referencia"
            />
          ),
      },
      {
        accessorKey: "NUM_PEDI",
        header: "Número de Pedimento",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.NUM_PEDI ? (
            <p className="text-center">{row.original.NUM_PEDI}</p>
          ) : (
            <ErrorTooltip
              value="--"
              errorMessage="No existe un número de pedimento"
            />
          ),
      },
      {
        accessorKey: "NUM_TRAFICO",
        header: "Folio EE/GE",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.NUM_TRAFICO ? (
            <p className="text-center">{row.original.NUM_TRAFICO}</p>
          ) : (
            <ErrorTooltip
              value="--"
              errorMessage="No existe un número de tráfico"
            />
          ),
      },
      {
        accessorKey: "FEC_PAGO_FORMATTED",
        header: "Fecha de Pago",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.FEC_PAGO ? (
            <p className="text-center">{row.original.FEC_PAGO_FORMATTED}</p>
          ) : (
            <ErrorTooltip
              value="--"
              errorMessage="No existe una fecha de pago"
            />
          ),
      },
      {
        accessorKey: "FEC_ENVIO_FORMATTED",
        header: "Fecha de Envío",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.FEC_ENVIO ? (
            <p className="text-center">{row.original.FEC_ENVIO_FORMATTED}</p>
          ) : (
            <ErrorTooltip
              value="--"
              errorMessage="No existe una fecha de envío"
            />
          ),
      },
    ],
    []
  );

  return baseCols;
};
