import { Button } from '@/components/ui/button';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { Table } from '@tanstack/react-table';

export default function TablePagination({
  table,
}: {
  table: Table<getDeliveries> | Table<getRefsPendingCE>;
}) {
  return (
    <div>
      {/* Pagination starts here*/}
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
