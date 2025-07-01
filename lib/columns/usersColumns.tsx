import AdminPanelModifyUserButton from "@/components/buttons/user/AdminPanelModifyUserButton";
import { getAllUsers } from "@/types/users/getAllUsers";
import { ColumnDef } from "@tanstack/react-table";

export const usersColumns: ColumnDef<getAllUsers>[] = [
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      return <AdminPanelModifyUserButton row={row} />;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "mobile",
    header: "Teléfono",
    cell: ({ row }) => {
      if (!row.original.mobile) {
        return "--";
      }
      return row.original.mobile;
    },
  },
  {
    accessorKey: "casa_username",
    header: "Nombre de Usuario CASA",
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
