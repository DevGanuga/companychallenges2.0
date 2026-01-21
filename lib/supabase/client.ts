import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Create a Supabase client for use in browser/client components.
 * Uses the anon key for public access.
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Client] Missing environment variables:', {
      url: supabaseUrl ? 'SET' : 'MISSING',
      anonKey: supabaseAnonKey ? 'SET' : 'MISSING'
    })
    throw new Error('Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

