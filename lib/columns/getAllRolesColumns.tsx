import { ColumnDef, Row } from "@tanstack/react-table";
import React from "react";
import { getAllRoles } from "@/types/roles/getAllRoles";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";

const fuzzyFilter = createFuzzyFilter<getAllRoles>();

export function getAllRolesColumns(
  Actions: React.ComponentType<{ row: Row<getAllRoles> }>
): ColumnDef<getAllRoles>[] {
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
      accessorKey: "ACCIONES",
      header: "Acciones",
      cell: ({ row }) => {
        return <Actions row={row} />;
      },
    },
  ];
}
