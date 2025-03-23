import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from "@supabase/ssr";

const protectedRoutes = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  
  // Create a response that we can modify
  let res = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          res.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );
  
  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // If accessing a protected route without being authenticated, redirect to sign-in
  if (isProtectedRoute && !session) {
    console.log('Redirecting unauthenticated user to sign-in page');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  // If user is authenticated and trying to access login pages, redirect to dashboard
  if (session && (pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/')) {
    console.log('Redirecting authenticated user to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
