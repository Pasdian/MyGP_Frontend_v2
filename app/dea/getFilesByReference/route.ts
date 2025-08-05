import { GPClientDEA } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const reference = searchParams.get('reference');
  const client = searchParams.get('client');

  return await GPClientDEA.get(`/dea/getFilesByReference?reference=${reference}&client=${client}`)
    .then((res) => {
      return NextResponse.json(res.data, { status: res.status });
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
