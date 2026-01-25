import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

interface LegacySlugPageProps {
  params: Promise<{ legacySlug: string }>
}

/**
 * Legacy URL Support
 * 
 * Handles URLs like /MMXdXcr (from legacy app) and redirects to /c/[slug]
 * This allows existing links from the old platform to continue working.
 */
export default async function LegacySlugPage({ params }: LegacySlugPageProps) {
  const { legacySlug } = await params

  // Skip certain paths that shouldn't be treated as legacy slugs
  const reservedPaths = [
    'admin', 'participant', 'sign-in', 'sign-up', 'api', 
    'c', 'a', '_next', 'favicon.ico', 'favicon.svg'
  ]
  
  if (reservedPaths.includes(legacySlug.toLowerCase())) {
    notFound()
  }

  const supabase = createAdminClient()

  // Check if this slug exists as a challenge
  const { data: challenge } = await supabase
    .from('challenges')
    .select('slug')
    .eq('slug', legacySlug)
    .single()

  if (challenge) {
    redirect(`/c/${challenge.slug}`)
  }

  // Check if this slug exists as an assignment
  const { data: assignment } = await supabase
    .from('assignments')
    .select('slug')
    .eq('slug', legacySlug)
    .single()

  if (assignment) {
    redirect(`/a/${assignment.slug}`)
  }

  // No matching challenge or assignment found
  notFound()
}

// Generate metadata for SEO
export async function generateMetadata({ params }: LegacySlugPageProps) {
  const { legacySlug } = await params
  return {
    title: `Redirecting... | ${legacySlug}`,
    robots: 'noindex, nofollow' // Don't index redirect pages
  }
}
