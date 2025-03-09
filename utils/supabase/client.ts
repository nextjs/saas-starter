'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return null
          const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
          return match?.[2] ?? null
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) {
          if (typeof document === 'undefined') return
          let cookie = `${name}=${value}`
          if (options.path) cookie += `; path=${options.path}`
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`
          if (options.domain) cookie += `; domain=${options.domain}`
          if (options.secure) cookie += '; secure'
          document.cookie = cookie
        },
        remove(name: string, options: { path?: string }) {
          if (typeof document === 'undefined') return
          let cookie = `${name}=; max-age=0`
          if (options.path) cookie += `; path=${options.path}`
          document.cookie = cookie
        }
      }
    }
  )
} 