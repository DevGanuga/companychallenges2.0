import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Check if Supabase is properly configured for server-side use
 */
export function isSupabaseConfigured(): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  return { valid: missing.length === 0, missing }
}

/**
 * Create a Supabase client for use in server components and API routes.
 * Handles cookie management for auth state.
 */
export async function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Server] Missing environment variables:', {
      url: supabaseUrl ? 'SET' : 'MISSING',
      anonKey: supabaseAnonKey ? 'SET' : 'MISSING'
    })
    throw new Error('Missing Supabase configuration. Check environment variables.')
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  })
}

/**
 * Create a Supabase admin client with service role key.
 * Use only in secure server-side contexts (API routes, server actions).
 * This bypasses RLS policies.
 */
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('[Supabase Admin] Missing environment variables:', {
      url: supabaseUrl ? 'SET' : 'MISSING',
      serviceRoleKey: supabaseServiceRoleKey ? 'SET' : 'MISSING'
    })
    throw new Error('Missing Supabase admin configuration. Check SUPABASE_SERVICE_ROLE_KEY.')
  }

  return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}

