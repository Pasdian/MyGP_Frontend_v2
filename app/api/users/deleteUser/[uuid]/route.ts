import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const session_token = (await cookies()).get('session_token')?.value;

  logger.info(`DELETE /api/users/deleteUser/${uuid}`);

  return await GPServer.delete(`/api/users/deleteUser/${uuid}`, {
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
