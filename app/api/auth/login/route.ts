import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { Login } from '@/types/auth/login';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const userCredentials: {
    email: string | null;
    password: string | null;
  } = await req.json();

  return await GPServer.post('/api/auth/login', userCredentials)
    .then(async (res: { data: Login; status: number }) => {
      logger.info(
        `${res.data.complete_user.user.name} with email ${res.data.complete_user.user.email} logged in with token ${res.data.token}`
      );
      (await cookies()).set('session_token', res.data.token, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return NextResponse.json(res.data, { status: res.status });
    })
    .catch((error) => {
      logger.error(error);
      return NextResponse.json({ message: error.response.data.message }, { status: error.status });
    });
}
