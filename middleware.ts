import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = '/dashboard'
const isDevelopment = process.env.NODE_ENV === 'development'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedRoute = pathname.startsWith(protectedRoutes)
  
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  // Create the Supabase client using cookies from the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options
          })
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0
          })
        }
      }
    }
  )

  // Get the session from Supabase (this also refreshes the session if needed)
  const { data: { session } } = await supabase.auth.getSession()

  // If we're on a protected route and there's no session, redirect to sign-in
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/sign-in', request.url)
    // Add original path as a parameter to redirect back after sign-in
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  
  if (!isDevelopment) {
    // Only set CSP in production
    requestHeaders.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://*.supabase.co;`
    )
  } else {
    // Remove any existing CSP in development
    requestHeaders.delete('Content-Security-Policy')
  }
  
  // Create a new response with the modified headers
  const modifiedResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  return modifiedResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
