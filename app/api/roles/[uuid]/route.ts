import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { UpdateRole } from '@/types/roles/updateRole';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const session_token = (await cookies()).get('session_token')?.value;
  const reqJSON: UpdateRole = await req.json();
  logger.info(`PUT /api/roles/${uuid} ${JSON.stringify(reqJSON)}`);

  return await GPServer.put(`/api/roles/${uuid}`, reqJSON, {
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
