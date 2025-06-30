import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRefsPendingCE } from "@/types/transbel/getRefsPendingCE";
import { diffInDays } from "../utilityFunctions/diffInDays";
import InterfaceUpsertPhaseButton from "@/components/buttons/upsertPhase/InterfaceUpsertPhaseButton";

const getFormattedDate = (d: string | undefined) => {
  if (!d) return;
  const date = d.split(" ")[0];
  const splittedDate = date.split("-");

  const day = splittedDate[2];
  const month = splittedDate[1];
  const year = splittedDate[0];
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};

export const usersColumns: ColumnDef<getAllUsers>[] = [
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
  },
  {
    accessorKey: "id",
    header: "ID",
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
  },
  {
    accessorKey: "status",
    header: "Estatus",
  },
];
