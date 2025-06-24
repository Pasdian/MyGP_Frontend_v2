import { getRefsPendingCE } from '@/app/api/transbel/getRefsPendingCE/route';
import { GPServer } from '@/axios-instance';
import InterfaceClient from '@/components/transbel/interfaz/InterfaceClient';
import { logger } from '@/winston-logger';
import { cookies } from 'next/headers';

export default async function Page() {
  try {
    const session_token = (await cookies()).get('session_token')?.value;
    const res = await GPServer.get('/api/transbel/getRefsPendingCE', {
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    });

    const data: getRefsPendingCE[] = res.data;
    return <InterfaceClient defaultData={data} />;
  } catch (error) {
    logger.error('Failed to connect to server');

    return (
      <div>
        <p>Hubo un error al procesar tu solicitud, intentelo de nuevo más tarde</p>
      </div>
    );
  }
}
