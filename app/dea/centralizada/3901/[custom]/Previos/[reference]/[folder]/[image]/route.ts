import { GPClientDEA } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ custom: string; reference: string; folder: string; image: string }> }
) {
  const { custom, reference, folder, image } = await params;

  return await GPClientDEA.get(
    `/dea/centralizada/3901/${custom}/Previos/${reference}/${folder}/${image}`,
    { responseType: 'arraybuffer' }
  )
    .then((res) => {
      return new Response(res.data, {
        status: res.status,
        headers: {
          'Content-Type': res.headers['content-type'] || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${image}"`,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      logger.error(err.response.data.message);
      return NextResponse.json({ error: err.response.data.message }, { status: 500 });
    });
}
