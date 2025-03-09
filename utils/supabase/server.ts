import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      options: {
        auth: {
          flowType: process.env.NODE_ENV === 'development' ? 'implicit' : 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        }
      },
      cookies: {
        async get(name: string) {
          const cookieJar = await cookieStore
          const cookie = cookieJar.get(name)
          return cookie?.value
        },
        async set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) {
          try {
            const cookieJar = await cookieStore
            cookieJar.set(name, value, options)
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options: { path?: string; domain?: string; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) {
          try {
            const cookieJar = await cookieStore
            cookieJar.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
} 