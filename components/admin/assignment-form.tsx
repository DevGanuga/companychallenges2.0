'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Spinner, RichTextEditor } from '@/components/ui'
import { createAssignment, updateAssignment, createAssignmentForChallenge } from '@/lib/actions/assignments'
import type { Assignment, AssignmentWithUsages } from '@/lib/types/database'
import { cn } from '@/lib/utils/cn'

interface AssignmentFormProps {
  assignment?: AssignmentWithUsages | null
  challengeId?: string // When provided, creates assignment within challenge context
  sprintId?: string | null
  open: boolean
  onClose: () => void
  onSuccess?: (assignment: Assignment) => void
}

export function AssignmentForm({
  assignment,
  challengeId,
  sprintId,
  open,
  onClose,
  onSuccess
}: AssignmentFormProps) {
  const isEditing = !!assignment
  const isCreatingForChallenge = !isEditing && !!challengeId
  const usageCount = assignment?.assignment_usages?.length ?? 0
  const isSharedAssignment = usageCount > 1

  // Form state
  const [internalTitle, setInternalTitle] = useState(assignment?.internal_title ?? '')
  const [publicTitle, setPublicTitle] = useState(assignment?.public_title ?? '')
  const [subtitle, setSubtitle] = useState(assignment?.subtitle ?? '')
  const [description, setDescription] = useState(assignment?.description ?? '')
  const [mediaUrl, setMediaUrl] = useState(assignment?.media_url ?? '')
  const [visualUrl, setVisualUrl] = useState(assignment?.visual_url ?? '')
  const [password, setPassword] = useState('')
  const [removePassword, setRemovePassword] = useState(false)
  const [saveForFutureReference, setSaveForFutureReference] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasPassword = assignment?.password_hash !== null

  // Reset form when opening
  useEffect(() => {
    if (open && !isEditing) {
      setInternalTitle('')
      setPublicTitle('')
      setSubtitle('')
      setDescription('')
      setMediaUrl('')
      setVisualUrl('')
      setPassword('')
      setRemovePassword(false)
      setSaveForFutureReference(true)
    }
  }, [open, isEditing])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      let result

      if (isEditing) {
        // Update existing assignment
        result = await updateAssignment(assignment.id, {
          internal_title: internalTitle,
          public_title: publicTitle || null,
          subtitle: subtitle || null,
          description: description || null,
          media_url: mediaUrl || null,
          visual_url: visualUrl || null,
          password: removePassword ? null : (password || undefined),
        })
      } else if (isCreatingForChallenge) {
        // Create assignment within challenge context
        result = await createAssignmentForChallenge(
          {
            internal_title: internalTitle,
            public_title: publicTitle || null,
            subtitle: subtitle || null,
            description: description || null,
            media_url: mediaUrl || null,
            visual_url: visualUrl || null,
            password: password || undefined,
            is_reusable: saveForFutureReference,
          },
          challengeId,
          sprintId
        )
      } else {
        // Create standalone assignment
        result = await createAssignment({
          internal_title: internalTitle,
          public_title: publicTitle || null,
          subtitle: subtitle || null,
          description: description || null,
          media_url: mediaUrl || null,
          visual_url: visualUrl || null,
          password: password || undefined,
          is_reusable: saveForFutureReference,
        })
      }

      if (result.success) {
        onSuccess?.(result.data)
        onClose()
      } else {
        setError(result.error)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl animate-scale-in">
        <div className="rounded-2xl bg-[var(--color-bg-elevated)] shadow-2xl overflow-hidden border border-[var(--color-border)]">

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-fg)]">
                {isEditing ? 'Edit Assignment' : 'Create Assignment'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
            {/* Shared assignment warning */}
            {isEditing && isSharedAssignment && (
              <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <WarningIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-200">
                    Shared in {usageCount} challenges
                  </p>
                  <p className="text-amber-200/80">
                    Changes will apply everywhere this is used.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-[var(--color-error-subtle)] p-4 text-sm text-[var(--color-error)]">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <Input
                label="Internal Title"
                value={internalTitle}
                onChange={(e) => setInternalTitle(e.target.value)}
                placeholder="e.g. Week 1: Introduction"
                hint="Admin reference only"
                autoFocus
              />

              <Input
                label="Public Title"
                value={publicTitle}
                onChange={(e) => setPublicTitle(e.target.value)}
                placeholder="e.g. Getting Started"
                hint="What participants will see (optional)"
              />

              <Input
                label="Subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Learn the fundamentals..."
                hint="Short teaser text (optional)"
              />
            </div>

            {/* Description */}
            <RichTextEditor
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="Write your content here... Use the toolbar to format text, add links, images, and videos."
            />

            {/* Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[var(--color-fg)] block mb-2">
                  Cover Image
                </label>
                <div className={cn(
                  "aspect-video rounded-xl border-2 border-dashed flex items-center justify-center mb-2 overflow-hidden",
                  visualUrl
                    ? "border-[var(--color-accent)] bg-[var(--color-bg)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-muted)]"
                )}>
                  {visualUrl ? (
                    <img
                      src={visualUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span className="text-xs text-[var(--color-fg-subtle)]">No image</span>
                  )}
                </div>
                <Input
                  value={visualUrl}
                  onChange={(e) => setVisualUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--color-fg)] block mb-2">
                  Video URL
                </label>
                <div className={cn(
                  "aspect-video rounded-xl border-2 border-dashed flex items-center justify-center mb-2 overflow-hidden",
                  mediaUrl
                    ? "border-[var(--color-secondary)] bg-[var(--color-bg)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-muted)]"
                )}>
                  {mediaUrl ? (
                    <iframe
                      src={getEmbedUrl(mediaUrl)}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <span className="text-xs text-[var(--color-fg-subtle)]">No video</span>
                  )}
                </div>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Password */}
            <div className="rounded-xl border border-[var(--color-border)] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <LockIcon className="h-5 w-5 text-[var(--color-fg-muted)]" />
                <div>
                  <h4 className="font-semibold text-[var(--color-fg)] text-sm">Password Protection</h4>
                  <p className="text-xs text-[var(--color-fg-muted)]">
                    Optional shared access key
                  </p>
                </div>
              </div>

              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasPassword ? '••••••••' : 'Enter password (optional)'}
              />

              {isEditing && hasPassword && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removePassword}
                    onChange={(e) => setRemovePassword(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)]"
                  />
                  <span className="text-[var(--color-fg)]">Remove password protection</span>
                </label>
              )}
            </div>

            {/* Save for future reference - only show when creating */}
            {!isEditing && (
              <div className="rounded-xl border border-[var(--color-border)] p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveForFutureReference}
                    onChange={(e) => setSaveForFutureReference(e.target.checked)}
                    className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-accent)] mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-[var(--color-fg)] text-sm block">
                      Save for future reference
                    </span>
                    <span className="text-xs text-[var(--color-fg-muted)]">
                      Add to the Assignments library for reuse in other challenges
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !internalTitle.trim()}>
              {isSubmitting && <Spinner size="sm" className="mr-2" />}
              {isEditing ? 'Save Changes' : 'Create Assignment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper to convert video URLs to embed URLs
function getEmbedUrl(url: string): string {
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v')
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
    return `https://player.vimeo.com/video/${videoId}`
  }
  return url
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  )
}
