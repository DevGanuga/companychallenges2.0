import { getAssignments } from '@/lib/actions/assignments'
import { AssignmentsPageClient } from './page-client'

export default async function AssignmentsPage() {
  // Only show assignments that were saved for future reference (is_reusable: true)
  const result = await getAssignments({ reusableOnly: true })

  const assignments = result.success ? result.data : []
  const error = result.success ? null : result.error

  return <AssignmentsPageClient initialAssignments={assignments} initialError={error} />
}
