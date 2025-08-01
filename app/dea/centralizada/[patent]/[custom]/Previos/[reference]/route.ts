import { GPClientDEA } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ custom: string; reference: string; patent: string }> }
) {
  const { custom, reference, patent } = await params;

  return await GPClientDEA.get(`/dea/centralizada/${patent}/${custom}/Previos/${reference}`)
    .then((res) => {
      return NextResponse.json(res.data, { status: res.status });
    })
    .catch((err) => {
      console.error(err);
      logger.error(err.response.data.message);
      return NextResponse.json({ error: err.response.data.message }, { status: 500 });
    });
}
