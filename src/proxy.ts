import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hasSeenOnboarding = request.cookies.get('hasSeenOnboarding')?.value === 'true';
  const pathname = request.nextUrl.pathname;

  // If user hasn't seen onboarding and is not on the welcome page, redirect to welcome
  if (!hasSeenOnboarding && pathname !== '/welcome') {
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  // If user has seen onboarding and is on the welcome page, redirect to home
  if (hasSeenOnboarding && pathname === '/welcome') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (like images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
