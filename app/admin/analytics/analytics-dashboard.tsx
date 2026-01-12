'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  getOverviewStats,
  getChallengeStats,
  getDailyViewCounts,
  exportAnalyticsCSV,
  type OverviewStats,
  type ChallengeStats,
  type DateRange
} from '@/lib/actions/admin-analytics'

// Date range presets
const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: 0 },
] as const

export function AnalyticsDashboard() {
  const [selectedPreset, setSelectedPreset] = useState(1) // Default to 30 days
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null)
  const [challengeStats, setChallengeStats] = useState<ChallengeStats[]>([])
  const [dailyData, setDailyData] = useState<{ date: string; views: number; uniqueSessions: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Calculate date range from preset
  const getDateRange = (days: number): DateRange | undefined => {
    if (days === 0) return undefined
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    return {
      from: from.toISOString(),
      to: to.toISOString()
    }
  }

  // Load data on mount and when preset changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const preset = DATE_PRESETS[selectedPreset]
      const dateRange = getDateRange(preset.days)

      const [overview, challenges, daily] = await Promise.all([
        getOverviewStats(dateRange),
        getChallengeStats(dateRange),
        getDailyViewCounts(undefined, preset.days || 365)
      ])

      setOverviewStats(overview)
      setChallengeStats(challenges)
      setDailyData(daily)
      setIsLoading(false)
    }

    loadData()
  }, [selectedPreset])

  // Export handler
  const handleExport = () => {
    startTransition(async () => {
      const preset = DATE_PRESETS[selectedPreset]
      const dateRange = getDateRange(preset.days)
      const csv = await exportAnalyticsCSV(undefined, dateRange)

      if (csv) {
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Date Range Selector */}
        <div className="flex gap-2 p-1 bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)]">
          {DATE_PRESETS.map((preset, index) => (
            <button
              key={preset.label}
              onClick={() => setSelectedPreset(index)}
              className={`relative rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                selectedPreset === index
                  ? 'bg-[var(--color-bg)] text-[var(--color-fg)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm font-medium text-[var(--color-fg)] shadow-[var(--shadow-xs)] transition-all duration-150 hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          <DownloadIcon className={`h-4 w-4 ${isPending ? 'animate-bounce' : ''}`} />
          {isPending ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Overview Stats */}
      {overviewStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-stagger">
          <StatCard
            title="Challenge Views"
            value={overviewStats.totalChallengeViews}
            icon={<EyeIcon className="h-5 w-5" />}
            color="indigo"
          />
          <StatCard
            title="Assignment Views"
            value={overviewStats.totalAssignmentViews}
            icon={<FileIcon className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Media Plays"
            value={overviewStats.totalMediaPlays}
            icon={<PlayIcon className="h-5 w-5" />}
            color="emerald"
          />
          <StatCard
            title="Unique Sessions"
            value={overviewStats.uniqueSessions}
            icon={<UsersIcon className="h-5 w-5" />}
            color="amber"
          />
        </div>
      )}

      {/* Simple Chart */}
      {dailyData.length > 0 && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] animate-slide-up delay-100">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-fg)]">Views Over Time</h3>
          <SimpleBarChart data={dailyData} />
        </div>
      )}

      {/* Challenge Stats Table */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] animate-slide-up delay-200 overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-6 py-4 bg-[var(--color-bg-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">Challenge Performance</h3>
        </div>

        {challengeStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-muted)] mb-4">
              <ChartIcon className="h-8 w-8 text-[var(--color-fg-subtle)]" />
            </div>
            <p className="text-sm text-[var(--color-fg-muted)] max-w-[280px]">
              No analytics data yet. Views will appear here once challenges are visited.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
                  <th className="px-6 py-3">Challenge</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3 text-right">Views</th>
                  <th className="px-6 py-3 text-right">Unique Sessions</th>
                  <th className="px-6 py-3 text-right">Assignment Views</th>
                  <th className="px-6 py-3 text-right">Media Plays</th>
                  <th className="px-6 py-3 text-right">Completions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {challengeStats.map((stat, index) => (
                  <tr
                    key={stat.challengeId}
                    className="hover:bg-[var(--color-bg-subtle)] transition-colors duration-100"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/analytics/challenge/${stat.challengeId}`}
                        className="font-medium text-[var(--color-fg)] hover:text-[var(--color-accent)] transition-colors"
                      >
                        {stat.challengeName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-fg-muted)]">
                      {stat.clientName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-sm font-medium rounded-[var(--radius-md)]">
                        {stat.totalViews.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--color-fg-muted)] tabular-nums">
                      {stat.uniqueSessions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--color-fg-muted)] tabular-nums">
                      {stat.assignmentViews.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--color-fg-muted)] tabular-nums">
                      {stat.mediaPlays.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--color-fg-muted)] tabular-nums">
                      {stat.completions.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Color mappings for stat cards
const colorMap = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/20'
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20'
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20'
  }
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color = 'indigo'
}: {
  title: string
  value: number
  icon: React.ReactNode
  color?: keyof typeof colorMap
}) {
  const colors = colorMap[color]

  return (
    <div className="group rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-hover)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] ${colors.bg} ${colors.text} ring-1 ${colors.ring} transition-transform duration-200 group-hover:scale-110`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-fg-muted)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--color-fg)] tabular-nums animate-count-up">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

// Simple Bar Chart Component (CSS-based, no external deps)
function SimpleBarChart({
  data
}: {
  data: { date: string; views: number; uniqueSessions: number }[]
}) {
  const maxViews = Math.max(...data.map(d => d.views), 1)

  // Show only last 14 days for readability
  const displayData = data.slice(-14)

  return (
    <div className="h-52">
      <div className="flex h-full items-end gap-1.5">
        {displayData.map((day, index) => {
          const height = (day.views / maxViews) * 100
          return (
            <div
              key={day.date}
              className="group relative flex-1"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div
                className="w-full rounded-t-[var(--radius-sm)] bg-gradient-to-t from-[var(--color-accent)] to-[var(--color-accent-hover)] transition-all duration-200 hover:from-[var(--color-accent-hover)] hover:to-[var(--color-accent)] animate-slide-up origin-bottom"
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 z-10">
                <div className="whitespace-nowrap rounded-[var(--radius-lg)] bg-[var(--color-fg)] px-3 py-2 text-xs text-[var(--color-bg)] shadow-[var(--shadow-lg)]">
                  <div className="font-semibold">{formatDate(day.date)}</div>
                  <div className="mt-0.5 text-[var(--color-fg-inverse)]/80">{day.views} views</div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-[var(--color-fg)]" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* X-axis labels */}
      <div className="mt-3 flex justify-between text-xs font-medium text-[var(--color-fg-muted)]">
        <span>{formatDate(displayData[0]?.date || '')}</span>
        <span>{formatDate(displayData[displayData.length - 1]?.date || '')}</span>
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Controls skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-[var(--radius-md)] skeleton" />
          ))}
        </div>
        <div className="h-10 w-32 rounded-[var(--radius-lg)] skeleton" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[88px] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-[var(--radius-lg)] skeleton" />
              <div className="space-y-2">
                <div className="h-4 w-20 skeleton skeleton-text" />
                <div className="h-6 w-16 skeleton skeleton-text" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-80 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 animate-slide-up delay-200">
        <div className="h-4 w-32 skeleton skeleton-text mb-4" />
        <div className="h-52 flex items-end gap-1.5">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[var(--radius-sm)] skeleton"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden animate-slide-up delay-300">
        <div className="border-b border-[var(--color-border)] px-6 py-4 bg-[var(--color-bg-subtle)]">
          <div className="h-4 w-40 skeleton skeleton-text" />
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-48 skeleton skeleton-text" />
              <div className="h-4 w-24 skeleton skeleton-text" />
              <div className="flex-1" />
              <div className="h-4 w-12 skeleton skeleton-text" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Icons
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}
