import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    version: process.env.NEXT_PUBLIC_RELEASE_VERSION,
  });
}
