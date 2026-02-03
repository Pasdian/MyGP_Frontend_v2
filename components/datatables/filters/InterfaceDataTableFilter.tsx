import { Input } from '@/components/ui/input';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { Column } from '@tanstack/react-table';

export default function IntefaceDataTableFilter({
  column,
}: {
  column: Column<getRefsPendingCE, unknown>;
}) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => {
        column.setFilterValue(e.target.value);
      }}
      placeholder={`Buscar...`}
      className={column.id == 'ACCIONES' ? 'hidden' : 'mb-2 rounded'}
    />
  );
}
