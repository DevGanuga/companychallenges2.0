import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { getDashboardStats, getRecentActivity } from '@/lib/actions/dashboard'

export default async function AdminDashboard() {
  const [stats, activities] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(5),
  ])

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-fg)]">Dashboard</h1>
        <p className="mt-1 text-[var(--color-fg-muted)]">
          Welcome to Company Challenges admin panel.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-stagger">
        <DashboardStatCard
          title="Total Clients"
          value={stats.totalClients}
          description="Organizations using the platform"
          icon={<BuildingIconSmall />}
          color="indigo"
        />
        <DashboardStatCard
          title="Active Challenges"
          value={stats.activeChallenges}
          description="Learning trajectories available"
          icon={<FlagIconSmall />}
          color="blue"
        />
        <DashboardStatCard
          title="Total Assignments"
          value={stats.totalAssignments}
          description="Reusable content units"
          icon={<FileIconSmall />}
          color="emerald"
        />
        <DashboardStatCard
          title="This Month"
          value={stats.thisMonthViews}
          description="Challenge views"
          icon={<ChartIconSmall />}
          color="amber"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up delay-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <QuickAction
              title="Create a Client"
              description="Add a new organization to the platform"
              href="/admin/clients"
              icon={<BuildingIconSmall />}
            />
            <QuickAction
              title="Create a Challenge"
              description="Start building a new learning trajectory"
              href="/admin/challenges"
              icon={<FlagIconSmall />}
            />
            <QuickAction
              title="Create an Assignment"
              description="Add reusable content to the library"
              href="/admin/assignments"
              icon={<FileIconSmall />}
            />
          </CardContent>
        </Card>

        <Card className="animate-slide-up delay-300">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest changes in the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-muted)] mb-3">
                  <ClockIconSmall />
                </div>
                <p className="text-sm text-[var(--color-fg-muted)]">
                  No recent activity to display.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Color mappings for dashboard cards
const dashboardColorMap = {
  indigo: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400',
  blue: 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
  emerald: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
}

function DashboardStatCard({
  title,
  value,
  description,
  icon,
  color = 'indigo'
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  color?: keyof typeof dashboardColorMap
}) {
  return (
    <Card className="group overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="font-medium">{title}</CardDescription>
          <div className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] ${dashboardColorMap[color]} transition-transform duration-200 group-hover:scale-110`}>
            {icon}
          </div>
        </div>
        <CardTitle className="text-3xl font-bold tabular-nums">{value.toLocaleString()}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-[var(--color-fg-muted)]">{description}</p>
      </CardContent>
    </Card>
  )
}

function QuickAction({ title, description, href, icon }: { title: string; description: string; href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 transition-all duration-200 hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-[var(--color-fg)]">{title}</p>
        <p className="text-sm text-[var(--color-fg-muted)]">{description}</p>
      </div>
      <svg className="h-5 w-5 text-[var(--color-fg-subtle)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  )
}

function ActivityItem({ activity }: { activity: { id: string; type: string; title: string; timestamp: string } }) {
  const timeAgo = getTimeAgo(activity.timestamp)

  const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
    client_created: {
      icon: <BuildingIconSmall />,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
    },
    challenge_created: {
      icon: <FlagIconSmall />,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    challenge_archived: {
      icon: <ArchiveIconSmall />,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    },
    assignment_created: {
      icon: <FileIconSmall />,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
  }

  const activityIcon = iconMap[activity.type] || iconMap.assignment_created

  return (
    <div className="group flex items-start gap-3 p-2 -mx-2 rounded-[var(--radius-lg)] transition-colors hover:bg-[var(--color-bg-subtle)]">
      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] ${activityIcon.color} transition-transform duration-200 group-hover:scale-110`}>
        {activityIcon.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-fg)] truncate">{activity.title}</p>
        <p className="text-xs text-[var(--color-fg-muted)]">{timeAgo}</p>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`

  return date.toLocaleDateString()
}

// Small icons for dashboard
function BuildingIconSmall() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
    </svg>
  )
}

function FlagIconSmall() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  )
}

function FileIconSmall() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function ChartIconSmall() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

function ArchiveIconSmall() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )
}

function ClockIconSmall() {
  return (
    <svg className="h-5 w-5 text-[var(--color-fg-subtle)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}
