import { GPServer } from '@/lib/axiosUtils/axios-instance';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const initialDate = searchParams.get('initialDate');
  const finalDate = searchParams.get('finalDate');
  const client = searchParams.get('client');

  return await GPServer.get(
    `/api/bi/getOperationsDistributionByCustoms?initialDate=${initialDate}&finalDate=${finalDate}&client=${client}`,
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
