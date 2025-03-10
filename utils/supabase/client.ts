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
      options: {
        auth: {
          flowType: process.env.NODE_ENV === 'development' ? 'implicit' : 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    }
  )
} 