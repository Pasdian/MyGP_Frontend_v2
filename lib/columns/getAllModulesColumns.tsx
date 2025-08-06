import { ColumnDef, Row } from "@tanstack/react-table";
import React from "react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { getAllModules } from "@/types/getAllModules/getAllModules";

const fuzzyFilter = createFuzzyFilter<getAllModules>();

export function getAllModulesColumns(
  Actions: React.ComponentType<{ row: Row<getAllModules> }>
): ColumnDef<getAllModules>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.name) return "--";
        return row.original.name;
      },
    },
    {
      accessorKey: "description",
      header: "Descripción",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.description) return "--";
        return row.original.description;
      },
    },
    {
      accessorKey: "alias",
      header: "Alias",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.alias) return "--";
        return row.original.alias;
      },
    },
    {
      accessorKey: "ACCIONES",
      header: "Acciones",
      cell: ({ row }) => {
        return <Actions row={row} />;
      },
    },
  ];
}
