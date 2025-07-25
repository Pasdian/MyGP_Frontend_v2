import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const res = await GPServer.get('/api/transbel/getDeliveries', {
      headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
    });

    const data: getDeliveries[] = res.data;
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
