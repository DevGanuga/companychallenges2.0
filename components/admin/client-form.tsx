'use client'

import { useState, useEffect, useRef } from 'react'
import { Button, Input, Spinner } from '@/components/ui'
import { createClient, updateClient } from '@/lib/actions/clients'
import { uploadFile } from '@/lib/actions/upload'
import type { Client } from '@/lib/types/database'
import { cn } from '@/lib/utils/cn'

interface ClientFormProps {
  client?: Client | null
  open: boolean
  onClose: () => void
  onSuccess?: (client: Client) => void
}

export function ClientForm({ client, open, onClose, onSuccess }: ClientFormProps) {
  const isEditing = !!client
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(client?.name ?? '')
  const [logoUrl, setLogoUrl] = useState(client?.logo_url ?? '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when opening
  useEffect(() => {
    if (open && !isEditing) {
      setName('')
      setLogoUrl('')
      setError(null)
    }
  }, [open, isEditing])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadFile(formData, 'clients')

      if (result.success) {
        setLogoUrl(result.url)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to upload file')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = isEditing
        ? await updateClient(client.id, { name, logo_url: logoUrl || null })
        : await createClient({ name, logo_url: logoUrl || null })

      if (result.success) {
        onSuccess?.(result.data)
        onClose()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4">
        <div className="rounded-xl bg-[var(--color-bg-elevated)] shadow-xl border border-[var(--color-border)]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-fg)]">
              {isEditing ? 'Edit Client' : 'New Client'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] transition-colors"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="rounded-lg bg-[var(--color-error-subtle)] px-4 py-3 text-sm text-[var(--color-error)]">
                {error}
              </div>
            )}

            {/* Name */}
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client name"
              required
              autoFocus
            />

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-fg)]">
                Logo
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden",
                  logoUrl
                    ? "border-[var(--color-border)] bg-[var(--color-bg)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-muted)]"
                )}>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-[var(--color-fg-subtle)]" />
                  )}
                </div>

                {/* Upload controls */}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Uploading...
                        </>
                      ) : (
                        'Upload'
                      )}
                    </Button>
                    {logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogoUrl('')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting && <Spinner size="sm" className="mr-2" />}
                {isEditing ? 'Save' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}
