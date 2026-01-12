'use server'

import { createAdminClient } from '@/lib/supabase/server'

export interface DateRange {
  from: string // ISO date string
  to: string // ISO date string
}

export interface ChallengeStats {
  challengeId: string
  challengeName: string
  clientName: string
  totalViews: number
  uniqueSessions: number
  assignmentViews: number
  mediaPlays: number
  completions: number
}

export interface AssignmentStats {
  assignmentId: string
  assignmentTitle: string
  views: number
  uniqueSessions: number
  mediaPlays: number
  completions: number
  passwordAttempts: number
  passwordSuccesses: number
}

export interface OverviewStats {
  totalChallengeViews: number
  totalAssignmentViews: number
  totalMediaPlays: number
  totalCompletions: number
  uniqueSessions: number
}

/**
 * Get overview analytics stats
 */
export async function getOverviewStats(dateRange?: DateRange): Promise<OverviewStats> {
  const supabase = createAdminClient()

  let query = supabase.from('analytics_events').select('event_type, session_id')

  if (dateRange) {
    query = query.gte('created_at', dateRange.from).lte('created_at', dateRange.to)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Error fetching overview stats:', error)
    return {
      totalChallengeViews: 0,
      totalAssignmentViews: 0,
      totalMediaPlays: 0,
      totalCompletions: 0,
      uniqueSessions: 0
    }
  }

  const uniqueSessions = new Set(data.map(e => e.session_id)).size

  return {
    totalChallengeViews: data.filter(e => e.event_type === 'challenge_view').length,
    totalAssignmentViews: data.filter(e => e.event_type === 'assignment_view').length,
    totalMediaPlays: data.filter(e => e.event_type === 'media_play').length,
    totalCompletions: data.filter(e => e.event_type === 'assignment_complete').length,
    uniqueSessions
  }
}

/**
 * Get analytics stats per challenge
 */
export async function getChallengeStats(dateRange?: DateRange): Promise<ChallengeStats[]> {
  const supabase = createAdminClient()

  // Get all challenges with their clients
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select(`
      id,
      internal_name,
      public_title,
      client:clients (name)
    `)
    .eq('is_archived', false)

  if (challengesError || !challenges) {
    console.error('Error fetching challenges:', challengesError)
    return []
  }

  // Get events
  let eventsQuery = supabase
    .from('analytics_events')
    .select('event_type, challenge_id, session_id')

  if (dateRange) {
    eventsQuery = eventsQuery.gte('created_at', dateRange.from).lte('created_at', dateRange.to)
  }

  const { data: events, error: eventsError } = await eventsQuery

  if (eventsError || !events) {
    console.error('Error fetching events:', eventsError)
    return []
  }

  // Aggregate stats per challenge
  return challenges.map(challenge => {
    const challengeEvents = events.filter(e => e.challenge_id === challenge.id)
    const uniqueSessions = new Set(challengeEvents.map(e => e.session_id)).size
    // Client comes from a join, could be an array or single object
    const clientData = challenge.client as { name: string } | { name: string }[] | null
    const clientName = Array.isArray(clientData) ? clientData[0]?.name : clientData?.name

    return {
      challengeId: challenge.id,
      challengeName: challenge.public_title || challenge.internal_name,
      clientName: clientName || 'Unknown',
      totalViews: challengeEvents.filter(e => e.event_type === 'challenge_view').length,
      uniqueSessions,
      assignmentViews: challengeEvents.filter(e => e.event_type === 'assignment_view').length,
      mediaPlays: challengeEvents.filter(e => e.event_type === 'media_play').length,
      completions: challengeEvents.filter(e => e.event_type === 'assignment_complete').length
    }
  }).sort((a, b) => b.totalViews - a.totalViews)
}

/**
 * Get analytics stats per assignment for a specific challenge
 */
