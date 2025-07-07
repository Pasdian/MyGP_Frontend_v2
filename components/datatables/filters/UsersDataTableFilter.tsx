import { Input } from '@/components/ui/input';
import { getAllUsersDeepCopy } from '@/types/users/getAllUsers';
import { Column } from '@tanstack/react-table';

export default function UsersDataTableFilter({
  column,
}: // table, // Debug purposes
{
  column: Column<getAllUsersDeepCopy, unknown>;
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
