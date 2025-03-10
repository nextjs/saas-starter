import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = req.cookies.get(name)?.value;
          console.log(`middleware: get('${name}') => ${value}`);
          return value;
        },
        set(name: string, value: string, options: { path: string; maxAge?: number; domain?: string; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) {
          console.log(`middleware: set('${name}', '${value}', ${JSON.stringify(options)}`);
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: { path: string; domain?: string; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) {
          console.log(`middleware: remove('${name}', ${JSON.stringify(options)}`);
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("middleware: session:", session);

    // Protected routes
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/sign-in', req.url);
      // Preserve the original URL to redirect back after login
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Auth pages when logged in
    if (session && ['/login', '/signup', '/sign-in', '/sign-up'].includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
  } catch (error) {
    console.error("middleware: Error getting session:", error);
    return res;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};