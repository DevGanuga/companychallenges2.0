import { notFound } from 'next/navigation'
import { 
  getPublicChallenge, 
  getPublicAssignmentUsages, 
  getPendingAssignmentUsages,
  getPublicSprints,
} from '@/lib/actions/public'
import { getMilestonesForChallenge } from '@/lib/actions/milestones'
import { AssignmentsGridClient } from './page-client'

interface AssignmentsGridPageProps {
  params: Promise<{ slug: string }>
}

export default async function AssignmentsGridPage({ params }: AssignmentsGridPageProps) {
  const { slug } = await params
  const result = await getPublicChallenge(slug)

  if (!result.success) {
    notFound()
  }

  const { challenge, client } = result.data
  const features = challenge.features || {}

  const [usagesResult, pendingInfo, sprintsResult, milestonesResult] = await Promise.all([
    getPublicAssignmentUsages(challenge.id),
    getPendingAssignmentUsages(challenge.id),
    getPublicSprints(challenge.id),
    features.milestones ? getMilestonesForChallenge(challenge.id) : Promise.resolve({ success: true, data: [] })
  ])

  const usages = usagesResult.success ? usagesResult.data : []
  const sprints = sprintsResult.success ? sprintsResult.data : []
  const milestones = milestonesResult.success ? milestonesResult.data : []

  return (
    <AssignmentsGridClient
      challenge={challenge}
      client={client}
      usages={usages}
      sprints={sprints}
      milestones={milestones}
      pendingCount={pendingInfo.count}
    />
  )
}

export async function generateMetadata({ params }: AssignmentsGridPageProps) {
  const { slug } = await params
  const result = await getPublicChallenge(slug)

  if (!result.success) {
    return {
      title: 'Challenge Not Found'
    }
  }

  const { challenge, client } = result.data

  const title = challenge.show_public_title && challenge.public_title
    ? challenge.public_title
    : client.name

  return {
    title: `Assignments | ${title}`,
  }
}
