import { Gasto } from "@/types/operaciones/gastos/Gasto";
import { ColumnDef } from "@tanstack/react-table";

const Header = ({ label }: { label: string }) => (
  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
    {label}
  </span>
);

export const operacionesGastosColumns: ColumnDef<Gasto>[] = [
  {
    accessorKey: "CONCEPTO",
    header: () => <Header label="Concepto" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("CONCEPTO");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "BENEFICIARIO",
    header: () => <Header label="Beneficiario" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("BENEFICIARIO");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "FACTURA",
    header: () => <Header label="Factura" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("FACTURA");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "FECHA_FACTURA_FORMATTED",
    header: () => <Header label="Fecha Factura" />,
    cell: ({ row }) => {
      const value = row.getValue<string>("FECHA_FACTURA_FORMATTED");
      return value && value.trim() !== "" ? value : "--";
    },
  },
  {
    accessorKey: "MONTO",
    header: () => <Header label="Monto" />,
    cell: ({ row }) => {
      const value = row.getValue<number>("MONTO");

      return value !== undefined && value !== null
        ? value.toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
        })
        : "--";
    },
  },
];
