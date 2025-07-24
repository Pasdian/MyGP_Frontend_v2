import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { UpdatePhase } from '@/types/casa/updatePhase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session_token = (await cookies()).get('session_token')?.value;
    const reqJson: UpdatePhase = await req.json();
    logger.info(`POST /api/casa/upsertPhase ${JSON.stringify(reqJson)}`);

    const res = await GPServer.post('/api/casa/upsertPhase', reqJson, {
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    });
    return NextResponse.json({ message: 'Phase updated successfully' }, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
