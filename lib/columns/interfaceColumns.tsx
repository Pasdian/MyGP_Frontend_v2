import { ColumnDef } from "@tanstack/react-table";
import InterfaceUpsertPhaseButton from "@/components/buttons/upsertPhase/InterfaceUpsertPhaseButton";
import React from "react";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { getRefsPendingCEFormat } from "@/types/transbel/getRefsPendingCE";
import { InterfaceContext } from "@/contexts/InterfaceContext";

const fuzzyFilter = createFuzzyFilter<getRefsPendingCEFormat>();
type TabValue = "errors" | "pending" | "sent";

export const useInterfaceColumns = (): ColumnDef<getRefsPendingCEFormat>[] => {
  const { tabValue } = React.useContext(InterfaceContext) as {
    tabValue: TabValue;
  };

  const baseCols = React.useMemo<ColumnDef<getRefsPendingCEFormat>[]>(
    () => [
      {
        accessorKey: "REFERENCIA",
        header: "Referencia",
        filterFn: fuzzyFilter,
        cell: ({ row }) => {
          if (row.original.CE_138) {
            return (
              <p className="text-center">{row.original.REFERENCIA || "--"}</p>
            );
          }
          if (row.original.has_business_days_error) {
            return (
              <ErrorTooltip
                value={row.original.REFERENCIA || "--"}
                errorMessage={
                  row.original.BUSINESS_DAYS_ERROR_MSG || "Error desconocido"
                }
              />
            );
          }
          return (
            <p className="text-center">{row.original.REFERENCIA || "--"}</p>
          );
        },
      },
      {
        accessorKey: "EE__GE",
        header: "EE/GE",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.EE__GE ? (
            <p className="text-center">{row.original.EE__GE}</p>
          ) : (
            <ErrorTooltip value="--" errorMessage="No existe EE/GE" />
          ),
      },
      {
        accessorKey: "REVALIDACION_073_FORMATTED",
        header: "Revalidación",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.has_revalidacion_error ? (
            <ErrorTooltip
              value={row.original.REVALIDACION_073_FORMATTED || "--"}
              errorMessage={
                row.original.REVALIDACION_073_ERROR_MSG || "Error desconocido"
              }
            />
          ) : (
            <p className="text-center">
              {row.original.REVALIDACION_073_FORMATTED || "--"}
            </p>
          ),
      },
      {
        accessorKey: "ULTIMO_DOCUMENTO_114_FORMATTED",
        header: "Último Documento",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.has_ultimo_documento_error ? (
            <ErrorTooltip
              value={row.original.ULTIMO_DOCUMENTO_114_FORMATTED || "--"}
              errorMessage={
                row.original.ULTIMO_DOCUMENTO_114_ERROR_MSG ||
                "Error desconocido"
              }
            />
          ) : (
            <p className="text-center">
              {row.original.ULTIMO_DOCUMENTO_114_FORMATTED || "--"}
            </p>
          ),
      },
      {
        accessorKey: "MSA_130_FORMATTED",
        header: "MSA",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.has_msa_error ? (
            <ErrorTooltip
              value={row.original.MSA_130_FORMATTED || "--"}
              errorMessage={
                row.original.MSA_130_ERROR_MSG || "Error desconocido"
              }
            />
          ) : (
            <p className="text-center">
              {row.original.MSA_130_FORMATTED || "--"}
            </p>
          ),
      },
      {
        accessorKey: "ENTREGA_TRANSPORTE_138_FORMATTED",
        header: "Entrega Transporte",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.has_entrega_transporte_error ? (
            <ErrorTooltip
              value={row.original.ENTREGA_TRANSPORTE_138_FORMATTED || "--"}
              errorMessage={
                row.original.ENTREGA_TRANSPORTE_138_ERROR_MSG ||
                "Error desconocido"
              }
            />
          ) : (
            <p className="text-center">
              {row.original.ENTREGA_TRANSPORTE_138_FORMATTED || "--"}
            </p>
          ),
      },
      {
        accessorKey: "ENTREGA_CDP_140_FORMATTED",
        header: "Entrega a CDP",
        filterFn: fuzzyFilter,
        cell: ({ row }) =>
          row.original.has_entrega_cdp_error ? (
            <ErrorTooltip
              value={row.original.ENTREGA_CDP_140_FORMATTED || "--"}
              errorMessage={
                row.original.ENTREGA_CDP_140_ERROR_MSG || "Error desconocido"
              }
            />
          ) : (
            <p className="text-center">
              {row.original.ENTREGA_CDP_140_FORMATTED || "--"}
            </p>
          ),
      },
      {
        accessorKey: "CE_138",
        header: "CE 138",
        filterFn: fuzzyFilter,
        cell: ({ row }) => (
          <p className="text-center">{row.original.CE_138 || "--"}</p>
        ),
      },
      {
        accessorKey: "CE_140",
        header: "CE 140",
        filterFn: fuzzyFilter,
        cell: ({ row }) => (
          <p className="text-center">{row.original.CE_140 || "--"}</p>
        ),
      },
      {
        accessorKey: "workato_last_modified_FORMATTED",
        header: "Fecha Último Envio",
        cell: ({ row }) => (
          <p className="text-center">
            {row.original.workato_created_at_FORMATTED || "--"}
          </p>
        ),
      },
    ],
    []
  );

  const accionesCol: ColumnDef<getRefsPendingCEFormat> = React.useMemo(
    () => ({
      id: "ACCIONES",
      header: "Acciones",
      cell: ({ row }) => <InterfaceUpsertPhaseButton row={row} />,
    }),
    []
  );

  // Show ACCIONES only on 'errors'
  return React.useMemo(() => {
    if (tabValue === "errors") return [accionesCol, ...baseCols];
    return baseCols; // pending/sent → hidden
  }, [tabValue, baseCols, accionesCol]);
};
