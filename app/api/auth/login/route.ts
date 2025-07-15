import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export type LoginResponse = { name: string; email: string };

export async function POST(req: NextRequest) {
  const userCredentials: {
    email: string | null;
    password: string | null;
  } = await req.json();

  return await GPServer.post('/api/auth/login', userCredentials)
    .then(async (res) => {
      logger.info(
        `${res.data.user.name} with email ${res.data.user.email} logged in with token ${res.data.token}`
      );
      (await cookies()).set('session_token', res.data.token);
      return NextResponse.json(res.data, { status: res.status });
    })
    .catch((error) => {
      logger.error(error);
      return NextResponse.json({ message: error.response.data.message }, { status: error.status });
    });
}
