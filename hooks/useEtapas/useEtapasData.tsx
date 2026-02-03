'use client';

import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { Phase } from '@/types/casa/Phase';
import useSWR from 'swr';

export function useEtapasData(NUM_REFE: string) {
  const key = `/api/casa/getPhases?NUM_REFE=${NUM_REFE}`;

  const { data, isLoading, mutate } = useSWR<Phase[]>(key, axiosFetcher);

  const upsertEtapa = async (formData: {
    phase: string;
    date: Date;
    user: string;
    exceptionCode: string | undefined;
  }): Promise<void> => {
    const payload = {
      phase: formData.phase,
      exceptionCode: formData.exceptionCode,
      date: formData.date ? formData.date.toISOString() : null,
      user: formData.user,
    };

    const previous = data ?? [];

    const optimisticPhase: Phase = {
      NUM_REFE,
      CVE_ETAP: formData.phase,
      DESC_ETAP: formData.phase,
      OBS_ETAP: formData.exceptionCode ?? null,
      FEC_ETAP: formData.date.toISOString().split('T')[0],
      HOR_ETAP: formData.date.toISOString().split('T')[1].slice(0, 8),
      CVE_MODI: formData.user,
    };

    const updated = (() => {
      const idx = previous.findIndex((p) => p.CVE_ETAP === formData.phase);

      if (idx === -1) {
        return [...previous, optimisticPhase];
      }

      return previous.map((p, i) => (i === idx ? { ...p, ...optimisticPhase } : p));
    })();

    // Optimistic update
    mutate(updated, false);

    try {
      await GPClient.patch(`/api/casa/upsertPhase/${NUM_REFE}`, payload);
      // Revalidate with server data
      await mutate();
    } catch (err) {
      // Rollback on error
      mutate(previous, false);
      throw err;
    }
  };

  return {
    etapas: data,
    upsertEtapa,
    isLoading,
  };
}
