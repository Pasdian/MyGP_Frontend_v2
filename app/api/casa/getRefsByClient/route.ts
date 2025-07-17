import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const client = searchParams.get('client');
  const initialDate = searchParams.get('initialDate') || '';
  const finalDate = searchParams.get('finalDate') || '';

  logger.info(
    `GET /api/casa/getRefsByClient?client=${client}&initialDate=${initialDate}&finalDate=${finalDate}`
  );

  return await GPServer.get(
    `/api/casa/getRefsByClient?client=${client}&initialDate=${initialDate}&finalDate=${finalDate}`,
    {
      headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
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
