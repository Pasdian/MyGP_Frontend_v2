import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

type UpdatePhase = {
  ref: string | null;
  phase: string | null;
  exceptionCode: string | null;
  date: number;
  user: string;
};

export async function POST(req: NextRequest) {
  try {
    const session_token = (await cookies()).get('session_token')?.value;
    const reqJson: UpdatePhase = await req.json();
    logger.info(`POST /api/transbel/updatePhase ${JSON.stringify(reqJson)}`);

    const res = await GPServer.post('/api/transbel/updatePhase', reqJson, {
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    });
    return Response.json({ message: 'Phase updated successfully' }, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
