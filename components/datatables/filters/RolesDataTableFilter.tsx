import { Input } from '@/components/ui/input';
import { getRoles } from '@/types/roles/getRoles';
import { Column } from '@tanstack/react-table';

export default function RolesDataTableFilter({
  column,
}: // table, // Debug purposes
{
  column: Column<getRoles, unknown>;
  // table: TTable<Deliveries>;
}) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      type={column.id == 'ACCIONES' ? '' : 'text'}
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => {
        column.setFilterValue(e.target.value);
      }}
      placeholder={`Buscar...`}
      className={column.id == 'ACCIONES' ? 'hidden' : 'mb-4 rounded'}
    />
  );
}
