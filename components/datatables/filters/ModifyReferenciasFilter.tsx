import { Input } from '@/components/ui/input';
import { TransbelRef } from '@/types/transbel/TransbelRef';
import { Column } from '@tanstack/react-table';

export default function ModifyReferenciasFilter({
  column,
}: {
  column: Column<TransbelRef, unknown>;
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
