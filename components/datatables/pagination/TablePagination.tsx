import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button'; // Adjust path if needed

type TablePaginationProps<T> = {
  table: Table<T>;
};

export default function TablePagination<T>({ table }: TablePaginationProps<T>) {
  return (
    <div>
      {/* Pagination starts here */}
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
