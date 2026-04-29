'use client';

import React, { useState } from 'react';
import { Search, Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type Column<T> = {
  key: string;
  label: string;
  width?: number;
  render?: (row: T) => React.ReactNode;
  filter?: boolean; // show search input under header (default true)
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  rowAction?: (row: T) => React.ReactNode;
  emptyMessage?: string;
};

// TODO: Filter inputs are visual placeholders — typing does not yet filter rows.
// Wire up state-based filtering in a future iteration.

export default function InboxTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onRowClick,
  rowAction,
  emptyMessage = 'Sin registros',
}: Props<T>) {
  // TODO: wire filter state to actual row filtering in a future iteration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_filters, setFilters] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-[#FAFAFA]">
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  className="whitespace-nowrap font-semibold text-[#0A0A0A]"
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.label}
                </TableHead>
              ))}
              {rowAction && (
                <TableHead className="text-right" style={{ width: 120 }}>
                  Acciones
                </TableHead>
              )}
            </TableRow>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={`${c.key}-f`} className="py-1.5 px-2">
                  {c.filter !== false && (
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737373]" />
                      <Input
                        placeholder="Buscar"
                        className="h-7 pl-7 text-[11px]"
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            [c.key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </TableHead>
              ))}
              {rowAction && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowAction ? 1 : 0)}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-[#737373]">
                    <Inbox className="h-8 w-8 opacity-40" />
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-[#F0F0F0] text-[12px] ${onRowClick ? 'cursor-pointer hover:bg-[#FAFAFA]' : ''}`}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} className="whitespace-nowrap">
                      {c.render
                        ? c.render(row)
                        : String(row[c.key] ?? '--')}
                    </TableCell>
                  ))}
                  {rowAction && (
                    <TableCell className="text-right">
                      {rowAction(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] text-[#737373]">
        <div>
          Mostrando {rows.length} de {rows.length}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            ‹
          </Button>
          <Button size="sm" className="h-6 w-6 p-0 bg-[#3B82F6] text-white font-bold">
            1
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}
