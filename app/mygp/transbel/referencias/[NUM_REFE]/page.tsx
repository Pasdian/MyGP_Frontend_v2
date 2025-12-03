'use client';

import { NumRefeParamsProvider, useNumRefeParams } from '@/app/providers/NumRefeParamsProvider';
import EtapasDataTable from '@/components/datatables/transbel/EtapasDataTable';

export default function NUM_REFE() {
  return (
    <NumRefeParamsProvider>
      <Wrapper />
    </NumRefeParamsProvider>
  );
}

function Wrapper() {
  const { NUM_REFE } = useNumRefeParams();
  return (
    <div>
      <p className="font-bold text-lg mb-4">Etapas - {NUM_REFE}</p>
      <EtapasDataTable NUM_REFE={NUM_REFE || ''} />
    </div>
  );
}
