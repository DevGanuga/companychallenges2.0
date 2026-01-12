'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Event types matching the database constraint
export type AnalyticsEventType =
  | 'challenge_view'
  | 'assignment_view'
  | 'assignment_complete'
  | 'media_play'
  | 'password_attempt'
  | 'quiz_response'

interface TrackEventParams {
  eventType: AnalyticsEventType
  clientId: string
  challengeId: string
  assignmentId?: string
  sprintId?: string
  metadata?: Record<string, unknown>
}

/**
 * Generate or retrieve anonymous session ID for analytics
 * Privacy-first: No personal identifiers, no cross-session tracking in Collective Mode
 */
async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies()
  const existingSession = cookieStore.get('analytics_session')?.value

  if (existingSession) {
    return existingSession
  }

  // Generate new anonymous session ID
  const sessionId = crypto.randomUUID()

  // Set session cookie (expires in 24 hours for privacy)
  cookieStore.set('analytics_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  })

  return sessionId
}

/**
 * Track an analytics event
 * Anonymous by default - no personal identifiers stored
 */
export async function trackEvent(params: TrackEventParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const sessionId = await getOrCreateSessionId()

    const { error } = await supabase.from('analytics_events').insert({
      event_type: params.eventType,
      client_id: params.clientId,
      challenge_id: params.challengeId,
      assignment_id: params.assignmentId || null,
      sprint_id: params.sprintId || null,
      session_id: sessionId,
      metadata: params.metadata || null
    })

    if (error) {
      console.error('Analytics tracking error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Analytics tracking error:', err)
    return { success: false, error: 'Failed to track event' }
  }
}

/**
 * Track challenge page view
 */
export async function trackChallengeView(
  clientId: string,
  challengeId: string
): Promise<{ success: boolean }> {
  return trackEvent({
    eventType: 'challenge_view',
    clientId,
    challengeId
  })
}

/**
 * Track assignment page view
 */
export async function trackAssignmentView(
  clientId: string,
  challengeId: string,
  assignmentId: string,
  sprintId?: string
): Promise<{ success: boolean }> {
  return trackEvent({
    eventType: 'assignment_view',
    clientId,
    challengeId,
    assignmentId,
    sprintId
  })
}

/**
 * Track assignment completion
 */
export async function trackAssignmentComplete(
  clientId: string,
  challengeId: string,
  assignmentId: string,
  sprintId?: string
): Promise<{ success: boolean }> {
  return trackEvent({
    eventType: 'assignment_complete',
    clientId,
    challengeId,
    assignmentId,
    sprintId
  })
}

/**
 * Track media play event
 */
export async function trackMediaPlay(
  clientId: string,
  challengeId: string,
  assignmentId: string,
  metadata?: { mediaType?: string; duration?: number }
): Promise<{ success: boolean }> {
  return trackEvent({
    eventType: 'media_play',
    clientId,
    challengeId,
    assignmentId,
    metadata
  })
}

/**
 * Track password attempt (success or failure)
 */
export async function trackPasswordAttempt(
  clientId: string,
  challengeId: string,
  assignmentId: string,
  success: boolean
): Promise<{ success: boolean }> {
  return trackEvent({
    eventType: 'password_attempt',
    clientId,
    challengeId,
    assignmentId,
    metadata: { success }
  })
}

/**
 * Track quiz response
 */
export async function trackQuizResponse(
  clientId: string,
  challengeId: string,
  assignmentId: string,
  metadata: { questionId: string; response: unknown }
): Promise<{ success: boolean }> {
  return trackEvent({
    eventType: 'quiz_response',
    clientId,
    challengeId,
    assignmentId,
    metadata
  })
}
