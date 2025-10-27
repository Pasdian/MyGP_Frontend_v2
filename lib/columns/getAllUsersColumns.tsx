"use client";

import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteUserButton from "@/components/buttons/admin-panel/users/DeleteUserButton";
import ModifyUserButton from "@/components/buttons/admin-panel/users/ModifyUserButton";
import { getAllUsers } from "@/types/users/getAllUsers";
import { ColumnDef, Row } from "@tanstack/react-table";
import React from "react";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import CompanyListCell from "@/components/table/CompanyListCell";
import { MyGPButtonPrimary } from "@/components/MyGPUI/Buttons/MyGPButtonPrimary";

const fuzzyFilter = createFuzzyFilter<getAllUsers>();

export const getAllUsersColumns: ColumnDef<getAllUsers>[] = [
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
    cell: ({ row }) => <UserActionsDropdown row={row} />,
  },
];

function UserActionsDropdown({ row }: { row: Row<getAllUsers> }) {
  const [isModifyUserDialogOpen, setIsModifyUserDialogOpen] =
    React.useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] =
    React.useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MyGPButtonPrimary className="h-8 w-8 p-0">
            <span className="sr-only">Abrir Menú</span>
            <MoreHorizontal />
          </MyGPButtonPrimary>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <ModifyUserButton
              open={isModifyUserDialogOpen}
              setIsOpen={setIsModifyUserDialogOpen}
              row={row}
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="bg-red-400 focus:bg-red-500 focus:text-white text-white"
            asChild
          >
            <DeleteUserButton
              open={isDeleteUserDialogOpen}
              setIsOpen={setIsDeleteUserDialogOpen}
              row={row}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
