import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type AuthLogin = {
  token: string;
  user: {
    id: number | null;
    uuid: string | null;
    casa_user_name: string | null;
    name: string | null;
    email: string | null;
    role: number | null;
  };
};

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
    const data: AuthLogin = res.data;

    (await cookies()).set('session_token', data.token);

    logger.info(
      `${data.user.name} with email ${data.user.email} logged in with token ${data.token}`
    );

    return NextResponse.json(
      { name: data.user.name, email: data.user.email },
      { status: res.status }
    );
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
