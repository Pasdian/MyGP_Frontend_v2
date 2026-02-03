// Augmentation types to react table, used in users module
export {};

import '@tanstack/table-core';
import type { RowData } from '@tanstack/table-core';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** apply to both header & cell if specific ones are not set */
    className?: string;
    /** header-only class */
    headerClassName?: string;
    /** cell-only class */
    cellClassName?: string;
  }
}
