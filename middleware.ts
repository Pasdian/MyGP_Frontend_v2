import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const session_token = (await cookies()).get('session_token')?.value;

  if (req.nextUrl.pathname == '/') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (!session_token && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session_token && req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/mygp/transbel/dashboard', req.url));
  }

  if (session_token && req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/mygp/transbel/dashboard', req.url));
  }

  if (session_token && req.nextUrl.pathname == '/mygp') {
    return NextResponse.redirect(new URL('/mygp/dashboard', req.url));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
