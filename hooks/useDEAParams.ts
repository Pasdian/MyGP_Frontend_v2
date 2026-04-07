'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { getCustomKeyByRef } from '@/lib/customs/customs';

/** Serialize Date to YYYY-MM-DD (local time). Matches useRefsByClient pattern. */
const toYMD = (d: Date): string => d.toISOString().slice(0, 10);

/** Parse YYYY-MM-DD string to Date, avoiding timezone midnight shift. */
const fromYMD = (s: string): Date => new Date(s + 'T00:00:00');

/** Compute default date range: last month start to current month end. */
function defaultDateRange(): { from: Date; to: Date } {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from, to };
}

export function useDEAParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Readers ---
  const client = searchParams.get('client') ?? '';
  const reference = searchParams.get('reference') ?? '';
  const custom = searchParams.get('custom') ?? '';
  const folder = searchParams.get('folder') ?? '';
  const file = searchParams.get('file') ?? '';

  const rawStart = searchParams.get('start_date');
  const rawEnd = searchParams.get('end_date');
  const defaults = defaultDateRange();
  const startDate: Date = rawStart ? fromYMD(rawStart) : defaults.from;
  const endDate: Date = rawEnd ? fromYMD(rawEnd) : defaults.to;

  // --- Setters (all use router.push for browser history — URL-06) ---

  const setClient = useCallback(
    (val: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('client', val);
      // Cascade clear: reference, custom, folder, file
      next.delete('reference');
      next.delete('custom');
      next.delete('folder');
      next.delete('file');
      router.push(`?${next.toString()}`);
    },
    [searchParams, router]
  );

  const setReference = useCallback(
    (val: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('reference', val);
      // Derive and set custom atomically
      const customKey = getCustomKeyByRef(val);
      if (customKey) {
        next.set('custom', customKey);
      } else {
        next.delete('custom');
      }
      // Cascade clear: folder, file
      next.delete('folder');
      next.delete('file');
      router.push(`?${next.toString()}`);
    },
    [searchParams, router]
  );

  const setActiveFile = useCallback(
    (folderVal: string, fileVal: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('folder', folderVal);
      next.set('file', fileVal);
      router.push(`?${next.toString()}`);
    },
    [searchParams, router]
  );

  const setDateRange = useCallback(
    (start: Date, end: Date) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('start_date', toYMD(start));
      next.set('end_date', toYMD(end));
      router.push(`?${next.toString()}`);
    },
    [searchParams, router]
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('client');
    next.delete('reference');
    next.delete('custom');
    next.delete('folder');
    next.delete('file');
    next.delete('start_date');
    next.delete('end_date');
    router.push(`?${next.toString()}`);
  }, [searchParams, router]);

  return {
    client,
    reference,
    custom,
    folder,
    file,
    startDate,
    endDate,
    setClient,
    setReference,
    setActiveFile,
    setDateRange,
    clearAll,
  };
}
