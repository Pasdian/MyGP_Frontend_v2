import { GPServer } from '@/axios-instance';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session_token = req.cookies.get('session_token')?.value;
    await GPServer.post(
      '/api/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${session_token}`,
        },
      }
    );

    (await cookies()).delete('session_token');

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 });
  }
}
