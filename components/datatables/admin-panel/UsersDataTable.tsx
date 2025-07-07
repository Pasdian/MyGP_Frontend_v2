import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { flexRender } from '@tanstack/react-table';
import { deliveriesColumns } from '@/lib/columns/deliveriesColumns';
import { getAllUsers, getAllUsersDeepCopy } from '@/types/users/getAllUsers';
import UsersDataTableFilter from '../filters/UsersDataTableFilter';
import TablePagination from '../pagination/TablePagination';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import useSWRImmutable from 'swr/immutable';
import { usersColumns } from '@/lib/columns/usersColumns';
import { axiosFetcher } from '@/axios-instance';
import React from 'react';
import TailwindSpinner from '../../ui/TailwindSpinner';
import { RolesContext } from '@/contexts/RolesContext';

export default function UsersDataTable() {
  const roles = React.useContext(RolesContext);

  const { data, isValidating } = useSWRImmutable<getAllUsers[]>(
    '/api/users/getAllUsers',
    axiosFetcher
  );

  const [deepCopy, setDeepCopy] = React.useState<getAllUsersDeepCopy[]>(
    data ? data.map((item) => ({ ...item, role_description: '' })) : []
  );

  React.useEffect(() => {
    function modifyData() {
      if (!data) return;
      const localDeepCopy = JSON.parse(JSON.stringify(data));

      localDeepCopy.map((item: getAllUsersDeepCopy) => {
        item.role_description = roles?.find((role) => role.id == item.role_id)?.description ?? '--';
        item.status = item.status == 'active' ? 'Activo' : 'Inactivo';
      });

      setDeepCopy(localDeepCopy);
    }

    if (data) modifyData();
  }, [data, roles]);

  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: data ? deepCopy : [],
    columns: usersColumns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });

  if (isValidating) return <TailwindSpinner />;

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanFilter() ? (
                          <div>
                            <UsersDataTableFilter column={header.column} />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={deliveriesColumns.length} className="h-24 text-center">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination table={table} />
    </div>
  );
}
