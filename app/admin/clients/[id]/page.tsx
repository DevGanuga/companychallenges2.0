import { notFound } from 'next/navigation'
import { getClient } from '@/lib/actions/clients'
import { getChallenges } from '@/lib/actions/challenges'
import { ClientDetailClient } from './page-client'

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params

  const [clientResult, challengesResult] = await Promise.all([
    getClient(id),
    getChallenges({ clientId: id, includeArchived: true }),
  ])

  if (!clientResult.success || !clientResult.data) {
    notFound()
  }

  const client = clientResult.data
  const challenges = challengesResult.success ? challengesResult.data : []
  const error = challengesResult.success ? null : challengesResult.error

  return (
    <ClientDetailClient
      client={client}
      initialChallenges={challenges}
      initialError={error}
    />
  )
}
