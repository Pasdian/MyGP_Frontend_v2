import { GPServer } from '@/axios-instance';
import { logger } from '@/winston-logger';
import { NextRequest } from 'next/server';

export type getTransbelRefs = {
  NUM_REFE: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const res = await GPServer.get('/api/transbel/getTransbelRefs', {
      headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
    });

    const data: getTransbelRefs[] = res.data;
    return Response.json(data);
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
