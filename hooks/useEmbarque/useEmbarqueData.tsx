"use client";

import { axiosFetcher, GPClient } from "@/lib/axiosUtils/axios-instance";
import { customs, getCustomKeyByRef } from "@/lib/customs/customs";
import { Embarque } from "@/types/transbel/Embarque";
import useSWR, { mutate } from "swr";

export function useEmbarqueData() {
  const { data, isLoading } = useSWR<{ data: Embarque[] }>(
    "/api/transbel/getDatosEmbarque",
    axiosFetcher
  );

  const embarqueWithCustom = data?.data?.map((e) => ({
    ...e,
    ADUANA: customs.find((c) => c.key == e.ADUANA)?.name || null,
  }));

  const addEmbarque = async (nuevo: Partial<Embarque>) => {
    const res = await GPClient.post<Embarque>(
      "/api/transbel/addEmbarque",
      nuevo
    );

    const created = {
      ...res.data,
      ADUANA: res.data.REF ? getCustomKeyByRef(res.data.REF) : null,
    };

    mutate(
      "/api/transbel/getDatosEmbarque",
      (current: Embarque[] | undefined) =>
      current ? [...current, created] : [created],
      false
    );

    mutate("/api/transbel/getDatosEmbarque");

    return created;
  };

  return {
    embarque: embarqueWithCustom,
    isLoading,
    addEmbarque,
  };
}
