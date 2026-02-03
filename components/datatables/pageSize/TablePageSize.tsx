import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TablePageSize({
  pagination,
  setPagination,
}: {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<
    React.SetStateAction<{
      pageIndex: number;
      pageSize: number;
    }>
  >;
}) {
  return (
    <div className="flex items-center gap-2 justify-start">
      <label htmlFor="pageSize" className="text-sm font-medium">
        Tamaño de página:
      </label>

      <Select
        value={String(pagination.pageSize)}
        onValueChange={(value) =>
          setPagination((old) => ({
            ...old,
            pageSize: Number(value),
            pageIndex: 0,
          }))
        }
      >
        <SelectTrigger className="w-[100px]" id="pageSize">
          <SelectValue placeholder="Selecciona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="15">15</SelectItem>
          <SelectItem value="20">20</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
