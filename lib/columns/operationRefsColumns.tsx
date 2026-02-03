import { ColumnDef } from "@tanstack/react-table";

import React from "react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { TransbelRef } from "@/types/transbel/TransbelRef";
import { MyGPButtonWarning } from "@/components/MyGPUI/Buttons/MyGPButtonWarning";
import { useRouter } from "next/navigation";
import { IconPencil } from "@tabler/icons-react";

const fuzzyFilter = createFuzzyFilter<TransbelRef>();

export const operationRefsColumns: ColumnDef<TransbelRef>[] = [
  {
    accessorKey: "NUM_REFE",
    header: "Referencia",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.NUM_REFE) {
        return <div className="flex justify-center w-full">---</div>;
      }

      return (
        <RefRedirect
          NUM_REFE={row.original.NUM_REFE || ""}
          ADU_DESP={row.original.ADU_DESP || ""}
          PAT_AGEN={row.original.PAT_AGEN || ""}
        />
      );
    },
  },
  {
    accessorKey: "NOM_IMP",
    header: "Compañia",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.NOM_IMP) {
        return <div className="flex justify-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.NOM_IMP}</p>;
    },
  },
  {
    accessorKey: "ADU_DESP_FORMATTED",
    header: "Aduana",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.ADU_DESP) {
        return <div className="flex justify-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.ADU_DESP_FORMATTED}</p>;
    },
  },
  {
    accessorKey: "PAT_AGEN",
    header: "Patente",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.PAT_AGEN) {
        return <div className="flex justify-center w-full">---</div>;
      }

      return <p className="text-center">{row.original.PAT_AGEN}</p>;
    },
  },
  {
    accessorKey: "FEC_ENTR_FORMATTED",
    header: "Fecha de Entrega",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      const FEC_ENTR = row.original.FEC_ENTR_FORMATTED;
      if (!FEC_ENTR) {
        return <div className="flex justify-center w-full">---</div>;
      }

      return <p className="text-center">{FEC_ENTR}</p>;
    },
  },
  {
    accessorKey: "FEC_PAGO_FORMATTED",
    header: "Fecha de Entrega",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      const FEC_PAGO = row.original.FEC_PAGO_FORMATTED;
      if (!FEC_PAGO) {
        return <div className="flex justify-center w-full">---</div>;
      }
      return <p className="text-center">{FEC_PAGO}</p>;
    },
  },
  {
    accessorKey: "CURRENT_PHASE_CODE",
    header: "Código Etapa",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.CURRENT_PHASE_CODE) {
        return <div className="flex justify-center w-full">---</div>;
      }

      return <p className="text-center">{row.original.CURRENT_PHASE_CODE}</p>;
    },
  },
  {
    accessorKey: "CURRENT_PHASE",
    header: "Etapa Actual",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.CURRENT_PHASE) {
        return <div className="flex justify-center w-full">---</div>;
      }

      return <p className="text-center">{row.original.CURRENT_PHASE}</p>;
    },
  },
  {
    accessorKey: "KAM",
    header: "Ejecutivo",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.KAM) {
        return <div className="flex justify-center w-full">---</div>;
      }
      const kamName = row.original.KAM.split(" ");

      return (
        <p className="text-center">
          {kamName[0]} {kamName[1]} {kamName[3]}
        </p>
      );
    },
  },
];

function RefRedirect({
  NUM_REFE,
  ADU_DESP,
  PAT_AGEN,
}: {
  NUM_REFE: string;
  ADU_DESP: string;
  PAT_AGEN: string;
}) {
  const router = useRouter();
  return (
    <MyGPButtonWarning
      className="w-32"
      onClick={() =>
        router.push(
          `/mygp/operaciones/etapas/${NUM_REFE}?ADU_DESP=${ADU_DESP}&PAT_AGEN=${PAT_AGEN}`,
        )
      }
    >
      <IconPencil />
      <p className="text-center">{NUM_REFE}</p>
    </MyGPButtonWarning>
  );
}
