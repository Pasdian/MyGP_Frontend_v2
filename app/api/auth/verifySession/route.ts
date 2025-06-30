import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { Login } from '@/types/auth/login';
import { VerifySession } from '@/types/auth/verifySession';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type LoginResponse = { name: string; email: string };

export async function POST() {
  try {
    const session_token = (await cookies()).get('session_token')?.value;
    const res = await GPServer.post(
      '/api/auth/verifySession',
      {},
      {
        headers: {
          Authorization: `Bearer ${session_token}`,
        },
      }
    );
    const data: VerifySession = res.data;

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
