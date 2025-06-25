import { GPServer } from '@/axios-instance';
import { logger } from '@/winston-logger';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const session_token = (await cookies()).get('session_token')?.value;
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

    return Response.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
