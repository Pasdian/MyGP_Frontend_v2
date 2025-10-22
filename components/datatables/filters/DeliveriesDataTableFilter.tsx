import { Input } from '@/components/ui/input';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { Column } from '@tanstack/react-table';

export default function DeliveriesDataTableFilter({
  column,
}: // table, // Debug purposes
{
  column: Column<getDeliveries, unknown>;
  // table: TTable<Deliveries>;
}) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => {
        column.setFilterValue(e.target.value);
      }}
      placeholder={`Buscar...`}
      className={column.id == 'ACCIONES' ? 'hidden' : 'mb-4 rounded'}
    />
  );
}
