import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/rate-limit/utils';
import { createAuthRateLimiter, createApiRateLimiter } from '@/lib/rate-limit';

const protectedRoutes = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  // Apply rate limiting based on the route
  let rateLimitResponse = null;

  if (pathname.startsWith('/api/')) {
    // Different rate limits for different API endpoints
    if (
      pathname.includes('/auth/') ||
      pathname.includes('/login') ||
      pathname.includes('/sign')
    ) {
      rateLimitResponse = await checkRateLimit(request, {
        rateLimiter: createAuthRateLimiter(),
      });
    } else {
      rateLimitResponse = await checkRateLimit(request, {
        rateLimiter: createApiRateLimiter(),
      });
    }
  }

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};
