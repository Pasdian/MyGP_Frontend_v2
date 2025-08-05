import { GPClientDEA } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      custom: string;
      reference: string;
      folder: string;
      image: string;
      patent: string;
    }>;
  }
) {
  const { custom, reference, folder, image, patent } = await params;

  return await GPClientDEA.get(
    `/dea/centralizada/${patent}/${custom}/Previos/${reference}/${folder}/${image}`,
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
      logger.error(err.response.data.detail);
      return NextResponse.json({ error: err.response.data.detail }, { status: 500 });
    });
}
