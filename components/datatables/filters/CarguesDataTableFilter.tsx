import { Input } from '@/components/ui/input';
import { getCargues } from '@/types/transbel/getCargues';
import { Column } from '@tanstack/react-table';

export default function CarguesDataTableFilter({
  column,
}: {
  column: Column<getCargues, unknown>;
}) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Buscar...`}
    />
  );
}
