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

    const res = await GPServer.post('/api/transbel/addPhase', reqJson, {
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    });

    return Response.json({ message: 'Phase added succesfully' }, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return Response.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
