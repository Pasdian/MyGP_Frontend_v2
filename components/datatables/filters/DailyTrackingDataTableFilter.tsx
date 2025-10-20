import { Input } from '@/components/ui/input';
import { DailyTrackingFormatted } from '@/types/dashboard/tracking/dailyTracking';
import { Column } from '@tanstack/react-table';

export default function DailyTrackingDataTableFilter({
  column,
}: {
  column: Column<DailyTrackingFormatted, unknown>;
}) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Buscar...`}
      className={column.id == 'ACCIONES' ? 'hidden' : 'mb-2 rounded'}
    />
  );
}
