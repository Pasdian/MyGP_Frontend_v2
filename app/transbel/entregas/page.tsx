import { GPClient } from '@/axios-instance';
import TransbelAddPhase from '@/components/transbel/entregas/TransbelAddPhase';
import TransbelDeliveries from '@/components/transbel/entregas/TransbelDeliveries';
import { cookies } from 'next/headers';

export type Deliveries = {
  NUM_REFE: string | null;
  CVE_ETAP: string | null;
  FEC_ETAP: string | null;
  HOR_ETAP: string | null;
  OBS_ETAP: string | null;
  CVE_MODI: string | null;
};

export default async function Deliveries() {
  const session_token = (await cookies()).get('session_token')?.value;

  const res = await GPClient.get(`/api/transbel/getDeliveries`, {
    headers: {
      Authorization: `Bearer ${session_token}`,
      'Cache-Control': 'no-cache',
    },
  });

  const deliveries: Deliveries[] = res.data;

  deliveries.map((item) => {
    if (item.FEC_ETAP) item.FEC_ETAP = item.FEC_ETAP.split('T')[0];

    if (item.HOR_ETAP) {
      item.HOR_ETAP = item.HOR_ETAP.split('T')[1].substring(0, 5);
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas</h1>
      <TransbelAddPhase />
      <TransbelDeliveries data={deliveries} />
    </div>
  );
}
