"use client";

import { getAllUsers } from "@/types/users/getAllUsers";
import { ColumnDef, Row } from "@tanstack/react-table";
import React from "react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";

const fuzzyFilter = createFuzzyFilter<getAllUsers>();

export function getAllUsersColumns(
  Actions: React.ComponentType<{ row: Row<getAllUsers> }>
): ColumnDef<getAllUsers>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: "email",
      header: "Email",
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: "user_mobile",
      header: "Teléfono",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.mobile) {
          return "--";
        }
        return row.original.mobile;
      },
    },
    {
      accessorKey: "role_description",
      header: "Rol",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.role.description) {
          return "--";
        }
        return row.original.role.description;
      },
    },
    {
      accessorKey: "company_name",
      header: "Compañia",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.company?.name) {
          return "--";
        }
        return row.original.company.name;
      },
    },
    {
      accessorKey: "casa_user_name",
      header: "Nombre de Usuario CASA",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.casa_user_name) {
          return "--";
        }
        return row.original.casa_user_name;
      },
    },
    {
      accessorKey: "status",
      header: "Estatus",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.status) return "--";
        return row.original.status;
      },
    },
    {
      accessorKey: "ACCIONES",
      header: "Acciones",
      cell: ({ row }) => {
        if (!row) return "--";
        return <Actions row={row} />;
      },
    },
  ];
}
