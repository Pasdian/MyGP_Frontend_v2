import { Column } from '@tanstack/react-table';
import { Input } from '@/components/ui/input'; // Adjust the import path

type AdminDataTableFilterProps<TData> = {
  column: Column<TData, unknown>;
  // table?: TTable<TData>; // Uncomment if needed
};

export default function AdminDataTableFilter<TData>({ column }: AdminDataTableFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      type={column.id === 'ACCIONES' ? '' : 'text'}
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder="Buscar..."
      className={column.id === 'ACCIONES' ? 'hidden' : 'mb-4 rounded'}
    />
  );
}
