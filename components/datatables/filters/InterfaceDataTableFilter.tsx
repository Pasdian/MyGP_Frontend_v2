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
      type={
        column.id == 'ENTREGA_TRANSPORTE_138' ||
        column.id == 'MSA_130' ||
        column.id == 'REVALIDACION_073' ||
        column.id == 'ULTIMO_DOCUMENTO_114'
          ? 'date'
          : 'text'
      }
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Buscar...`}
      className={column.id == 'ACCIONES' ? 'hidden' : 'mb-2 rounded'}
    />
  );
}
