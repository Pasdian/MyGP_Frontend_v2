import { GPServer } from '@/axios-instance';
import { logger } from '@/winston-logger';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

type AuthLogin = {
  token: string | null;
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
    const res = await GPServer.post('/api/auth/login', userCredentials);
    const data: AuthLogin = res.data;

    if (data.token) {
      (await cookies()).set('session_token', data.token);
    } else {
      return Response.json({ error: 'Token not found' });
    }
    logger.info(`${data.user.name} with email ${data.user.email} logged in`);

    return Response.json({ name: data.user.name, email: data.user.email });
  } catch (error) {
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
