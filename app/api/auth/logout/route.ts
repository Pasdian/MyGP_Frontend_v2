import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session_token = req.cookies.get('session_token')?.value;
  return await GPServer.post(
    '/api/auth/logout',
    {},
    {
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    }
  )
    .then(async (res) => {
      (await cookies()).delete('session_token');
      return NextResponse.json({ message: res.data.message }, { status: res.status });
    })
    .catch((error) => {
      console.error(error);
      logger.error(error);
      return NextResponse.json({ message: error.response.data.message }, { status: error.status });
    });
}
