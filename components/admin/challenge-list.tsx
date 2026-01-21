'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Badge, Spinner } from '@/components/ui'
import { archiveChallenge, restoreChallenge, duplicateChallenge, deleteChallenge } from '@/lib/actions/challenges'
import type { ChallengeWithClient } from '@/lib/types/database'

interface ChallengeListProps {
  challenges: ChallengeWithClient[]
  onEdit: (challenge: ChallengeWithClient) => void
  onRefresh: () => void
}

export function ChallengeList({ challenges, onEdit, onRefresh }: ChallengeListProps) {
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleArchive = async (challenge: ChallengeWithClient) => {
    setActionId(challenge.id)
    setError(null)

    try {
      const result = challenge.is_archived
        ? await restoreChallenge(challenge.id)
        : await archiveChallenge(challenge.id)

      if (result.success) {
        onRefresh()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to update challenge')
    } finally {
      setActionId(null)
    }
  }

  const handleDuplicate = async (challenge: ChallengeWithClient) => {
    setActionId(challenge.id)
    setError(null)

    try {
      const result = await duplicateChallenge(challenge.id)
      if (result.success) {
        onRefresh()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to duplicate challenge')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (challenge: ChallengeWithClient) => {
    if (!confirm(`Are you sure you want to permanently delete "${challenge.internal_name}"? This cannot be undone.`)) {
      return
    }

    setActionId(challenge.id)
    setError(null)

    try {
      const result = await deleteChallenge(challenge.id)
      if (result.success) {
        onRefresh()
      } else {
        setError(result.error ?? 'Failed to delete challenge')
      }
    } catch (err) {
      setError('Failed to delete challenge')
    } finally {
      setActionId(null)
    }
  }

  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyUrl = (challenge: ChallengeWithClient) => {
    const url = `${window.location.origin}/c/${challenge.slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(challenge.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getPublicUrl = (slug: string) => {
    if (typeof window === 'undefined') return `/c/${slug}`
    return `${window.location.origin}/c/${slug}`
  }

  if (challenges.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-error-subtle)] p-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-fg-muted)]">
                Challenge
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-fg-muted)]">
                URL
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-fg-muted)]">
                Client
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-fg-muted)]">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--color-fg-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {challenges.map((challenge) => (
              <tr key={challenge.id} className="hover:bg-[var(--color-bg-subtle)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-[var(--radius-sm)]"
                      style={{ backgroundColor: challenge.brand_color || '#6b7280' }}
                    />
                    <div>
                      <p className="font-medium text-[var(--color-fg)]">
                        {challenge.internal_name}
                      </p>
                      {challenge.public_title && (
                        <p className="text-xs text-[var(--color-fg-subtle)]">
                          {challenge.public_title}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-[var(--color-fg-muted)] bg-[var(--color-bg-muted)] px-2 py-1 rounded max-w-[200px] truncate">
                      /c/{challenge.slug}
                    </code>
                    <button
                      onClick={() => copyUrl(challenge)}
                      className="p-1 rounded hover:bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === challenge.id ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={getPublicUrl(challenge.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[var(--color-fg-muted)]">
                    {challenge.client.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={challenge.is_archived ? 'outline' : 'success'}>
                      {challenge.is_archived ? 'Archived' : 'Live'}
                    </Badge>
                    {!challenge.is_archived && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/challenges/${challenge.id}`}>
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(challenge)}
                      disabled={actionId === challenge.id}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(challenge)}
                      disabled={actionId === challenge.id}
                    >
                      {actionId === challenge.id ? <Spinner size="sm" /> : 'Duplicate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(challenge)}
                      disabled={actionId === challenge.id}
                    >
                      {challenge.is_archived ? 'Restore' : 'Archive'}
                    </Button>
                    {challenge.is_archived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(challenge)}
                        disabled={actionId === challenge.id}
                        className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-subtle)]"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  )
}
