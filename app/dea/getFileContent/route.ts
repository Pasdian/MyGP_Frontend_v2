import { GPClientDEA } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const filepath = searchParams.get('filepath');

  return await GPClientDEA.get(`/dea/getFileContent?filepath=${filepath}`, {
    responseType: 'arraybuffer',
  })
    .then((res) => {
      return new Response(res.data, {
        status: res.status,
        headers: {
          'Content-Type': res.headers['content-type'] || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${filepath}"`,
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
