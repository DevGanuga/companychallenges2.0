'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import type { ChallengeLabel, ChallengeLabelInsert } from '@/lib/types/database'

export type LabelsResult = 
  | { success: true; data: ChallengeLabel[] }
  | { success: false; error: string }

export type LabelResult = 
  | { success: true; data: ChallengeLabel }
  | { success: false; error: string }

/**
 * Get all custom labels for a challenge
 */
export async function getChallengeLabels(challengeId: string): Promise<LabelsResult> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('challenge_labels')
      .select('*')
      .eq('challenge_id', challengeId)

    if (error) {
      console.error('Error fetching labels:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ChallengeLabel[] }
  } catch (err) {
    console.error('Unexpected error fetching labels:', err)
    return { success: false, error: 'Failed to fetch labels' }
  }
}

/**
 * Set/update a label for a challenge
 */
export async function setLabel(
  challengeId: string,
  key: string,
  value: string
): Promise<LabelResult> {
  try {
    const supabase = createAdminClient()

    // Upsert the label
    const { data, error } = await supabase
      .from('challenge_labels')
      .upsert(
        { challenge_id: challengeId, key, value },
        { onConflict: 'challenge_id,key' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error setting label:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/c/[slug]`, 'page')
    revalidatePath(`/admin/challenges/${challengeId}`)

    return { success: true, data: data as ChallengeLabel }
  } catch (err) {
    console.error('Unexpected error setting label:', err)
    return { success: false, error: 'Failed to set label' }
  }
}

/**
 * Set multiple labels at once
 */
export async function setLabels(
  challengeId: string,
  labels: { key: string; value: string }[]
): Promise<LabelsResult> {
  try {
    const supabase = createAdminClient()

    // Prepare the upsert data
    const upsertData = labels.map(({ key, value }) => ({
      challenge_id: challengeId,
      key,
      value
    }))

    // Upsert all labels
    const { data, error } = await supabase
      .from('challenge_labels')
      .upsert(upsertData, { onConflict: 'challenge_id,key' })
      .select()

    if (error) {
      console.error('Error setting labels:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/c/[slug]`, 'page')
    revalidatePath(`/admin/challenges/${challengeId}`)

    return { success: true, data: data as ChallengeLabel[] }
  } catch (err) {
    console.error('Unexpected error setting labels:', err)
    return { success: false, error: 'Failed to set labels' }
  }
}

/**
 * Delete a specific label (revert to default)
 */
export async function deleteLabel(
  challengeId: string,
  key: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('challenge_labels')
      .delete()
      .eq('challenge_id', challengeId)
      .eq('key', key)

    if (error) {
      console.error('Error deleting label:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/c/[slug]`, 'page')
    revalidatePath(`/admin/challenges/${challengeId}`)

    return { success: true }
  } catch (err) {
    console.error('Unexpected error deleting label:', err)
    return { success: false, error: 'Failed to delete label' }
  }
}

/**
 * Delete all custom labels for a challenge
 */
export async function deleteAllLabels(
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('challenge_labels')
      .delete()
      .eq('challenge_id', challengeId)

    if (error) {
      console.error('Error deleting all labels:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/c/[slug]`, 'page')
    revalidatePath(`/admin/challenges/${challengeId}`)

    return { success: true }
  } catch (err) {
    console.error('Unexpected error deleting all labels:', err)
    return { success: false, error: 'Failed to delete labels' }
  }
}
