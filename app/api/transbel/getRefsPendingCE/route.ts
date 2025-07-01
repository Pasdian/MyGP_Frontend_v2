import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    if (!searchParams.get('initialDate') || !searchParams.get('finalDate')) {
      const res = await GPServer.get('/api/transbel/getRefsPendingCE', {
        headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
      });
      const data: getRefsPendingCE[] = res.data;
      return NextResponse.json(data, { status: res.status });
    }

    const res = await GPServer.get(
      `/api/transbel/getRefsPendingCE?initialDate=${searchParams.get(
        'initialDate'
      )}&finalDate=${searchParams.get('finalDate')}`,
      {
        headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
      }
    );
    const data: getRefsPendingCE[] = res.data;
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
