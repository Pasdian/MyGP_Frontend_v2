import AdminPanelDeleteUserButton from "@/components/buttons/user/AdminPanelDeleteUserButton";
import AdminPanelModifyUserButton from "@/components/buttons/user/AdminPanelModifyUserButton";
import { getAllUsers } from "@/types/users/getAllUsers";
import { ColumnDef } from "@tanstack/react-table";
import { usersDataTableFuzzyFilter } from "../utilityFunctions/fuzzyFilters/usersDataTableFuzzyFilter";

export const usersColumns: ColumnDef<getAllUsers>[] = [
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <div className="flex">
          <div className="mr-3">
            <AdminPanelModifyUserButton row={row} />
          </div>
          <AdminPanelDeleteUserButton row={row} />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
    filterFn: usersDataTableFuzzyFilter,
  },
  {
    accessorKey: "email",
    header: "Email",
    filterFn: usersDataTableFuzzyFilter,
  },
  {
    accessorKey: "mobile",
    header: "Teléfono",
    filterFn: usersDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.mobile) {
        return "--";
      }
      return row.original.mobile;
    },
  },
  {
    accessorKey: "casa_user_name",
    header: "Nombre de Usuario CASA",
    filterFn: usersDataTableFuzzyFilter,
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
    filterFn: usersDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.status) return "--";
      if (row.original.status == "active") {
        return "Activo";
      } else {
        return "Inactivo";
      }
    },
  },
];
