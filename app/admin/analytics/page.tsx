import { Suspense } from 'react'
import { AnalyticsDashboard } from './analytics-dashboard'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-fg)]">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Track engagement and usage across your challenges and assignments.
        </p>
      </div>

      <Suspense fallback={<AnalyticsLoadingSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-80 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />

      {/* Table skeleton */}
      <div className="h-96 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
    </div>
  )
}
