import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { getRoles } from '@/types/roles/getRoles';
import { getAllUsers } from '@/types/users/getAllUsers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const res = await GPServer.get('/api/roles', {
      headers: { Authorization: `Bearer ${req.cookies.get('session_token')?.value}` },
    });

    const data: getRoles[] = res.data;
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
