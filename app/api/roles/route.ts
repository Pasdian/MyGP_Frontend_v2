import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { CreateRole } from '@/types/roles/createRole';
import { getRoles } from '@/types/roles/getRoles';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const res = await GPServer.get('/api/roles', {
      headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
    });

    const data: getRoles[] = res.data;
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session_token = (await cookies()).get('session_token')?.value;
  const reqJSON: CreateRole = await req.json();
  logger.info(`POST /api/roles ${JSON.stringify(reqJSON)}`);

  return await GPServer.post(`/api/roles`, reqJSON, {
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
