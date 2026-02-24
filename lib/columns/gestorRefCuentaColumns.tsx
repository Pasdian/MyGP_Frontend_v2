import GestorCuentaDialog from "@/components/gestor/GestorCuentaDialog";
import { GestorCuenta } from "@/types/gestor/GestorCuenta";
import { ColumnDef } from "@tanstack/react-table";

const Header = ({ label }: { label: string }) => (
  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
    {label}
  </span>
);

export const gestorRefCuentaColumns: ColumnDef<GestorCuenta>[] = [
  {
    accessorKey: "Acciones",
    header: () => <Header label="Acciones" />,
    cell: ({ row }) => {
      return <GestorCuentaDialog row={row} />
    },
  },
  {
    accessorKey: "Clave",
    header: () => <Header label="Clave" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("Clave");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "Importe",
    header: () => <Header label="Importe" />,
    cell: ({ row }) => {
      const value = row.getValue<number>("Importe");
      return value !== null && value !== undefined
        ? value.toLocaleString("es-MX", { minimumFractionDigits: 2 })
        : "--";
    },
  },
  {
    accessorKey: "Factura",
    header: () => <Header label="Factura" />,
  },
  {
    accessorKey: "Financ.",
    header: () => <Header label="Financ." />,
  },
  {
    accessorKey: "Pago AA",
    header: () => <Header label="Pago AA" />,
  },
  {
    accessorKey: "Descripción",
    header: () => <Header label="Descripción" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("Descripción");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "Sufijo",
    header: () => <Header label="Sufijo" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("Sufijo");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "Beneficiario",
    header: () => <Header label="Beneficiario" />,
  },
  {
    accessorKey: "Nombre",
    header: () => <Header label="Nombre" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("Nombre");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "GTOS_X_PC",
    header: () => <Header label="Gtos. x P/C" />,
    cell: ({ row }) => {
      const value = row.getValue<string | null>("GTOS_X_PC");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "UUID Factura",
    header: () => <Header label="UUID Factura" />,
  },
];