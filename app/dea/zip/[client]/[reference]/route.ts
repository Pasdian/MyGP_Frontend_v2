import { GPClientDEA } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ client: string; reference: string }> }
) {
  const { client, reference } = await params;

  return await GPClientDEA.get(`/dea/zip/${client}/${reference}`, {
    responseType: 'arraybuffer',
  })
    .then((res) => {
      return new Response(res.data, {
        status: res.status,
        headers: {
          'Content-Type': res.headers['content-type'] || 'application/octet-stream',
        },
      });
    })
    .catch((err) => {
      console.error(err);
      logger.error(err.response.data.detail);
      return NextResponse.json(
        { error: err.response.data.detail },
        { status: err.response.status }
      );
    });
}
