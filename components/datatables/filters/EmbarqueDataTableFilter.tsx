import { Input } from '@/components/ui/input';
import { Embarque } from '@/types/transbel/Embarque';
import { Column } from '@tanstack/react-table';

export default function EmbarqueDataTableFilter({ column }: { column: Column<Embarque, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Buscar...`}
    />
  );
}
