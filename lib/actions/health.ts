'use server'

import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase/server'

export type HealthStatus = {
  database: {
    configured: boolean
    connected: boolean
    error?: string
    missing?: string[]
  }
  tables: {
    clients: boolean
    challenges: boolean
    assignments: boolean
  }
}

/**
 * Check the health status of the application
 * Used to show configuration errors in the admin panel
 */
export async function checkHealth(): Promise<HealthStatus> {
  const status: HealthStatus = {
    database: {
      configured: false,
      connected: false,
    },
    tables: {
      clients: false,
      challenges: false,
      assignments: false,
    },
  }

  // Check configuration
  const config = isSupabaseConfigured()
  status.database.configured = config.valid
  
  if (!config.valid) {
    status.database.missing = config.missing
    status.database.error = `Missing environment variables: ${config.missing.join(', ')}`
    return status
  }

  // Try to connect
  try {
    const supabase = createAdminClient()
    
    // Test connection with a simple query
    const { error: connectionError } = await supabase
      .from('clients')
      .select('id')
      .limit(1)

    if (connectionError) {
      status.database.error = connectionError.message
      if (connectionError.message.includes('Invalid API key')) {
        status.database.error = 'Invalid API key. Check your SUPABASE_SERVICE_ROLE_KEY.'
      }
      return status
    }

    status.database.connected = true
    status.tables.clients = true

    // Check other tables
    const { error: challengesError } = await supabase
      .from('challenges')
      .select('id')
      .limit(1)
    status.tables.challenges = !challengesError

    const { error: assignmentsError } = await supabase
      .from('assignments')
      .select('id')
      .limit(1)
    status.tables.assignments = !assignmentsError

  } catch (err) {
    status.database.error = err instanceof Error ? err.message : 'Unknown connection error'
  }

  return status
}

/**
 * Quick check if database is operational
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const config = isSupabaseConfigured()
    if (!config.valid) return false

    const supabase = createAdminClient()
    const { error } = await supabase.from('clients').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
