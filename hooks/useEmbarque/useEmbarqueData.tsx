// hooks/useEmbarque/useEmbarqueData.ts
'use client';

import useSWR, { mutate } from 'swr';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { customs } from '@/lib/customs/customs';
import type { Embarque } from '@/types/transbel/Embarque';

const KEY = '/api/transbel/getDatosEmbarque';

type UpdateEmbarqueInput = {
  NUM_REFE: string;
  EE?: string;
  GE?: string;
  CECO?: string;
  CUENTA?: string;
};

function t(v?: string) {
  return (v ?? '').trim();
}

function optimistic(list: Embarque[], ref: string, EE: string, GE: string, CECO_CUENTA: string) {
  return list.map((e) => {
    if (e.REF !== ref) return e;
    return { ...e, EE: EE || null, GE: GE || null, CECO_CUENTA: CECO_CUENTA || null };
  });
}

export function useEmbarqueData() {
  const { data, isLoading } = useSWR<Embarque[]>(KEY, axiosFetcher);

  const embarque = data?.map((e) => ({
    ...e,
    ADUANA: customs.find((c) => c.key === e.ADUANA)?.name ?? null,
  }));

  const updateEmbarque = async (input: UpdateEmbarqueInput) => {
    const EE = t(input.EE);
    const GE = t(input.GE);
    const CECO = t(input.CECO);
    const CUENTA = t(input.CUENTA);

    const useEE = !!EE;
    const useGE = !useEE && !!GE;
    const useCeco = !useEE && !useGE && !!CECO && !!CUENTA;

    const nextEE = useEE ? EE : '';
    const nextGE = useGE ? GE : '';
    const nextCecoCuenta = useCeco ? `${CECO}/${CUENTA}` : '';

    const payload = {
      NUM_REFE: input.NUM_REFE,
      EE: nextEE,
      GE: nextGE,
      CECO,
      CUENTA,
      ETI_IMPR: useEE ? 'EE' : useGE ? 'GE' : useCeco ? 'CECO_CUENTA' : '',
      CVE_DAT: useEE ? 1 : useGE ? 2 : useCeco ? 3 : 0,
    };

    await mutate<Embarque[]>(
      KEY,
      async (current) => {
        const next = optimistic(current ?? [], input.NUM_REFE, nextEE, nextGE, nextCecoCuenta);
        await GPClient.patch(`/api/transbel/datosEmbarque/${input.NUM_REFE}`, payload);
        return next;
      },
      {
        optimisticData: (current) =>
          optimistic(current ?? [], input.NUM_REFE, nextEE, nextGE, nextCecoCuenta),
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      }
    );
  };

  return { embarque, isLoading, updateEmbarque };
}
