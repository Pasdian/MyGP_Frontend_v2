import { GPClient } from '@/axios-instance';
import TransbelClientInterface from '@/components/transbel/interfaz/TransbelClientInterface';
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

export default async function Interfaz() {
  let refsPending: RefsPending[] = [];
  const session_token = (await cookies()).get('session_token')?.value;

  const res = await GPClient.get('/api/transbel/getRefsPendingCE', {
    headers: {
      Authorization: `Bearer ${session_token}`,
      'Cache-Control': 'no-cache',
    },
  });

  refsPending = await res.data;

  return <TransbelClientInterface defaultData={refsPending} />;
}
