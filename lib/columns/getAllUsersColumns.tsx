"use client";

import { getAllUsers } from "@/types/users/getAllUsers";
import { ColumnDef, Row } from "@tanstack/react-table";
import React from "react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import CompanyListCell from "@/components/table/CompanyListCell";

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
      cell: ({ row }) => row.original.mobile ?? "--",
    },
    {
      accessorKey: "role_description",
      header: "Rol",
      filterFn: fuzzyFilter,
      cell: ({ row }) => row.original.role.description ?? "--",
    },

    {
      id: "companies",
      header: "Compañías",
      // Provide filter text for fuzzyFilter (joined names)
      accessorFn: (row) =>
        row.companies
          ?.map((c) => c?.NOM_IMP ?? "")
          .filter(Boolean)
          .join(", ") ?? "",
      filterFn: fuzzyFilter,
      // Fixed width + ellipsis
      meta: {
        headerClassName: "w-64", // header width
        cellClassName:
          "w-64 max-w-64 whitespace-nowrap overflow-hidden text-ellipsis",
      },
      cell: ({ row }) => (
        <CompanyListCell companies={row.original.companies ?? null} />
      ),
    },

    {
      accessorKey: "casa_user_name",
      header: "Nombre de Usuario CASA",
      filterFn: fuzzyFilter,
      cell: ({ row }) => row.original.casa_user_name ?? "--",
    },
    {
      accessorKey: "status",
      header: "Estatus",
      filterFn: fuzzyFilter,
      cell: ({ row }) => row.original.status ?? "--",
    },
    {
      accessorKey: "ACCIONES",
      header: "Acciones",
      cell: ({ row }) => <Actions row={row} />,
    },
  ];
}
