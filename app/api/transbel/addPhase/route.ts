import { GPServer } from '@/axios-instance';
import { logger } from '@/winston-logger';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

type AddPhase = {
  ref: string | null;
  phase: string | null;
  exceptionCode: string | null;
  date: number;
  user: string;
};

export async function POST(req: NextRequest) {
  try {
    const session_token = (await cookies()).get('session_token')?.value;
    const reqJson: AddPhase = await req.json();

    await GPServer.post('/api/transbel/addPhase', reqJson, {
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    });

    return Response.json({});
  } catch (error) {
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
