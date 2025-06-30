import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { Login } from '@/types/auth/login';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export type LoginResponse = { name: string; email: string };

export async function POST(req: NextRequest) {
  try {
    const userCredentials: {
      email: string | null;
      password: string | null;
    } = await req.json();

    if (!userCredentials.email || !userCredentials.password) {
      return NextResponse.json(
        { message: 'User email and password not provided' },
        { status: 400 }
      );
    }
    const res = await GPServer.post('/api/auth/login', userCredentials);
    const data: Login = res.data;

    (await cookies()).set('session_token', data.token);

    logger.info(
      `${data.user.name} with email ${data.user.email} logged in with token ${data.token}`
    );

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
