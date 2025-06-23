import { GPClient } from '@/axios-instance';
import InterfaceClient from '@/components/transbel/interfaz/InterfaceClient';
import { AxiosError } from 'axios';
import { cookies } from 'next/headers';

export type RefsPending = {
  REFERENCIA: string;
  EE__GE: string;
  ADU_DESP: string;
  REVALIDACION_073: string | null;
  ULTIMO_DOCUMENTO_114: string | null;
  ENTREGA_TRANSPORTE_138: string | null;
  CE_138: string;
  MSA_130: string | null;
  ENTREGA_CDP_140: string | null;
  CE_140: string | null;
};

export default async function Page() {
  try {
    const res = await GPClient.get('/api/transbel/getRefsPendingCE', { withCredentials: true });
    const refsPending: RefsPending[] = await res.data;
    return <InterfaceClient defaultData={refsPending} />;
  } catch (error) {
    console.error(error);
    return (
      <div>
        <p>Hubo un error al procesar tu solicitud, intentelo de nuevo más tarde</p>
      </div>
    );
  }
}
