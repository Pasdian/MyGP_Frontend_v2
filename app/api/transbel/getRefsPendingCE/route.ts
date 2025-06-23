import { GPServer } from '@/axios-instance';
import { logger } from '@/winston-logger';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

type GET_RESPONSE = {
  REFERENCIA: string | null;
  EE__GE: string | null;
  ADU_DESP: string | null;
  REVALIDACION_073: string | null; // ISO Date
  ULTIMO_DOCUMENTO_114: string | null;
  ENTREGA_TRANSPORTE_138: string | null;
  CE_138: string | null;
  MSA_130: string | null;
  ENTREGA_CDP_140: string | null;
  CE_140: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // if (searchParams.get('initialDate') && searchParams.get('finalDate')) {
    //   console.log(searchParams.get('initialDate'), searchParams.get('finalDate'));
    //   const res = await GPServer.get(
    //     `/api/transbel/getRefsPendingCE?initialDate=${searchParams.get(
    //       'initialDate'
    //     )}&finalDate=${searchParams.get('finalDate')}`,
    //     {
    //       headers: { Authorization: `Bearer ${session_token}` },
    //     }
    //   );
    //   const data: GET_RESPONSE[] = res.data;
    //   console.log(data);
    //   return Response.json(data);
    // }
    console.log(req.cookies);
    const res = await GPServer.get('/api/transbel/getRefsPendingCE', {
      headers: { Authorization: `Bearer ${req.cookies.get('session_token')}` },
    });

    const data: GET_RESPONSE[] = res.data;
    return Response.json(data);
  } catch (error) {
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
