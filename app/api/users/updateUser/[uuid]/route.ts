import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const reqJSON = await req.json();
  const session_token = (await cookies()).get('session_token')?.value;

  logger.info(`POST /api/users/updateUser/${uuid} ${JSON.stringify(reqJSON)}`);

  return await GPServer.post(`/api/users/updateUser/${uuid}`, reqJSON, {
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
