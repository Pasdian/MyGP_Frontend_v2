import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

export type getDeliveries = {
  REFERENCIA: string | null;
  EE__GE: string | null;
  ENTREGA_TRANSPORTE_138: string | null;
  CE_138: string | null;
  ENTREGA_CDP_140: string | null;
  CE_140: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const res = await GPServer.get('/api/transbel/getDeliveries', {
      headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
    });

    const data: getDeliveries[] = res.data;
    return Response.json(data);
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