export async function getAssignmentStats(
  challengeId: string,
  dateRange?: DateRange
): Promise<AssignmentStats[]> {
  const supabase = createAdminClient()

  // Get assignments for this challenge through usages
  const { data: usages, error: usagesError } = await supabase
    .from('assignment_usages')
    .select(`
      assignment_id,
      assignment:assignments (
        id,
        internal_title,
        public_title
      )
    `)
    .eq('challenge_id', challengeId)
    .order('position', { ascending: true })

  if (usagesError || !usages) {
    console.error('Error fetching usages:', usagesError)
    return []
  }

  // Get events for this challenge
  let eventsQuery = supabase
    .from('analytics_events')
    .select('event_type, assignment_id, session_id, metadata')
    .eq('challenge_id', challengeId)
    .not('assignment_id', 'is', null)

  if (dateRange) {
    eventsQuery = eventsQuery.gte('created_at', dateRange.from).lte('created_at', dateRange.to)
  }

  const { data: events, error: eventsError } = await eventsQuery

  if (eventsError) {
    console.error('Error fetching events:', eventsError)
    return []
  }

  // Aggregate stats per assignment
  return usages.map(usage => {
    type AssignmentType = { id: string; internal_title: string; public_title: string | null }
    const assignmentData = usage.assignment as AssignmentType | AssignmentType[] | null
    const assignment = Array.isArray(assignmentData) ? assignmentData[0] : assignmentData
    if (!assignment) return null

    const assignmentEvents = (events || []).filter(e => e.assignment_id === assignment.id)
    const uniqueSessions = new Set(assignmentEvents.map(e => e.session_id)).size

    const passwordAttempts = assignmentEvents.filter(e => e.event_type === 'password_attempt')
    const passwordSuccesses = passwordAttempts.filter(e => {
      const metadata = e.metadata as { success?: boolean } | null
      return metadata?.success === true
    })

    return {
      assignmentId: assignment.id,
      assignmentTitle: assignment.public_title || assignment.internal_title,
      views: assignmentEvents.filter(e => e.event_type === 'assignment_view').length,
      uniqueSessions,
      mediaPlays: assignmentEvents.filter(e => e.event_type === 'media_play').length,
      completions: assignmentEvents.filter(e => e.event_type === 'assignment_complete').length,
      passwordAttempts: passwordAttempts.length,
      passwordSuccesses: passwordSuccesses.length
    }
  }).filter((s): s is AssignmentStats => s !== null)
}

/**
 * Get daily view counts for a chart
 */
export async function getDailyViewCounts(
  challengeId?: string,
  days: number = 30
): Promise<{ date: string; views: number; uniqueSessions: number }[]> {
  const supabase = createAdminClient()
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let query = supabase
    .from('analytics_events')
    .select('created_at, session_id, event_type')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('event_type', ['challenge_view', 'assignment_view'])

  if (challengeId) {
    query = query.eq('challenge_id', challengeId)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Error fetching daily views:', error)
    return []
  }

  // Group by date
  const dailyStats = new Map<string, { views: number; sessions: Set<string> }>()

  // Initialize all days in range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0]
    dailyStats.set(dateKey, { views: 0, sessions: new Set() })
  }

  // Aggregate data
  data.forEach(event => {
    const dateKey = event.created_at.split('T')[0]
    const stats = dailyStats.get(dateKey)
    if (stats) {
      stats.views += 1
      stats.sessions.add(event.session_id)
    }
  })

  // Convert to array
  return Array.from(dailyStats.entries()).map(([date, stats]) => ({
    date,
    views: stats.views,
    uniqueSessions: stats.sessions.size
  })).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Export analytics data as CSV
 */
export async function exportAnalyticsCSV(
  challengeId?: string,
  dateRange?: DateRange
): Promise<string> {
  const supabase = createAdminClient()

  let query = supabase
    .from('analytics_events')
    .select(`
      event_type,
      created_at,
      session_id,
      challenge:challenges (internal_name, public_title),
      assignment:assignments (internal_title, public_title),
      client:clients (name)
    `)
    .order('created_at', { ascending: false })

  if (challengeId) {
    query = query.eq('challenge_id', challengeId)
  }

  if (dateRange) {
    query = query.gte('created_at', dateRange.from).lte('created_at', dateRange.to)
  }

  const { data, error } = await query.limit(10000)

  if (error || !data) {
    console.error('Error exporting analytics:', error)
    return ''
  }

  // Build CSV
  const headers = ['Date', 'Event Type', 'Client', 'Challenge', 'Assignment', 'Session ID']
  const rows = data.map(event => {
    type ChallengeType = { internal_name: string; public_title: string | null }
    type AssignmentType = { internal_title: string; public_title: string | null }
    type ClientType = { name: string }

    const challengeData = event.challenge as ChallengeType | ChallengeType[] | null
    const assignmentData = event.assignment as AssignmentType | AssignmentType[] | null
    const clientData = event.client as ClientType | ClientType[] | null

    const challenge = Array.isArray(challengeData) ? challengeData[0] : challengeData
    const assignment = Array.isArray(assignmentData) ? assignmentData[0] : assignmentData
    const client = Array.isArray(clientData) ? clientData[0] : clientData

    return [
      event.created_at,
      event.event_type,
      client?.name || '',
      challenge?.public_title || challenge?.internal_name || '',
      assignment?.public_title || assignment?.internal_title || '',
      event.session_id
    ].map(v => `"${String(v).replace(/"/g, '""')}"`)
  })

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}
