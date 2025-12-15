// hooks/useEmbarque/useEmbarqueData.ts
'use client';

import useSWR, { mutate } from 'swr';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { customs } from '@/lib/customs/customs';
import { Embarque } from '@/types/transbel/Embarque';

const KEY = '/api/transbel/getDatosEmbarque';

type EmbarqueCache = { data: Embarque[] };

type UpdateEmbarqueInput = {
  NUM_REFE: string;
  EE?: string;
  GE?: string;
  CECO?: string;
  CUENTA?: string;
};

type Mode = 'EE' | 'GE' | 'CECO_CUENTA' | 'NONE';

function clean(input: UpdateEmbarqueInput) {
  const EE = input.EE?.trim() ?? '';
  const GE = input.GE?.trim() ?? '';
  const CECO = input.CECO?.trim() ?? '';
  const CUENTA = input.CUENTA?.trim() ?? '';

  const mode: Mode = EE ? 'EE' : GE ? 'GE' : CECO && CUENTA ? 'CECO_CUENTA' : 'NONE';

  const ETI_IMPR =
    mode === 'EE' ? 'EE' : mode === 'GE' ? 'GE' : mode === 'CECO_CUENTA' ? 'CECO_CUENTA' : '';

  const CVE_DAT = mode === 'EE' ? 1 : mode === 'GE' ? 2 : mode === 'CECO_CUENTA' ? 3 : 0;

  return { EE, GE, CECO, CUENTA, mode, ETI_IMPR, CVE_DAT };
}

function formatCecoCuenta(ceco: string, cuenta: string) {
  const c = (ceco ?? '').trim();
  const a = (cuenta ?? '').trim();
  return c && a ? `${c}/${a}` : '';
}

function applyOptimistic(
  cache: EmbarqueCache,
  ref: string,
  c: ReturnType<typeof clean>
): EmbarqueCache {
  return {
    ...cache,
    data: cache.data.map((e) => {
      if (e.REF !== ref) return e;

      if (c.mode === 'EE') return { ...e, EE: c.EE, GE: '', CECO_CUENTA: '' };
      if (c.mode === 'GE') return { ...e, EE: '', GE: c.GE, CECO_CUENTA: '' };
      if (c.mode === 'CECO_CUENTA')
        return { ...e, EE: '', GE: '', CECO_CUENTA: formatCecoCuenta(c.CECO, c.CUENTA) };

      return e;
    }),
  };
}

export function useEmbarqueData() {
  const { data, isLoading } = useSWR<EmbarqueCache>(KEY, axiosFetcher);

  const embarqueWithCustom = data?.data.map((e) => ({
    ...e,
    ADUANA: customs.find((c) => c.key === e.ADUANA)?.name || null,
  }));

  const updateEmbarque = async (input: UpdateEmbarqueInput) => {
    const c = clean(input);

    const payload = {
      NUM_REFE: input.NUM_REFE,
      EE: c.EE,
      GE: c.GE,
      CECO: c.CECO,
      CUENTA: c.CUENTA,
      ETI_IMPR: c.ETI_IMPR,
      CVE_DAT: c.CVE_DAT,
    };

    await mutate<EmbarqueCache>(
      KEY,
      async (current) => {
        await GPClient.patch(`/api/transbel/datosEmbarque/${input.NUM_REFE}`, payload);

        // keep optimistic cache; then re-sync from server
        const safe = current ?? { data: [] };
        return applyOptimistic(safe, input.NUM_REFE, c);
      },
      {
        optimisticData: (current) => applyOptimistic(current ?? { data: [] }, input.NUM_REFE, c),
        rollbackOnError: true,
        populateCache: true,
        revalidate: true, // <- this replaces applyServer + response parsing
      }
    );
  };

  return {
    embarque: embarqueWithCustom,
    isLoading,
    updateEmbarque,
  };
}
