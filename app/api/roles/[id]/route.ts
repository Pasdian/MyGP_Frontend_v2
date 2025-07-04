import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { CreateRole } from '@/types/roles/createRole';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session_token = (await cookies()).get('session_token')?.value;
  const reqJSON: CreateRole = await req.json();
  logger.info(`PUT /api/roles/${id} ${JSON.stringify(reqJSON)}`);

  return await GPServer.put(`/api/roles/${id}`, reqJSON, {
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
