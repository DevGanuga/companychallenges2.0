import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

// Import the actual page components
import ChallengePage from '@/app/(public)/c/[slug]/page'
import AssignmentPage from '@/app/(public)/a/[slug]/page'

interface LegacySlugPageProps {
  params: Promise<{ legacySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * Root-level URL Support
 * 
 * Serves challenges and assignments directly at /MMXdXcr (no /c/ or /a/ prefix)
 * This supports legacy URLs from the old platform.
 */
export default async function LegacySlugPage({ params, searchParams }: LegacySlugPageProps) {
  const { legacySlug } = await params

  // Skip certain paths that shouldn't be treated as slugs
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
    // Render the challenge page directly (no redirect!)
    return <ChallengePage params={Promise.resolve({ slug: legacySlug })} />
  }

  // Check if this slug exists as an assignment
  const { data: assignment } = await supabase
    .from('assignments')
    .select('slug')
    .eq('slug', legacySlug)
    .single()

  if (assignment) {
    // Render the assignment page directly (no redirect!)
    return <AssignmentPage params={Promise.resolve({ slug: legacySlug })} searchParams={searchParams} />
  }

  // No matching challenge or assignment found
  notFound()
}

// Generate metadata dynamically based on what we find
export async function generateMetadata({ params }: LegacySlugPageProps) {
  const { legacySlug } = await params
  
  const supabase = createAdminClient()

  // Check challenge
  const { data: challenge } = await supabase
    .from('challenges')
    .select('public_title, internal_name')
    .eq('slug', legacySlug)
    .single()

  if (challenge) {
    return {
      title: challenge.public_title || challenge.internal_name || 'Challenge',
    }
  }

  // Check assignment
  const { data: assignment } = await supabase
    .from('assignments')
    .select('public_title, internal_title')
    .eq('slug', legacySlug)
    .single()

  if (assignment) {
    return {
      title: assignment.public_title || assignment.internal_title || 'Assignment',
    }
  }

  return {
    title: 'Not Found',
  }
}
