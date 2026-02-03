// hooks/useCargue/useCargueData.ts
'use client';

import * as React from 'react';
import useSWR from 'swr';
import type { TabValue } from '@/contexts/CarguesContext';
import type { getCargues } from '@/types/transbel/getCargues';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';

const KEY = '/api/transbel/getCargues';

const TAB_VALUES = ['pending', 'paid'] as const;

export type UpdateFolioInput = {
  NUM_REFE: string;
  EE?: string;
  GE?: string;
  CECO?: string;
  CUENTA?: string;
};

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}

function normalizeFolio(input: UpdateFolioInput) {
  const EE = input.EE?.trim() ?? '';
  const GE = input.GE?.trim() ?? '';
  const CECO = input.CECO?.trim() ?? '';
  const CUENTA = input.CUENTA?.trim() ?? '';

  if (EE) return { EE, GE: '', CECO: '', CUENTA: '' };
  if (GE) return { EE: '', GE, CECO: '', CUENTA: '' };

  // CECO + CUENTA mode (keep as-is; your Zod already enforces both)
  return { EE: '', GE: '', CECO, CUENTA };
}

export function useCargueData() {
  const [tabValue, setTabValue] = React.useState<TabValue>('pending');

  const { data, isLoading, mutate } = useSWR<getCargues[]>(KEY, axiosFetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const cargues = Array.isArray(data) ? data : [];

  const updateFolio = async (input: UpdateFolioInput) => {
    const updates = normalizeFolio(input);

    await mutate(
      async (current) => {
        const curr = Array.isArray(current) ? current : [];

        await GPClient.patch(`/api/transbel/datosEmbarque/${input.NUM_REFE}`, {
          NUM_REFE: input.NUM_REFE,
          ...updates,
        });

        return curr.map((row) => (row.NUM_REFE === input.NUM_REFE ? { ...row, ...updates } : row));
      },
      {
        optimisticData: (current) => {
          const curr = Array.isArray(current) ? current : [];
          return curr.map((row) =>
            row.NUM_REFE === input.NUM_REFE ? { ...row, ...updates } : row
          );
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      }
    );
  };

  return {
    cargues,
    isLoading,
    tabValue,
    setTabValue,
    isTabValue,
    updateFolio,
  };
}
