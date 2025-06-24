import { logger } from '@/winston-logger';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    (await cookies()).delete('session_token');

    return Response.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    logger.error('Failed to connect to server');
    return Response.error();
  }
}
