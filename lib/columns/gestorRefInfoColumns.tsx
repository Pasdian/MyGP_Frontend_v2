import { GestorRefInfo } from "@/types/gestor/GestorRefInfo";
import { ColumnDef } from "@tanstack/react-table";

const Header = ({ label }: { label: string }) => (
  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
    {label}
  </span>
);

export const gestorRefInfoColumns: ColumnDef<GestorRefInfo>[] = [
  {
    accessorKey: "CVE_IMPO",
    header: () => <Header label="Núm. Cliente" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("CVE_IMPO");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "NOM_IMP",
    header: () => <Header label="Nombre del Cliente" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("NOM_IMP");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "NUM_PEDI",
    header: () => <Header label="Núm. Pedimento" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("NUM_PEDI");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "FEC_ENTR_FORMATTED",
    header: () => <Header label="Fecha de Entrada" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("FEC_ENTR_FORMATTED");
      return value && value.trim() !== "" ? value : "--";
    },
  },
];
