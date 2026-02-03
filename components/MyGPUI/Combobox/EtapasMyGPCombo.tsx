'use client';

import * as React from 'react';
import useSWR from 'swr';

import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getPhasesByAduanaPatente } from '@/types/casa/getPhasesByAduanaPatente';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';

interface EtapasMyGPComboProps {
  ADU_DESP: string;
  PAT_AGEN: string;
  value: string | undefined;
  onValueChange: (value: string, selectedItem?: getPhasesByAduanaPatente) => void;
}

export function EtapasMyGPCombo({
  ADU_DESP,
  PAT_AGEN,
  value,
  onValueChange,
}: EtapasMyGPComboProps) {
  const { data, isLoading } = useSWR<getPhasesByAduanaPatente[]>(
    `/api/casa/getPhasesByAduanaPatente?ADU_DESP=${ADU_DESP}&PAT_AGEN=${PAT_AGEN}`,
    axiosFetcher
  );

  const options = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      value: item.CVE_ETAP,
      label: `(${item.CVE_ETAP}) ${item.DESC_ETAP}`,
    }));
  }, [data]);

  const handleChange = (cveEtap: string) => {
    const selected = data?.find((i) => i.CVE_ETAP === cveEtap);
    onValueChange(cveEtap, selected);
  };

  return (
    <MyGPCombo
      label="Etapa"
      placeholder={isLoading ? 'Cargando etapas...' : 'Buscar por código o descripción...'}
      value={value || ''}
      setValue={handleChange}
      options={options}
      showValue={false}
      className={isLoading ? 'opacity-50 pointer-events-none' : undefined}
    />
  );
}
