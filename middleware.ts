import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const secureCookie = request.nextUrl.protocol === 'https:';
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    secureCookie,
  });
  const sessionCookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
  ];
  const hasSessionCookie = request.cookies
    .getAll()
    .some(({ name }) =>
      sessionCookieNames.some(
        (cookieName) => name === cookieName || name.startsWith(`${cookieName}.`),
      ),
    );

  const response = NextResponse.next();
  if (!token && hasSessionCookie) {
    const expiredAt = new Date(0);
    for (const { name } of request.cookies.getAll()) {
      if (
        sessionCookieNames.some(
          (cookieName) =>
            name === cookieName || name.startsWith(`${cookieName}.`),
        )
      ) {
        response.cookies.set({
          name,
          value: '',
          expires: expiredAt,
          path: '/',
          httpOnly: true,
          secure: name.startsWith('__Secure-'),
          sameSite: 'lax',
        });
      }
    }
  }

  if (
    isProtectedRoute &&
    (!token ||
      (token.provider !== 'google' &&
        token.provider !== 'facebook' &&
        token.provider !== 'email'))
  ) {
    const redirectResponse = NextResponse.redirect(
      new URL('/sign-in', request.url),
    );
    if (!token && hasSessionCookie) {
      for (const expiredCookie of response.cookies.getAll()) {
        redirectResponse.cookies.set(expiredCookie);
      }
    }
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
