import { Input } from '@/components/ui/input';
import { TransbelApiLog } from '@/types/transbel/TransbelApiLog';
import { Column } from '@tanstack/react-table';

export default function TransbelApiLogFilter({
  column,
}: // table, // Debug purposes
{
  column: Column<TransbelApiLog, unknown>;
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
      className={column.id == 'created_at' || column.id == 'updated_at' ? 'hidden' : 'mb-4 rounded'}
    />
  );
}
