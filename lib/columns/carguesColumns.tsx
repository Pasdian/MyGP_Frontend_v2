import { ColumnDef } from "@tanstack/react-table";

import React from "react";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { getCargues } from "@/types/transbel/getCargues";
import { CarguesContext } from "@/contexts/CarguesContext";
import ModifyCargue from "@/components/buttons/cargues/ModifyCargue";

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
              <ErrorTooltip
                value="--"
                errorMessage="No existe una fecha de pago"
              />
            );
          }

          return (
            <p className="text-center">{row.original.FEC_PAGO_FORMATTED}</p>
          );
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

          return (
            <p className="text-center">{row.original.FEC_ENVIO_FORMATTED}</p>
          );
        },
      },
    ],
    []
  );

  const accionesCol: ColumnDef<getCargues> = React.useMemo(
    () => ({
      id: "ACCIONES",
      header: "Acciones",
      cell: ({ row }) => <ModifyCargue row={row} />,
    }),
    []
  );

  // Show ACCIONES only on 'errors'
  return React.useMemo(() => {
    if (tabValue === "pending") return [accionesCol, ...baseCols];
    return baseCols; // pending/sent → hidden
  }, [tabValue, baseCols, accionesCol]);
};
