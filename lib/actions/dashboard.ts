'use server'

import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'

export interface DashboardStats {
  totalClients: number
  activeChallenges: number
  totalAssignments: number
  thisMonthViews: number
}

export interface RecentActivity {
  id: string
  type: 'client_created' | 'challenge_created' | 'assignment_created' | 'challenge_archived'
  title: string
  timestamp: string
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Check configuration first
  const config = isSupabaseConfigured()
  if (!config.valid) {
    console.warn('[getDashboardStats] Supabase not configured:', config.missing)
    return {
      totalClients: 0,
      activeChallenges: 0,
      totalAssignments: 0,
      thisMonthViews: 0,
    }
  }

  try {
    const supabase = createAdminClient()

    // Run all count queries in parallel
    const [clientsResult, challengesResult, assignmentsResult, eventsResult] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('is_archived', false),
      supabase.from('assignments').select('*', { count: 'exact', head: true }),
      // Get views from this month
      supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'challenge_view')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    return {
      totalClients: clientsResult.count ?? 0,
      activeChallenges: challengesResult.count ?? 0,
      totalAssignments: assignmentsResult.count ?? 0,
      thisMonthViews: eventsResult.count ?? 0,
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err)
    return {
      totalClients: 0,
      activeChallenges: 0,
      totalAssignments: 0,
      thisMonthViews: 0,
    }
  }
}

/**
 * Get recent activity for the dashboard
 */
export async function getRecentActivity(limit: number = 5): Promise<RecentActivity[]> {
  // Check configuration first
  const config = isSupabaseConfigured()
  if (!config.valid) {
    console.warn('[getRecentActivity] Supabase not configured:', config.missing)
    return []
  }

  try {
    const supabase = createAdminClient()

    // Get recent clients, challenges, and assignments
    const [clientsResult, challengesResult, assignmentsResult] = await Promise.all([
      supabase
        .from('clients')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('challenges')
        .select('id, internal_name, created_at, is_archived')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('assignments')
        .select('id, internal_title, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
    ])

    const activities: RecentActivity[] = []

    // Add client activities
    if (clientsResult.data) {
      for (const client of clientsResult.data) {
        activities.push({
          id: `client-${client.id}`,
          type: 'client_created',
          title: `Client "${client.name}" created`,
          timestamp: client.created_at,
        })
      }
    }

    // Add challenge activities
    if (challengesResult.data) {
      for (const challenge of challengesResult.data) {
        activities.push({
          id: `challenge-${challenge.id}`,
          type: challenge.is_archived ? 'challenge_archived' : 'challenge_created',
          title: `Challenge "${challenge.internal_name}" ${challenge.is_archived ? 'archived' : 'created'}`,
          timestamp: challenge.created_at,
        })
      }
    }

    // Add assignment activities
    if (assignmentsResult.data) {
      for (const assignment of assignmentsResult.data) {
        activities.push({
          id: `assignment-${assignment.id}`,
          type: 'assignment_created',
          title: `Assignment "${assignment.internal_title}" created`,
          timestamp: assignment.created_at,
        })
      }
    }

    // Sort by timestamp and take the most recent
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  } catch (err) {
    console.error('Error fetching recent activity:', err)
    return []
  }
}
