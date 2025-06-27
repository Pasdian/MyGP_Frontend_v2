import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { DeletePhase } from '@/types/transbel/deletePhase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session_token = (await cookies()).get('session_token')?.value;
    const reqJson: DeletePhase = await req.json();
    logger.info(`POST /api/transbel/deletePhase ${JSON.stringify(reqJson)}`);

    const res = await GPServer.post('/api/transbel/deletePhase', reqJson, {
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    });
    return NextResponse.json({ message: 'Phase deleted successfully' }, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
