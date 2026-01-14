'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Spinner } from '@/components/ui'
import { deleteClient } from '@/lib/actions/clients'
import type { Client } from '@/lib/types/database'

interface ClientListProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: () => void
}

export function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async (e: React.MouseEvent, client: Client) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${client.name}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(client.id)
    setDeleteError(null)

    try {
      const result = await deleteClient(client.id)
      if (result.success) {
        onDelete()
      } else {
        setDeleteError(result.error ?? 'Failed to delete client')
      }
    } catch {
      setDeleteError('An unexpected error occurred')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (e: React.MouseEvent, client: Client) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit(client)
  }

  if (clients.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <div className="rounded-lg bg-[var(--color-error-subtle)] p-3 text-sm text-[var(--color-error)]">
          {deleteError}
        </div>
      )}

      <div className="divide-y divide-[var(--color-border)]">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/admin/clients/${client.id}`}
            className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {client.logo_url ? (
                <img
                  src={client.logo_url}
                  alt={`${client.name} logo`}
                  className="h-10 w-10 rounded-lg object-contain bg-[var(--color-bg-muted)]"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-muted)] text-sm font-medium text-[var(--color-fg-muted)]">
                  {client.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-fg)] truncate">{client.name}</p>
                <p className="text-xs text-[var(--color-fg-subtle)]">
                  Created {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleEdit(e, client)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDelete(e, client)}
                disabled={deletingId === client.id}
                className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-subtle)]"
              >
                {deletingId === client.id ? (
                  <Spinner size="sm" />
                ) : (
                  'Delete'
                )}
              </Button>
              <ChevronRightIcon className="h-5 w-5 text-[var(--color-fg-subtle)]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}
