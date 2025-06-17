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

  const data = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transbel/getDeliveries`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session_token}`,
    },
  });
  const deliveries: Deliveries[] = await data.json();

  deliveries.map((item) => {
    if (item.FEC_ETAP) item.FEC_ETAP = item.FEC_ETAP.split('T')[0];

    if (item.HOR_ETAP) {
      const date = new Date(item.HOR_ETAP);
      item.HOR_ETAP = date.toLocaleString('es-MX', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });
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
