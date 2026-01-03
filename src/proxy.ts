import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ONBOARDING_COOKIE = 'onboarding-completed';

// Pages that should be accessible without completing onboarding
const PUBLIC_PATHS = ['/privacy', '/terms'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if onboarding is completed
  const hasCompletedOnboarding = request.cookies.get(ONBOARDING_COOKIE)?.value;

  // If onboarding not completed and trying to access protected page, redirect to home
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (!hasCompletedOnboarding && pathname !== '/' && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next({
    request,
  });
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
