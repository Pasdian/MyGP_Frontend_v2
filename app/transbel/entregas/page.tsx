export const dynamic = 'force-dynamic';

import { GPServer } from '@/axios-instance';
import Deliveries from '@/components/transbel/entregas/Deliveries';
import { cookies } from 'next/headers';
import AddPhase from '@/components/transbel/entregas/AddPhase';
import { logger } from '@/winston-logger';

export type Delivery = {
  NUM_REFE: string | null;
  CVE_ETAP: string | null;
  FEC_ETAP: string | null;
  HOR_ETAP: string | null;
  OBS_ETAP: string | null;
  CVE_MODI: string | null;
};

export default async function Page() {
  try {
    const session_token = (await cookies()).get('session_token')?.value;

    const [deliveriesRes, transbelRefs] = await Promise.all([
      GPServer.get(`/api/transbel/getDeliveries`, {
        headers: {
          Authorization: `Bearer ${session_token}`,
        },
      }),
      GPServer.get(`/api/transbel/getTransbelRefs`, {
        headers: {
          Authorization: `Bearer ${session_token}`,
        },
      }),
    ]);

    const deliveries: Delivery[] = await deliveriesRes.data;
    const refs: { NUM_REFE: string }[] = await transbelRefs.data;

    deliveries.map((item) => {
      if (item.FEC_ETAP) {
        const date = new Date(item.FEC_ETAP);
        const formatDate = date.toLocaleDateString('es-pa').split('/'); // Get date as mm-dd-yyyy
        const month = formatDate[0];
        const day = formatDate[1];
        const year = formatDate[2];
        // ISO format
        item.FEC_ETAP = `${year}-${month}-${day}`;
      }

      if (item.HOR_ETAP) {
        item.HOR_ETAP = item.HOR_ETAP = new Date(item.HOR_ETAP).toLocaleTimeString('es-MX', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        });
      }
    });

    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas</h1>
        <AddPhase refs={refs} />
        <Deliveries data={deliveries} />
      </div>
    );
  } catch (error) {
    console.error(error);
    logger.error(error);
    return (
      <div>
        <p>Hubo un error al procesar tu solicitud, intentelo de nuevo más tarde</p>
      </div>
    );
  }
}
