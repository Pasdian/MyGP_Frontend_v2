import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getRoles } from "@/types/roles/getRoles";
import AdminPanelModifyRoleButton from "@/components/buttons/admin-panel/AdminPanelModifyRoleButton";
import { rolesDataTableFuzzyFilter } from "../utilityFunctions/fuzzyFilters/rolesDataTableFuzzyFilter";

export const rolesColumns: ColumnDef<getRoles>[] = [
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      return <AdminPanelModifyRoleButton row={row} />;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
    filterFn: rolesDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.name) return "--";
      return row.original.name;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    filterFn: rolesDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.description) return "--";
      return row.original.description;
    },
  },
];
