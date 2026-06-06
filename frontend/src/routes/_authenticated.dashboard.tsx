import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, AlertCircle, CalendarCheck, TrendingUp, CheckCircle2 } from 'lucide-react'
import { subjectService } from '@/services/subjectService'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

// ─── Small stat card ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  linkTo,
  sublabel,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  variant?: 'default' | 'warning' | 'danger'
  linkTo?: string
  sublabel?: string
}) {
  const colorClass =
    variant === 'danger'
      ? 'text-destructive'
      : variant === 'warning'
      ? 'text-amber-600'
      : 'text-foreground'

  const iconColorClass =
    variant === 'danger'
      ? 'text-destructive'
      : variant === 'warning'
      ? 'text-amber-500'
      : 'text-muted-foreground'

  const inner = (
    <Card className={linkTo ? 'hover:border-primary/50 transition-colors cursor-pointer' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
        {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
      </CardContent>
    </Card>
  )

  return linkTo ? <Link to={linkTo}>{inner}</Link> : inner
}

// ─── Horizontal bar row ────────────────────────────────────────────────────
function MetricBar({
  label,
  value,
  max,
  unit,
  colorClass = 'bg-primary',
}: {
  label: string
  value: number
  max: number
  unit: string
  colorClass?: string
}) {
  const pct = max > 0 ? Math.min(100, Math.max(4, (value / max) * 100)) : 4
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">
          {value} <span className="font-normal opacity-60">{unit}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
function DashboardPage() {
  const { data: dash, isLoading } = useQuery({
    queryKey: ['dashboard', 'data'],
    queryFn: () => dashboardService.getDashboard(),
    refetchInterval: 60_000,
  })

  const { data: subjectsList } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
  })

  const subjectsMap = React.useMemo(
    () =>
      (subjectsList || []).reduce((acc: Record<number, string>, s: any) => {
        acc[s.id] = s.subjectName
        return acc
      }, {}),
    [subjectsList],
  )

  const processedLectures = dash?.completedLectures ?? 0
  const pendingRevisions  = dash?.pendingRevisionsCount ?? 0   // ← new field from backend
  const upcomingDeadlines = dash?.upcomingDeadlines?.length ?? 0

  // Metrics panel — all sourced correctly now
  const studyMinutesWeek    = dash?.studyHoursThisWeek ?? 0    // minutes, not hours
  const totalSessions       = dash?.totalStudySessions ?? 0
  const completedSessions   = dash?.completedStudySessions ?? 0
  const progressPct         = dash?.progressPercentage ?? 0

  const metricsMax = Math.max(studyMinutesWeek, totalSessions, completedSessions, 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your academic progress.</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* ── Top stat cards ── */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Lectures processed"
              value={processedLectures}
              icon={BookOpen}
              linkTo="/lectures"
              sublabel="Click to view all lectures"
            />
            <StatCard
              label="Pending revisions"
              value={pendingRevisions}
              icon={Clock}
              variant={pendingRevisions > 10 ? 'warning' : 'default'}
              linkTo="/revisions"
              sublabel={pendingRevisions > 0 ? 'Click to start revising' : 'All caught up!'}
            />
            <StatCard
              label="Upcoming deadlines"
              value={upcomingDeadlines}
              icon={AlertCircle}
              variant={upcomingDeadlines > 0 ? 'danger' : 'default'}
              linkTo="/deadlines"
              sublabel={upcomingDeadlines > 0 ? 'Action required' : 'No deadlines soon'}
            />
          </div>

          {/* ── Progress + metrics ── */}
          <div className="grid gap-4 md:grid-cols-2">

            {/* Study progress card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Study Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Big progress ring alternative — simple % display */}
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">{progressPct}%</span>
                  <span className="text-sm text-muted-foreground pb-1">of study plan completed</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {completedSessions} sessions done
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="h-3 w-3" />
                    {totalSessions} total planned
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Weekly metrics card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricBar
                  label="Study time"
                  value={studyMinutesWeek}
                  max={metricsMax}
                  unit="min"
                  colorClass="bg-primary"
                />
                <MetricBar
                  label="Sessions completed"
                  value={completedSessions}
                  max={metricsMax}
                  unit="sessions"
                  colorClass="bg-emerald-500"
                />
                <MetricBar
                  label="Total sessions planned"
                  value={totalSessions}
                  max={metricsMax}
                  unit="sessions"
                  colorClass="bg-muted-foreground/40"
                />
              </CardContent>
            </Card>
          </div>

          {/* ── Today's plan preview (if available) ── */}
          {dash?.todayStudyPlan && dash.todayStudyPlan.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Today's Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {dash.todayStudyPlan.map((plan: any) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-sm"
                    >
                      <span className="font-medium">{subjectsMap[plan.subjectId] || `Subject ${plan.subjectId}`}</span>
                      <span className="text-muted-foreground text-xs">{plan.durationMinutes}m</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
