import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

export type getDeliveries = {
  NUM_REFE: string | null;
  CVE_ETAP: string | null;
  FEC_ETAP: string | null;
  HOR_ETAP: string | null;
  OBS_ETAP: string | null;
  CVE_MODI: string | null;
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
