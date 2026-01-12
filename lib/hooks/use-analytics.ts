'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  trackChallengeView,
  trackAssignmentView,
  trackAssignmentComplete,
  trackMediaPlay,
  trackPasswordAttempt,
  trackQuizResponse
} from '@/lib/actions/analytics'

interface AnalyticsContext {
  clientId: string
  challengeId: string
  assignmentId?: string
  sprintId?: string
}

/**
 * Hook for tracking analytics events
 * Provides memoized tracking functions and automatic page view tracking
 */
export function useAnalytics(context: AnalyticsContext) {
  const { clientId, challengeId, assignmentId, sprintId } = context
  const hasTrackedView = useRef(false)

  // Track challenge view on mount (only once)
  const trackChallengeViewOnce = useCallback(() => {
    if (hasTrackedView.current) return
    hasTrackedView.current = true
    trackChallengeView(clientId, challengeId)
  }, [clientId, challengeId])

  // Track assignment view on mount (only once)
  const trackAssignmentViewOnce = useCallback(() => {
    if (hasTrackedView.current || !assignmentId) return
    hasTrackedView.current = true
    trackAssignmentView(clientId, challengeId, assignmentId, sprintId)
  }, [clientId, challengeId, assignmentId, sprintId])

  // Track assignment completion
  const onComplete = useCallback(() => {
    if (!assignmentId) return
    trackAssignmentComplete(clientId, challengeId, assignmentId, sprintId)
  }, [clientId, challengeId, assignmentId, sprintId])

  // Track media play
  const onMediaPlay = useCallback(
    (metadata?: { mediaType?: string; duration?: number }) => {
      if (!assignmentId) return
      trackMediaPlay(clientId, challengeId, assignmentId, metadata)
    },
    [clientId, challengeId, assignmentId]
  )

  // Track password attempt
  const onPasswordAttempt = useCallback(
    (success: boolean) => {
      if (!assignmentId) return
      trackPasswordAttempt(clientId, challengeId, assignmentId, success)
    },
    [clientId, challengeId, assignmentId]
  )

  // Track quiz response
  const onQuizResponse = useCallback(
    (questionId: string, response: unknown) => {
      if (!assignmentId) return
      trackQuizResponse(clientId, challengeId, assignmentId, { questionId, response })
    },
    [clientId, challengeId, assignmentId]
  )

  return {
    trackChallengeViewOnce,
    trackAssignmentViewOnce,
    onComplete,
    onMediaPlay,
    onPasswordAttempt,
    onQuizResponse
  }
}

/**
 * Simple hook for tracking page views on mount
 */
export function useChallengePageView(clientId: string, challengeId: string) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true
    trackChallengeView(clientId, challengeId)
  }, [clientId, challengeId])
}

/**
 * Simple hook for tracking assignment page views on mount
 */
export function useAssignmentPageView(
  clientId: string,
  challengeId: string,
  assignmentId: string,
  sprintId?: string
) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true
    trackAssignmentView(clientId, challengeId, assignmentId, sprintId)
  }, [clientId, challengeId, assignmentId, sprintId])
}
