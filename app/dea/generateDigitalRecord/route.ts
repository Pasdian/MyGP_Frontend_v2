import { GPClientDEA } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const client = searchParams.get('client');
  const reference = searchParams.get('reference');

  return await GPClientDEA.get(
    `/dea/generateDigitalRecord?client=${client}&reference=${reference}`,
    {
      responseType: 'arraybuffer',
    }
  )
    .then((res) => {
      return NextResponse.json(res.data, { status: res.status });
    })
    .catch((err) => {
      console.error(err);
      logger.error(err.response.data.message);
      return NextResponse.json({ error: err.response.data.message }, { status: 500 });
    });
}
