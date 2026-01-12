'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { PasswordGate } from '@/components/public/password-gate'
import { trackChallengeView } from '@/lib/actions/analytics'
import type { Challenge, Assignment, AssignmentUsage } from '@/lib/types/database'

interface ChallengePageClientProps {
  challenge: Challenge
  client: { name: string; logo_url?: string }
  usages: (AssignmentUsage & { assignment: Assignment })[]
  pendingCount: number
  nextRelease?: string
}

export function ChallengePageClient({
  challenge,
  client,
  usages,
  pendingCount,
  nextRelease
}: ChallengePageClientProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<{
    id: string
    title: string
  } | null>(null)
  const hasTrackedView = useRef(false)

  // Track challenge page view on mount (once)
  useEffect(() => {
    if (hasTrackedView.current) return
    hasTrackedView.current = true
    trackChallengeView(challenge.client_id, challenge.id)
  }, [challenge.client_id, challenge.id])

  const title = challenge.show_public_title && challenge.public_title
    ? challenge.public_title
    : client.name

  // Handle password verification
  const handlePasswordSuccess = () => {
    setSelectedAssignment(null)
    // The cookie is set, user can now access the assignment
  }

  // Brand color styling
  const brandStyle = challenge.brand_color
    ? { '--brand-color': challenge.brand_color } as React.CSSProperties
    : {}

  return (
    <>
      {/* Password Gate Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedAssignment(null)}>
          <div onClick={(e) => e.stopPropagation()} className="animate-scale-in">
            <PasswordGate
              assignmentId={selectedAssignment.id}
              assignmentTitle={selectedAssignment.title}
              onSuccess={handlePasswordSuccess}
            />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[var(--color-bg)] animate-fade-in" style={brandStyle}>
        {/* Header */}
        <header
          className="border-b border-[var(--color-border)] relative overflow-hidden"
          style={{
            backgroundColor: challenge.brand_color || 'var(--color-bg-subtle)'
          }}
        >
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />

          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 relative">
            {/* Client Logo */}
            {client.logo_url && (
              <img
                src={client.logo_url}
                alt={client.name}
                className="mb-4 h-12 w-auto animate-slide-down"
              />
            )}

            <h1
              className="text-3xl font-bold sm:text-4xl animate-slide-up"
              style={{
                color: challenge.brand_color ? '#ffffff' : 'var(--color-fg)'
              }}
            >
              {title}
            </h1>

            {/* Visual */}
            {challenge.visual_url && (
              <div className="mt-6 overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] animate-slide-up delay-100">
                <img
                  src={challenge.visual_url}
                  alt={title}
                  className="h-auto w-full max-h-64 object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </div>
        </header>

        {/* Description */}
        {challenge.description && (
          <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-slide-up delay-150">
              <div
                className="prose prose-gray max-w-none dark:prose-invert prose-sm"
                dangerouslySetInnerHTML={{ __html: challenge.description }}
              />
            </div>
          </section>
        )}

        {/* Assignment List */}
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-[var(--color-fg)] animate-slide-up delay-200">
            Assignments
          </h2>

          {usages.length === 0 && pendingCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-bounce-in">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-muted)]">
                <ListIcon className="h-8 w-8 text-[var(--color-fg-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-fg)]">No assignments yet</h3>
              <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                Check back soon for new content.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-stagger">
              {usages.map((usage, index) => {
                const assignment = usage.assignment
                const hasPassword = !!assignment.password_hash
                const displayTitle = assignment.public_title || assignment.internal_title

                return (
                  <AssignmentCard
                    key={usage.id}
                    index={index + 1}
                    assignment={assignment}
                    label={usage.label}
                    hasPassword={hasPassword}
                    challengeSlug={challenge.slug}
                    onPasswordRequired={() => setSelectedAssignment({
                      id: assignment.id,
                      title: displayTitle
                    })}
                  />
                )
              })}

              {/* Pending assignments indicator */}
              {pendingCount > 0 && (
                <div className="mt-8 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8 text-center">
                  <div className="mb-3 flex items-center justify-center gap-2 text-[var(--color-fg-muted)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-subtle)]">
                      <ClockIcon className="h-5 w-5 text-[var(--color-accent)]" />
                    </div>
                  </div>
                  <span className="font-semibold text-[var(--color-fg)]">
                    {pendingCount} more assignment{pendingCount !== 1 ? 's' : ''} coming soon
                  </span>
                  {nextRelease && (
                    <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
                      Next release: {formatDate(nextRelease)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Support Info */}
        {challenge.support_info && (
          <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-info-subtle)] text-[var(--color-info)]">
                  <HelpIcon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-[var(--color-fg)]">Need Help?</h3>
              </div>
              <div
                className="prose prose-gray max-w-none dark:prose-invert prose-sm"
                dangerouslySetInnerHTML={{ __html: challenge.support_info }}
              />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-[var(--color-fg-muted)]">
              Powered by <span className="font-medium text-[var(--color-fg)]">Company Challenges</span>
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

interface AssignmentCardProps {
  index: number
  assignment: Assignment
  label?: string | null
  hasPassword: boolean
  challengeSlug: string
  onPasswordRequired: () => void
}

function AssignmentCard({
  index,
  assignment,
  label,
  hasPassword,
  challengeSlug,
}: AssignmentCardProps) {
  const title = assignment.public_title || assignment.internal_title
  const href = `/a/${assignment.slug}?from=${challengeSlug}`

  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 active:translate-y-0"
    >
      {/* Index Number */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)] text-sm font-semibold text-[var(--color-fg-muted)] transition-all duration-200 group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:scale-110">
        {index}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[var(--color-fg)] transition-colors group-hover:text-[var(--color-accent)]">
            {title}
          </h3>
          {hasPassword && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-warning-subtle)] px-2 py-0.5 text-xs text-[var(--color-warning-fg)]">
              <LockIcon className="h-3 w-3" />
              Protected
            </span>
          )}
        </div>

        {assignment.subtitle && (
          <p className="mt-1.5 text-sm text-[var(--color-fg-muted)] line-clamp-2">
            {assignment.subtitle}
          </p>
        )}

        {label && (
          <span className="mt-2 inline-block rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            {label}
          </span>
        )}
      </div>

      {/* Visual Preview */}
      {assignment.visual_url && (
        <div className="hidden shrink-0 sm:block overflow-hidden rounded-[var(--radius-lg)]">
          <img
            src={assignment.visual_url}
            alt=""
            className="h-16 w-24 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      )}

      {/* Arrow */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] transition-all duration-200 group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:translate-x-1">
        <ChevronRightIcon className="h-4 w-4" />
      </div>
    </Link>
  )
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

// Icons
function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  )
}
