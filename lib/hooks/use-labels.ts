'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DEFAULT_LABELS, ChallengeLabel } from '@/lib/types/database'

interface UseLabelsOptions {
  /** Challenge ID to fetch custom labels for */
  challengeId?: string
  /** Pre-loaded custom labels (to avoid fetch) */
  initialLabels?: ChallengeLabel[]
}

interface UseLabelsReturn {
  /** Get a label value by key, returns custom value or default */
  getLabel: (key: string) => string
  /** All labels (merged defaults + custom) */
  labels: Record<string, string>
  /** Whether labels are still loading */
  isLoading: boolean
  /** Any error that occurred */
  error: string | null
}

/**
 * Hook for getting customizable labels for a challenge.
 * Falls back to DEFAULT_LABELS when no custom label is defined.
 * 
 * @example
 * const { getLabel } = useLabels({ challengeId: 'xxx' })
 * // Returns 'Missie' if customized, otherwise 'Sprint'
 * const sprintLabel = getLabel('sprint')
 */
export function useLabels({ 
  challengeId, 
  initialLabels 
}: UseLabelsOptions = {}): UseLabelsReturn {
  const [customLabels, setCustomLabels] = useState<ChallengeLabel[]>(initialLabels || [])
  const [isLoading, setIsLoading] = useState(!initialLabels && !!challengeId)
  const [error, setError] = useState<string | null>(null)

  // Fetch custom labels from the database
  useEffect(() => {
    if (!challengeId || initialLabels) return

    const fetchLabels = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/labels/${challengeId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch labels')
        }

        const data = await response.json()
        setCustomLabels(data.labels || [])
      } catch (err) {
        console.error('Error fetching labels:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch labels')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabels()
  }, [challengeId, initialLabels])

  // Merge custom labels with defaults
  const labels = useMemo(() => {
    const merged = { ...DEFAULT_LABELS }
    
    for (const label of customLabels) {
      merged[label.key] = label.value
    }
    
    return merged
  }, [customLabels])

  // Get a specific label, with fallback to default
  const getLabel = useCallback((key: string): string => {
    // First check custom labels
    const custom = customLabels.find(l => l.key === key)
    if (custom) return custom.value

    // Then check defaults
    if (key in DEFAULT_LABELS) {
      return DEFAULT_LABELS[key]
    }

    // Return the key itself if not found (for debugging)
    return key
  }, [customLabels])

  return {
    getLabel,
    labels,
    isLoading,
    error
  }
}

/**
 * Static helper to get a label without hooks (for server components)
 */
export function getLabelFromMap(
  customLabels: ChallengeLabel[] | undefined,
  key: string
): string {
  // Check custom labels first
  if (customLabels) {
    const custom = customLabels.find(l => l.key === key)
    if (custom) return custom.value
  }

  // Then check defaults
  if (key in DEFAULT_LABELS) {
    return DEFAULT_LABELS[key]
  }

  return key
}

/**
 * Build labels map from array
 */
export function buildLabelsMap(customLabels: ChallengeLabel[]): Record<string, string> {
  const merged = { ...DEFAULT_LABELS }
  
  for (const label of customLabels) {
    merged[label.key] = label.value
  }
  
  return merged
}
