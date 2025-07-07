import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { CreateUser } from '@/types/users/createUser';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session_token = (await cookies()).get('session_token')?.value;
  const reqJSON: CreateUser = await req.json();
  logger.info(`POST /api/users/addUser ${JSON.stringify(reqJSON)}`);

  return await GPServer.post(`/api/users/createUser`, reqJSON, {
    headers: {
      Authorization: `Bearer ${session_token}`,
    },
  })
    .then((res) => {
      return NextResponse.json(res.data, { status: res.status });
    })
    .catch((error) => {
      logger.error(error);
      return NextResponse.json({ message: error.response.data.message }, { status: error.status });
    });
}
