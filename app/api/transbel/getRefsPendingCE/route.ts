import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

// All dates are on ISO format
export type getRefsPendingCE = {
  REFERENCIA: string | null;
  EE__GE: string | null;
  ADU_DESP: string | null;
  REVALIDACION_073: string | null;
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
    const res = await GPServer.get(
      `/api/transbel/getRefsPendingCE?initialDate=${searchParams.get(
        'initialDate'
      )}&finalDate=${searchParams.get('finalDate')}`,
      {
        headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
      }
    );
    const data: getRefsPendingCE[] = res.data;
    return Response.json(data);
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
